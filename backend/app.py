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
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa, padding
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
print(db)
users_collection = db.users

# Blockchain setup
infura_url = os.getenv("INFURA_URL")
web3 = Web3(Web3.HTTPProvider(infura_url))
contract_address = os.getenv("CONTRACT_ADDRESS")
with open("abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)
contract = web3.eth.contract(address=contract_address, abi=contract_abi)


def generate_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537, key_size=2048, backend=default_backend())
    public_key = private_key.public_key()
    return private_key, public_key


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
    wallet_address = data.get("walletAddress")

    # Validating required fields
    if not first_name or not last_name or not email or not phone or not wallet_address:
        return jsonify({"error": "First name, last name, email, phone, and wallet address are required"}), 400

    # Check if user with the same email already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 400

    # Generate private and public key pair
    private_key, public_key = generate_key_pair()
    private_key_pem, public_key_pem = serialize_keys(private_key, public_key)

    # Insert user data into the database
    users_collection.insert_one({
        "first_name": first_name,
        "last_name": last_name,
        "email": email,
        "phone": phone,
        "age": age,
        "dob": dob,
        "address": address,
        "aadhar": aadhar,
        "wallet_address": wallet_address,
        "public_key": public_key_pem.decode()  # Store only public key in DB
    })

    # Return private key to the frontend
    return jsonify({
        "message": "User registered successfully",
        "private_key": private_key_pem.decode()
    }), 201


@app.route("/login", methods=["POST"])
def login_user():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    email = data.get("email")
    private_key_input = data.get("private_key")
    
    if not email or not private_key_input:
        return jsonify({"error": "Email and private key are required"}), 400

    # Find user in the database
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    stored_public_key_pem = user["public_key"]

    try:
        # Deserialize the input private key and stored public key
        private_key = serialization.load_pem_private_key(
            private_key_input.encode('utf-8'),
            password=None,
            backend=default_backend()
        )
        public_key = serialization.load_pem_public_key(
            stored_public_key_pem.encode('utf-8'),
            backend=default_backend()
        )

        # Derive the public key from the private key
        derived_public_key = private_key.public_key()

        # Compare public key bytes
        if public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo) == derived_public_key.public_bytes(
                encoding=serialization.Encoding.PEM,
                format=serialization.PublicFormat.SubjectPublicKeyInfo):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid key pair"}), 401

    except Exception as e:
        return jsonify({"error": "Key validation error", "details": str(e)}), 400


@app.route("/upload", methods=["POST"])
def upload_document():
    data = request.json
    patient_address = data["patient_address"]
    report_hash = data["report_hash"]
    private_key = data["private_key"]

    nonce = web3.eth.get_transaction_count(
        web3.eth.account.from_key(private_key).address)
    tx = contract.functions.addReportByPatient(patient_address, report_hash).buildTransaction({
        "from": web3.eth.account.from_key(private_key).address,
        "nonce": nonce,
        "gas": 2000000,
        "gasPrice": web3.toWei('20', 'gwei')
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    web3.eth.wait_for_transaction_receipt(tx_hash)

    documents_collection.insert_one({
        "patient_address": patient_address,
        "ipfs_hash": report_hash,
        "upload_date": datetime.utcnow(),
        "approved": False
    })

    return jsonify({"message": "Document uploaded successfully", "ipfs_hash": report_hash})


@app.route("/approve", methods=["POST"])
def approve_document():
    data = request.json
    patient_address = data["patient_address"]
    report_hash = data["report_hash"]
    private_key = data["private_key"]

    nonce = web3.eth.get_transaction_count(
        web3.eth.account.from_key(private_key).address)
    tx = contract.functions.approveReport(patient_address, report_hash).buildTransaction({
        "from": web3.eth.account.from_key(private_key).address,
        "nonce": nonce,
        "gas": 2000000,
        "gasPrice": web3.toWei('20', 'gwei')
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    web3.eth.wait_for_transaction_receipt(tx_hash)

    documents_collection.update_one(
        {"patient_address": patient_address, "ipfs_hash": report_hash},
        {"$set": {"approved": True, "approval_date": datetime.utcnow()}}
    )

    return jsonify({"message": "Document approved successfully"})


@app.route("/get-documents", methods=["GET"])
def get_documents():
    """
    API to fetch documents for a given patient address.
    """
    patient_address = request.args.get("patient_address")

    if not patient_address:
        return jsonify({"error": "Patient address is required"}), 400

    try:
        # Call the contract function
        documents = contract.functions.getReports(patient_address).call()
        print(documents)
        if not documents:
            return jsonify({"message": "No documents found for this patient"}), 200

        # Format and return the documents
        formatted_documents = [
            {
                "ipfs_hash": doc[0],
                "uploaded_by": doc[1],
                "approved": doc[2],
                "added_by_patient": doc[3]
            }
            for doc in documents
        ]

        return jsonify({"documents": "Files"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route("/add-patient-document", methods=["POST"])
def add_patient_document():
    """
    API for patients to add their own documents to the blockchain.
    """
    data = request.json
    patient_address = data.get("patient_address")
    report_hash = data.get("report_hash")
    private_key = data.get("private_key")

    if not patient_address or not report_hash or not private_key:
        return jsonify({"error": "Patient address, report hash, and private key are required"}), 400

    try:
        # Build the transaction
        nonce = web3.eth.get_transaction_count(
            web3.eth.account.from_key(private_key).address)
        tx = contract.functions.addReportByPatient(patient_address, report_hash).buildTransaction({
            "from": web3.eth.account.from_key(private_key).address,
            "nonce": nonce,
            "gas": 2000000,
            "gasPrice": web3.toWei('20', 'gwei')
        })

        # Sign and send the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
        web3.eth.wait_for_transaction_receipt(tx_hash)

        # Save document details to MongoDB
        documents_collection.insert_one({
            "patient_address": patient_address,
            "ipfs_hash": report_hash,
            "upload_date": datetime.utcnow(),
            "approved": False,
            "added_by_patient": True
        })

        return jsonify({
            "message": "Document added successfully by patient",
            "transaction_hash": tx_hash.hex(),
            "ipfs_hash": report_hash
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500


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
