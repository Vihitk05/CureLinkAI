from datetime import datetime
import json
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
from langchain_openai import ChatOpenAI
import os
from web3 import Web3
from pymongo import MongoClient
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.backends import default_backend
from scraping import *

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure the language model
together_model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.getenv("TOGETHER_API_KEY"),
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)

# Load the trained model and TF-IDF vectorizer
model = joblib.load('models/disease_prediction_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

# Load the dataset with diseases and drugs
medicine_df = pd.read_csv('models/disease_drug_data.csv')

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client.curelink
documents_collection = db.documents
users_collection = db.users

# Blockchain setup
infura_url = os.getenv("INFURA_URL")
web3 = Web3(Web3.HTTPProvider("HTTP://127.0.0.1:7545"))
# web3 = Web3(Web3.HTTPProvider(infura_url))
contract_address = os.getenv("CONTRACT_ADDRESS")
with open("abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Function to generate a unique numeric ID
def generate_unique_id():
    last_user = users_collection.find_one(sort=[("id", -1)])
    return (last_user["id"] + 1) if last_user else 1

# Function to generate key pair
def generate_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537, key_size=2048, backend=default_backend())
    public_key = private_key.public_key()
    return private_key, public_key

# Function to serialize keys
def serialize_keys(private_key, public_key):
    private_key_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.TraditionalOpenSSL,
        encryption_algorithm=serialization.NoEncryption()
    )
    public_key_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    return private_key_pem, public_key_pem

# Register API
@app.route("/register", methods=["POST"])
def register_user():
    data = request.json

    # Extracting all fields from the frontend
    first_name = data.get("firstName")
    last_name = data.get("lastName")
    email = data.get("email")
    phone = data.get("phone")
    age = data.get("age")
    dob = data.get("dob")
    address = data.get("address")
    aadhar = data.get("aadhar")

    # Validating required fields
    if not first_name or not last_name or not email or not phone:
        return jsonify({"error": "First name, last name, email, and phone are required"}), 400

    # Check if user with the same email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 400

    # Generate unique numeric ID
    user_id = generate_unique_id()

    # Generate private and public key pair
    private_key, public_key = generate_key_pair()
    private_key_pem, public_key_pem = serialize_keys(private_key, public_key)

    # Insert user data into the database
    users_collection.insert_one({
        "id": user_id,  # Unique numeric ID
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "age": age,
        "dob": dob,
        "address": address,
        "aadhar": aadhar,
        "public_key": public_key_pem.decode()  # Store only public key in DB
    })

    # Return private key and user ID to the frontend
    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id,
        "private_key": private_key_pem.decode()
    }), 201


@app.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    private_key_input = data.get("private_key")
    
    if not private_key_input:
        return jsonify({"error": "Private key is required"}), 400

    try:
        # Deserialize the input private key
        private_key = serialization.load_pem_private_key(
            private_key_input.encode('utf-8'),
            password=None,
            backend=default_backend()
        )

        # Derive the public key from the private key
        derived_public_key = private_key.public_key()
        derived_public_key_pem = derived_public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ).decode('utf-8')

        # Find the user in the database using the derived public key
        user = users_collection.find_one({"public_key": derived_public_key_pem})
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Return user information
        return jsonify({
            "message": "Login successful",
            "user_id": user["id"],
            "first_name": user["first_name"],
            "last_name": user["last_name"],
            "email": user["email"]
        }), 200

    except Exception as e:
        return jsonify({"error": "Key validation error", "details": str(e)}), 400


# Upload API (updated for multiple IPFS hashes and new fields)
@app.route("/upload", methods=["POST"])
def upload_document():
    data = request.json
    patient_id = data["patient_id"]
    report_hashes = data["report_hashes"]  # Array of IPFS hashes
    disease = data["disease"]
    hospital = data["hospital"]
    treatment = data["treatment"]
    treatment_date = data["treatment_date"]

    # Call the contract function
    try:
        tx = contract.functions.addReportByDoctor(
            patient_id,
            report_hashes,
            disease,
            hospital,
            treatment,
            treatment_date
        ).buildTransaction({
            "from": web3.eth.accounts[0],  # Use a default account (configured in your node)
            "gas": 2000000,
            "gasPrice": web3.toWei('20', 'gwei')
        })
        signed_tx = web3.eth.account.sign_transaction(tx, os.getenv("PRIVATE_KEY"))  # Use a server-side private key
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        web3.eth.wait_for_transaction_receipt(tx_hash)

        # Save document details to MongoDB
        documents_collection.insert_one({
            "patient_id": patient_id,
            "ipfs_hashes": report_hashes,
            "disease": disease,
            "hospital": hospital,
            "treatment": treatment,
            "treatment_date": treatment_date,
            "upload_date": datetime.utcnow(),
            "approved": False
        })

        return jsonify({"message": "Document uploaded successfully", "ipfs_hashes": report_hashes}), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/add-patient-document", methods=["POST"])
