import base64
from datetime import datetime, timezone
from io import BytesIO
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
import qrcode
from utils import preprocess_text
import nltk
import ssl
import sys

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)
# Configure the language model with error handling
try:
    api_key = os.getenv("TOGETHER_API_KEY")
    if not api_key:
        raise ValueError("TOGETHER_API_KEY environment variable not set")
        
    together_model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key=os.getenv("TOGETHER_API_KEY"),
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)
except Exception as e:
    print(f"Failed to initialize Together AI client: {str(e)}")
    sys.exit(1)

# Verify NLTK resources
try:
    nltk.data.find('corpora/stopwords')
    nltk.data.find('corpora/wordnet')
except LookupError:
    print("NLTK resources missing - attempting to download...")
    try:
        nltk.download('stopwords')
        nltk.download('wordnet')
    except Exception as e:
        print(f"Failed to download NLTK resources: {str(e)}")
        sys.exit(1)

# Load model components
def load_model_with_dependencies():
    try:
        model_components = joblib.load('models/disease_predictor.pkl')
        return (
            model_components['model'],
            model_components['vectorizer'],
            model_components['label_encoder'],
            pd.read_csv('models/disease_drug_data.csv')
        )
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise

try:
    model, vectorizer, label_encoder, medicine_df = load_model_with_dependencies()
except Exception as e:
    print(f"Fatal error loading models: {str(e)}")
    sys.exit(1)

# Load the model components with custom unpickler
def load_model_with_dependencies():
    try:
        # Create a dictionary with the preprocessing function
        # that will be available during unpickling
        global preprocess_text
        
        # Load the saved model components
        model_components = joblib.load('models/disease_predictor.pkl')
        
        # Extract components
        model = model_components['model']
        vectorizer = model_components['vectorizer']
        label_encoder = model_components['label_encoder']
        
        # Load the medicine dataset
        medicine_df = pd.read_csv('models/disease_drug_data.csv')
        
        print("All models and data loaded successfully!")
        return model, vectorizer, label_encoder, medicine_df
        
    except Exception as e:
        print(f"Error loading models: {str(e)}")
        raise e

# Load models at startup
model, vectorizer, label_encoder, medicine_df = load_model_with_dependencies()

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client.curelink
documents_collection = db.documents
users_collection = db.users

# Blockchain setup
infura_url = os.getenv("INFURA_URL")
web3 = Web3(Web3.HTTPProvider(infura_url))
contract_address = os.getenv("CONTRACT_ADDRESS")
with open("abi.json", "r") as abi_file:
    contract_abi = json.load(abi_file)
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# Add this near your other MongoDB collection definitions
hospitals_collection = db.hospitals

def get_patient_name(patient_id):
    """Helper function to get patient name by ID"""
    patient = users_collection.find_one({"id": patient_id})
    if patient:
        return f"{patient.get('first_name', '')} {patient.get('last_name', '')}".strip()
    return "Unknown Patient"

# Add this route to fetch hospital data
@app.route("/api/hospital", methods=["GET"])
def get_hospital_data():
    try:
        # In a real app, you would get hospital_id from authentication/session
        hospital_id = request.args.get("hospital_id")
        
        if not hospital_id:
            return jsonify({"error": "Hospital ID is required"}), 400

        # Find hospital in database
        hospital = hospitals_collection.find_one({"id": int(hospital_id)})
        if not hospital:
            return jsonify({"error": "Hospital not found"}), 404

        # Prepare response data
        hospital_data = {
            "name": hospital["name"],
            "address": hospital["address"],
            "city": hospital["city"],
            "state": hospital["state"],
            "zipCode": hospital["zipCode"],
            "fullAddress": f"{hospital['address']}, {hospital['city']}, {hospital['state']} - {hospital['zipCode']}"
        }

        return jsonify(hospital_data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this route for hospital login
@app.route("/login-hospital", methods=["POST"])
def login_hospital():
    try:
        data = request.json
        
        # Validate required fields
        if not data.get("email") or not data.get("password"):
            return jsonify({"error": "Email and password are required"}), 400

        # Find hospital by email
        hospital = hospitals_collection.find_one({"email": data["email"]})
        if not hospital:
            return jsonify({"error": "Hospital not found"}), 404

        # In production, you would verify hashed password here
        if hospital["password"] != data["password"]:
            return jsonify({"error": "Invalid credentials"}), 401

        # Return success response with hospital data (excluding password)
        hospital_data = {
            "id": hospital["id"],
            "name": hospital["name"],
            "email": hospital["email"],
            "licenseNumber": hospital["licenseNumber"]
        }

        return jsonify({
            "message": "Login successful",
            "hospital": hospital_data
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Add this function near your other ID generation functions
def generate_hospital_id():
    last_hospital = hospitals_collection.find_one(sort=[("id", -1)])
    return (last_hospital["id"] + 1) if last_hospital else 1

# Add this new route for hospital registration
@app.route("/register-hospital", methods=["POST"])
def register_hospital():
    try:
        data = request.json
        
        # Validate required fields
        required_fields = [
            "name", "email", "password", "address", "city", 
            "state", "zipCode", "phone", "licenseNumber"
        ]
        for field in required_fields:
            if not data.get(field):
                return jsonify({"error": f"{field} is required"}), 400

        # Check if email already exists
        if hospitals_collection.find_one({"email": data["email"]}):
            return jsonify({"error": "Hospital with this email already exists"}), 400

        # Generate hospital ID
        hospital_id = generate_hospital_id()

        # Create hospital document (in a real app, you'd hash the password)
        hospital_doc = {
            "id": hospital_id,
            "name": data["name"],
            "email": data["email"],
            "password": data["password"],  # Note: In production, hash this password
            "address": data["address"],
            "city": data["city"],
            "state": data["state"],
            "zipCode": data["zipCode"],
            "phone": data["phone"],
            "licenseNumber": data["licenseNumber"],
            "description": data.get("description", ""),
            "registrationDate": datetime.now(timezone.utc),
            "approved": False  # For admin approval if needed
        }

        # Insert into MongoDB
        hospitals_collection.insert_one(hospital_doc)

        return jsonify({
            "message": "Hospital registered successfully",
            "hospital_id": hospital_id
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

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

# Function to generate a QR code image and return it as a base64 string
def generate_qr_code(data):
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(data)
    qr.make(fit=True)

    img = qr.make_image(fill_color="black", back_color="white")

    # Convert the image to a base64-encoded string
    buffered = BytesIO()
    img.save(buffered, format="PNG")
    return base64.b64encode(buffered.getvalue()).decode("utf-8")

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

    # Generate QR code for the private key
    private_key_str = private_key_pem.decode("utf-8")
    qr_code_base64 = generate_qr_code(private_key_str)

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
        "public_key": public_key_pem.decode("utf-8")  # Store only public key in DB
    })

    # Return private key, user ID, and QR code to the frontend
    return jsonify({
        "message": "User registered successfully",
        "user_id": user_id,
        "private_key": private_key_str,
        "qr_code": qr_code_base64  # Base64-encoded QR code image
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

# Upload API (updated for all contract fields)
@app.route("/upload", methods=["POST"])
def upload_document():
    data = request.json
    public_key = data["public_key"]  # Get public key from frontend
    report_hashes = data["report_hashes"]  # Array of IPFS hashes
    disease = data["disease"]
    hospital = data["hospital"]
    medication = data["medication"]
    treatment_date = data["treatment_date"]
    summary = data["summary"]
    doctor_name = data["doctor_name"]
    hospital_id = data["hospital_id"]
    uploaded_date = data["uploaded_date"]  # Should be in ISO format
    
    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        return jsonify({"error": "Private key not found"}), 400
    
    try:
        # Find patient by public key to get patient_id
        user = users_collection.find_one({"public_key": public_key})
        if not user:
            return jsonify({"error": "User not found"}), 404
        
        patient_id = user["id"]
        account = web3.eth.account.from_key(private_key)
        sender_address = account.address

        # Get the nonce for the sender address
        nonce = web3.eth.get_transaction_count(sender_address)
        
        # Call the contract function with all fields
        tx = contract.functions.addReportByDoctor(
            patient_id,
            report_hashes,
            disease,
            hospital,
            medication,
            treatment_date,
            summary,
            doctor_name,
            hospital_id,
            uploaded_date
        ).build_transaction({
            "from": sender_address,
            "gas": 2000000,
            "gasPrice": web3.to_wei('20', 'gwei'),
            "nonce": nonce,
        })
        
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        web3.eth.wait_for_transaction_receipt(tx_hash)

        # Save document details to MongoDB with all fields
        documents_collection.insert_one({
            "patient_id": patient_id,
            "report_hashes": report_hashes,
            "disease": disease,
            "hospital": hospital,
            "medication": medication,
            "treatment_date": treatment_date,
            "summary": summary,
            "doctor_name": doctor_name,
            "hospital_id": hospital_id,
            "uploaded_date": uploaded_date,
            "is_approved": False,
            "is_rejected": False,
            "added_by_patient": False,
            "document_id": contract.functions.getCurrentDocumentId().call() - 1  # Get the just-added document ID
        })

        return jsonify({
            "message": "Document uploaded successfully",
            "ipfs_hashes": report_hashes,
            "transaction_hash": tx_hash.hex()
        }), 201

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/add-patient-document", methods=["POST"])
def add_patient_document():
    data = request.json
    patient_id = data.get("patient_id")
    report_hashes = data.get("report_hashes")
    disease = data.get("disease")
    hospital_name = data.get("hospital")
    medication = data.get("medication")
    treatment_date = data.get("treatment_date")
    summary = data.get("summary")
    doctor_name = data.get("doctor_name")
    uploaded_date = data.get("uploaded_date")

    if not all([patient_id, report_hashes, disease, hospital_name, medication, 
               treatment_date, summary, doctor_name, uploaded_date]):
        return jsonify({"error": "All fields are required"}), 400

    private_key = os.getenv("PRIVATE_KEY")
    if not private_key:
        return jsonify({"error": "Private key not found"}), 400

    try:
        # Find hospital ID by name
        hospital = hospitals_collection.find_one({"name": hospital_name})
        if not hospital:
            return jsonify({"error": "Hospital not found"}), 404
        
        hospital_id = hospital["id"]

        account = web3.eth.account.from_key(private_key)
        sender_address = account.address

        # Get the nonce for the sender address
        nonce = web3.eth.get_transaction_count(sender_address)

        # Build the transaction with all fields
        tx = contract.functions.addReportByPatient(
            int(patient_id),
            report_hashes,
            disease,
            hospital_name,
            medication,
            treatment_date,
            summary,
            doctor_name,
            int(hospital_id),
            uploaded_date
        ).build_transaction({
            "from": sender_address,
            "gas": 2000000,
            "gasPrice": web3.to_wei('20', 'gwei'),
            "nonce": nonce,
        })

        # Sign and send the transaction
        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        web3.eth.wait_for_transaction_receipt(tx_hash)

        # Save document details to MongoDB
        documents_collection.insert_one({
            "patient_id": patient_id,
            "report_hashes": report_hashes,
            "disease": disease,
            "hospital": hospital_name,
            "hospital_id": hospital_id,
            "medication": medication,
            "treatment_date": treatment_date,
            "summary": summary,
            "doctor_name": doctor_name,
            "uploaded_date": uploaded_date,
            "is_approved": True,
            "is_rejected": False,
            "added_by_patient": True,
            "document_id": contract.functions.getCurrentDocumentId().call() - 1
        })

        return jsonify({
            "message": "Document added successfully by patient",
            "transaction_hash": tx_hash.hex(),
            "ipfs_hashes": report_hashes
        }), 201

    except Exception as e:
        print(str(e))
        return jsonify({"error": str(e)}), 500
     
@app.route('/approve-report', methods=['POST'])
def approve_report():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        document_id = data.get('document_id')

        if not all([patient_id, document_id]):
            return jsonify({"error": "Missing required fields"}), 400

        # Update the contract
        private_key = os.getenv("PRIVATE_KEY")
        if not private_key:
            return jsonify({"error": "Private key not found"}), 400

        account = web3.eth.account.from_key(private_key)
        sender_address = account.address

        nonce = web3.eth.get_transaction_count(sender_address)

        tx = contract.functions.approveReport(
            int(patient_id),
            int(document_id)
        ).build_transaction({
            "from": sender_address,
            "gas": 200000,
            "gasPrice": web3.to_wei('20', 'gwei'),
            "nonce": nonce,
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        # Update MongoDB
        update_result = documents_collection.update_one(
            {
                "patient_id": int(patient_id),
                "document_id": int(document_id) - 1
            },
            {
                "$set": {
                    "is_approved": True,
                    "is_rejected": False,
                    "updated_at": datetime.utcnow()
                }
            }
        )


        return jsonify({
            "message": "Report approved successfully",
            "transaction_hash": tx_hash.hex()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reject-report', methods=['POST'])
def reject_report():
    try:
        data = request.json
        patient_id = data.get('patient_id')
        document_id = data.get('document_id')

        if not all([patient_id, document_id]):
            return jsonify({"error": "Missing required fields"}), 400

        # Update the contract
        private_key = os.getenv("PRIVATE_KEY")
        if not private_key:
            return jsonify({"error": "Private key not found"}), 400

        account = web3.eth.account.from_key(private_key)
        sender_address = account.address

        nonce = web3.eth.get_transaction_count(sender_address)

        tx = contract.functions.rejectReport(
            int(patient_id),
            int(document_id)
        ).build_transaction({
            "from": sender_address,
            "gas": 200000,
            "gasPrice": web3.to_wei('20', 'gwei'),
            "nonce": nonce,
        })

        signed_tx = web3.eth.account.sign_transaction(tx, private_key)
        tx_hash = web3.eth.send_raw_transaction(signed_tx.raw_transaction)
        receipt = web3.eth.wait_for_transaction_receipt(tx_hash)

        # Update MongoDB
        update_result = documents_collection.update_one(
            {
                "patient_id": int(patient_id),
                "document_id": int(document_id)
            },
            {
                "$set": {
                    "is_approved": False,
                    "is_rejected": True,
                    "updated_at": datetime.utcnow()
                }
            }
        )


        return jsonify({
            "message": "Report rejected successfully",
            "transaction_hash": tx_hash.hex()
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

def get_file_details(cid):
    url = "https://api.pinata.cloud/v3/files/public"
    querystring = {"cid": cid}
    headers = {"Authorization": f"Bearer {os.getenv('PINATA_JWT')}"}

    try:
        response = requests.get(url, headers=headers, params=querystring)
        response.raise_for_status()
        data = response.json()
        return data["data"]["files"][0]["name"]
    except Exception as e:
        print(f"Error fetching file details for CID {cid}: {str(e)}")
        return "Unknown"

@app.route("/get-documents", methods=["POST"])
def get_documents():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    patient_id = data.get("patient_id")
    if not patient_id:
        return jsonify({"error": "patient_id is required"}), 400

    try:
        if not web3.is_connected():
            return jsonify({"error": "Failed to connect to blockchain"}), 500

        patient_id = int(patient_id)  # Ensure integer

        # Call the getReports function from the contract
        reports_json = contract.functions.getReports(patient_id).call()
        
        if not reports_json or reports_json == "[]":
            return jsonify({"message": "No documents found for this patient", "documents": []}), 200

        # Parse the JSON string into a list of dictionaries
        reports = json.loads(reports_json)
        
        formatted_documents = []
        for report in reports:
            # Get file details for each report hash
            file_details = []
            for ipfs_hash in report["reportHashes"]:
                try:
                    file_name = get_file_details(ipfs_hash)
                    file_url = f"https://magenta-glamorous-silverfish-702.mypinata.cloud/ipfs/{ipfs_hash}?pinataGatewayToken=aMhZLFDXoAnaPBLjmo98KI89cumJQ5K7i_7xh5p49rS853TVXXJIEINrc_1-pYZv"
                    file_details.append({
                        "file_name": file_name,
                        "file_url": file_url,
                        "ipfs_hash": ipfs_hash
                    })
                except Exception as e:
                    print(f"Error processing IPFS hash {ipfs_hash}: {str(e)}")
                    continue

            # Format the report with all fields from contract
            formatted_document = {
                "document_id": report["documentId"],
                "patient_id": patient_id,
                "patient_name": get_patient_name(int(patient_id)),
                "file_details": file_details,
                "hospital_id": report["hospitalId"],
                "doctor_name": report["doctorName"],
                "is_approved": report["isApproved"],
                "is_rejected": report["isRejected"],
                "added_by_patient": report["addedByPatient"],
                "disease": report["disease"],
                "hospital_name": report["hospital"],
                "medication": report["medication"],
                "treatment_date": report["treatmentDate"],
                "summary": report["summary"],
                "uploaded_date": report["uploadedDate"],
                "report_hashes": report["reportHashes"]
            }
            
            formatted_documents.append(formatted_document)

        return jsonify({
            "message": "Documents retrieved successfully",
            "documents": formatted_documents
        }), 200

    except ValueError as ve:
        return jsonify({"error": f"Invalid patient ID format: {str(ve)}"}), 400
    except Exception as e:
        print(f"Error in get_documents: {str(e)}")
        return jsonify({"error": f"Failed to retrieve documents: {str(e)}"}), 500
      
# Other APIs (unchanged)
@app.route("/fetch-medicines", methods=["POST"])
def fetch_medicine():
    try:
        data = request.get_json()
        search = data.get("search")

        one_mg_data = one_mg(str(search).replace(" ","%20").strip())
        apollopharmacy_data = apollopharmacy(str(search))
        pharmeasy_data = pharmeasy(str(search).replace(" ","%20").strip())
        
        # Create a list of results with consistent structure
        results = []
        
        if one_mg_data:
            one_mg_data["price"] = int(str(one_mg_data["price"]).replace("₹",""))
            one_mg_data['store'] = '1mg'
            results.append(one_mg_data)
            
        if apollopharmacy_data:
            apollopharmacy_data['store'] = 'Apollo Pharmacy'
            results.append(apollopharmacy_data)
            
        if pharmeasy_data:
            pharmeasy_data['store'] = 'PharmEasy'
            results.append(pharmeasy_data)
        
        return jsonify({
            "success": True,
            "results": results
        }), 200
    except Exception as e:
        print(str(e))
        return jsonify({"success": False, "message": str(e)}), 500

@app.route("/hello-world", methods=["GET"])
def hello_world():
    try:
        # Call the getHelloWorld function from the contract
        result = contract.functions.getHelloWorld().call()
        return jsonify({"message": result}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.get_json()
    if not data:
        return jsonify({"error": "No JSON data received"}), 400
    
    input_sentence = data.get('symptoms', '')

    # Check if the input sentence is empty
    if not input_sentence:
        return jsonify({"error": "Input sentence is required"}), 400

    try:
        # Preprocess the input text
        processed_text = preprocess_text(input_sentence)
        
        # Transform the input sentence using the TF-IDF vectorizer
        transformed_input = vectorizer.transform([processed_text])

        # Predict the disease using the trained model
        predicted_encoded = model.predict(transformed_input)[0]
        predicted_disease = label_encoder.inverse_transform([predicted_encoded])[0]

        # Retrieve medicines for the predicted disease
        if predicted_disease in medicine_df['disease'].values:
            drugs_for_disease = medicine_df[medicine_df['disease'] == predicted_disease]['drug'].tolist()
            medicines_source = "from our database"
        else:
            drugs_for_disease = []
            medicines_source = "based on general medical knowledge"

        # Generate a detailed response using the language model
        prompt = f"""
        Act as an expert doctor providing information about {predicted_disease}.
        {f"Recommended medicines from our database: {', '.join(drugs_for_disease)}" if drugs_for_disease else "No specific medications found in our database. Please suggest appropriate medications based on your medical knowledge."}
        
        Provide comprehensive information in this exact JSON format:
        {{
            "predicted_disease": "{predicted_disease}",
            "description": "A clear, patient-friendly explanation of the disease (2-3 sentences)",
            "recommended_medicines": {{
                "source": "{medicines_source}",
                "medications": {drugs_for_disease if drugs_for_disease else "Suggest appropriate medications here"}
            }},
            "treatment_advice": "Practical treatment recommendations including both medical and lifestyle approaches (3-4 bullet points)",
            "when_to_see_doctor": "Specific warning signs and symptoms that warrant immediate medical attention (2-3 bullet points)",
            "prevention_tips": "Actionable prevention strategies (2-3 bullet points)"
        }}
        """

        ai_response = together_model.invoke(prompt).content

        try:
            # Parse the AI response to ensure it's valid JSON
            parsed_advice = json.loads(ai_response)
        except json.JSONDecodeError:
            # Fallback if the AI response isn't valid JSON
            parsed_advice = {
                "description": "Could not parse detailed medical advice",
                "recommended_medicines": {
                    "source": medicines_source,
                    "medications": drugs_for_disease if drugs_for_disease else ["Consult a doctor for appropriate medications"]
                },
                "treatment_advice": "Please consult a healthcare professional for treatment options",
                "when_to_see_doctor": "If symptoms persist or worsen, seek medical attention",
                "prevention_tips": "Maintain a healthy lifestyle with proper diet and exercise"
            }

        # Format the complete response
        response = {
            "diagnosis": {
                "disease": predicted_disease,
                "confidence": "High"  # Could be calculated from model probabilities if available
            },
            "medication": {
                "source": parsed_advice.get("recommended_medicines", {}).get("source", medicines_source),
                "list": parsed_advice.get("recommended_medicines", {}).get("medications", drugs_for_disease)
            },
            "medical_advice": {
                "description": parsed_advice.get("description", ""),
                "treatment": parsed_advice.get("treatment_advice", ""),
                "when_to_seek_help": parsed_advice.get("when_to_see_doctor", ""),
                "prevention": parsed_advice.get("prevention_tips", "")
            },
            "disclaimer": "This information is not a substitute for professional medical advice. Always consult a healthcare provider for diagnosis and treatment."
        }

        return jsonify(response)

    except Exception as e:
        return jsonify({
            "error": "An error occurred during prediction",
            "details": str(e)
        }), 500
        
        
@app.route("/fetch-user-details", methods=["POST"])
def fetch_user_details():
    data = request.get_json()
    if not data:
        return jsonify({"error": "Invalid JSON data"}), 400

    user_id = data.get("user_id")
    public_key = data.get("public_key")
    
    if not user_id and not public_key:
        return jsonify({"error": "Either User ID or Public Key is required"}), 400

    try:
        query = {}
        if user_id:
            query["id"] = int(user_id)
        if public_key:
            query["public_key"] = public_key

        # Fetch user details from the database
        user = users_collection.find_one(query)
        if not user:
            return jsonify({"error": "User not found"}), 404

        # Remove sensitive fields before sending the response
        user.pop("_id", None)
        
        return jsonify({
            "message": "User details fetched successfully",
            "user": user
        }), 200

    except ValueError:
        return jsonify({"error": "User ID must be an integer"}), 400
    except Exception as e:
        return jsonify({"error": "Database error", "details": str(e)}), 500


@app.route('/get-hospital-reports', methods=['POST'])
def get_hospital_reports():
    try:
        data = request.json
        hospital_id = data.get('hospital_id')

        if not hospital_id:
            return jsonify({"error": "hospital_id is required"}), 400

        if not web3.is_connected():
            return jsonify({"error": "Failed to connect to blockchain"}), 500

        hospital_id = int(hospital_id)  # Ensure integer

        # Call the smart contract function
        reports_json = contract.functions.getReportsByHospitalId(hospital_id).call()

        if not reports_json or reports_json == "[]":
            return jsonify({"message": "No reports found for this hospital", "documents": []}), 200

        # Parse the JSON string from blockchain
        reports = json.loads(reports_json)
        
        formatted_documents = []
        for report in reports:
            # Get file details for each report hash
            file_details = []
            for ipfs_hash in report["reportHashes"]:
                try:
                    file_name = get_file_details(ipfs_hash)
                    file_url = f"https://magenta-glamorous-silverfish-702.mypinata.cloud/ipfs/{ipfs_hash}?pinataGatewayToken=aMhZLFDXoAnaPBLjmo98KI89cumJQ5K7i_7xh5p49rS853TVXXJIEINrc_1-pYZv"
                    file_details.append({
                        "file_name": file_name,
                        "file_url": file_url,
                        "ipfs_hash": ipfs_hash
                    })
                except Exception as e:
                    print(f"Error processing IPFS hash {ipfs_hash}: {str(e)}")
                    continue

            # Format the report with all fields from contract
            formatted_document = {
                "document_id": report["documentId"],
                "patient_id": report["patientId"],
                "patient_name": get_patient_name(int(report["patientId"])),
                "file_details": file_details,
                "hospital_id": report["hospitalId"],
                "doctor_name": report["doctorName"],
                "is_approved": report["isApproved"],
                "is_rejected": report["isRejected"],
                "added_by_patient": report["addedByPatient"],
                "disease": report["disease"],
                "hospital_name": report["hospital"],
                "medication": report["medication"],
                "treatment_date": report["treatmentDate"],
                "summary": report["summary"],
                "uploaded_date": report["uploadedDate"],
                "report_hashes": report["reportHashes"]
            }
            
            formatted_documents.append(formatted_document)

        return jsonify({
            "message": "Hospital reports retrieved successfully",
            "hospital_id": hospital_id,
            "documents": formatted_documents
        }), 200

    except ValueError as ve:
        return jsonify({"error": f"Invalid hospital ID format: {str(ve)}"}), 400
    except Exception as e:
        print(f"Error in get_hospital_reports: {str(e)}")
        return jsonify({"error": f"Failed to retrieve hospital reports: {str(e)}"}), 500

if __name__ == '__main__':
    app.run(debug=True)