def add_patient_document():
    data = request.json
    email = data.get("email")
    report_hashes = data.get("report_hashes")  # Array of IPFS hashes
    disease = data.get("disease")
    hospital = data.get("hospital")
    treatment = data.get("treatment")
    treatment_date = data.get("treatment_date")

    if not email or not report_hashes or not disease or not hospital or not treatment or not treatment_date:
        return jsonify({"error": "All fields are required"}), 400

    try:
        # Find the user by email to get the patient_id
        user = users_collection.find_one({"email": email})
        if not user:
            return jsonify({"error": "User not found"}), 404

        patient_id = user["id"]

        # Load the private key from environment variables
        private_key = os.getenv("PRIVATE_KEY")
        if not private_key:
            return jsonify({"error": "Private key not found"}), 400

        # Derive the sender address from the private key
        account = web3.eth.account.from_key(private_key)
        sender_address = account.address

        # Get the nonce for the sender address
        nonce = web3.eth.get_transaction_count(sender_address)

        # Build the transaction
        tx = contract.functions.addReportByPatient(
            patient_id,  # uint256
            report_hashes,  # string[]
            disease,  # string
            hospital,  # string
            treatment,  # string
            treatment_date  # string
        ).build_transaction({
            "from": sender_address,  # Use the address derived from the private key
            "gas": 2000000,
            "gasPrice": web3.to_wei('20', 'gwei'),
            "nonce": nonce,  # Include the nonce
        })

        # Sign and send the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        web3.eth.wait_for_transaction_receipt(tx_hash)

        # Save document details to MongoDB
        documents_collection.insert_one({
            "patient_id": patient_id,
            "ipfs_hashes": report_hashes,
            "disease": disease,
            "hospital": hospital,
            "treatment": treatment,
            "treatment_date": treatment_date,
            "upload_date": datetime.utcnow(),
            "approved": True,
            "added_by_patient": True
        })

        return jsonify({
            "message": "Document added successfully by patient",
            "transaction_hash": tx_hash.hex(),
            "ipfs_hashes": report_hashes
        }), 201

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500

# Approve API (updated for patientId)
@app.route("/approve", methods=["POST"])
def approve_document():
    data = request.json
    patient_id = data["patient_id"]
    report_hash = data["report_hash"]
    private_key = data["private_key"]

    nonce = web3.eth.get_transaction_count(web3.eth.account.from_key(private_key).address)
    tx = contract.functions.approveReport(patient_id, report_hash).buildTransaction({
        "from": web3.eth.account.from_key(private_key).address,
        "nonce": nonce,
        "gas": 2000000,
        "gasPrice": web3.toWei('20', 'gwei')
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    web3.eth.wait_for_transaction_receipt(tx_hash)

    documents_collection.update_one(
        {"patient_id": patient_id, "ipfs_hash": report_hash},
        {"$set": {"approved": True, "approval_date": datetime.utcnow()}}
    )

    return jsonify({"message": "Document approved successfully"})

@app.route("/get-documents", methods=["GET"])
def get_documents():
    patient_id = request.args.get("patient_id")

    if not patient_id:
        return jsonify({"error": "Patient ID is required"}), 400

    try:
        print("Contract Address:", contract_address)
        print("Available Contract Functions:", [func.fn_name for func in contract.functions])

        if not web3.is_connected():
            return jsonify({"error": "Failed to connect to blockchain"}), 500

        patient_id = int(patient_id)  # Ensure integer

        # FIXED: Remove "from" when calling a view function
        reports = contract.functions.getReports(patient_id).transact({"from":"0xBF963EfCbC3F7E63dd630891EE2bBC67Eb3c8cB9"})

        print("Raw Reports:", reports)

        if not reports:
            return jsonify({"message": "No documents found for this patient"}), 200

        formatted_documents = [
            {
                "ipfs_hashes": report[0],
                "doctor_id": report[1],
                "approved": report[2],
                "added_by_patient": report[3],
                "disease": report[4],
                "hospital": report[5],
                "treatment": report[6],
                "treatment_date": report[7]
            }
            for report in reports
        ]

        return jsonify({"documents": formatted_documents}), 200

    except Exception as e:
        print("Error:", str(e))
        return jsonify({"error": str(e)}), 500


# Other APIs (unchanged)
@app.route("/fetch-medicines", methods=["POST"])
def fetch_medicine():
    try:
        data = request.get_json()
        search = data.get("search")

        one_mg_data = one_mg(str(search).replace(" ","%20").strip())
        apollopharmacy_data = apollopharmacy(str(search))
        pharmeasy_data = pharmeasy(str(search).replace(" ","%20").strip())
        
        return jsonify({
            "success":True,
            "one_mg":one_mg_data,
            "apollopharmacy":apollopharmacy_data,
            "pharmeasy":pharmeasy_data
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"success":False,"message":str(e)}),500


@app.route('/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.json
    input_sentence = data.get('symptoms', '')

    # Check if the input sentence is empty
    if not input_sentence:
        return jsonify({"error": "Input sentence is required"}), 400

    try:
        # Transform the input sentence using the TF-IDF vectorizer
        transformed_input = vectorizer.transform([input_sentence])

        # Predict the disease using the trained model
        predicted_disease = model.predict(transformed_input)[0]

        # Retrieve medicines for the predicted disease
        if predicted_disease in medicine_df['disease'].values:
            drugs_for_disease = medicine_df[medicine_df['disease'] == predicted_disease]['drug'].tolist()
        else:
            drugs_for_disease = []

        # Generate a detailed response using the language model
        ai_response = together_model.invoke(
            f"""
            Act as a doctor who gives response in simple and easy to understand language. Based on the detected disease ({predicted_disease}),
            here are the recommended medicines: {drugs_for_disease}.
            Please provide additional information about the disease and treatment options
            in the following format:
            Predicted Disease:
            Recommended Medicines:
            Additional Information:
            When to see a doctor:
            """
        ).content

        # Format the response
        response = {
            "Doctor": {
                "disease": predicted_disease,
                "recommended_medicines": drugs_for_disease,
                "response": str(ai_response)
            }
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)