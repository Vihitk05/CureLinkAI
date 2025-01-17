from datetime import datetime
from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib
import pandas as pd
from flask_cors import CORS
from langchain_openai import ChatOpenAI
import os
from web3 import Web3
from pymongo import MongoClient
import ipfs_api  # Updated library import for IPFS-Toolkit
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization

# Initialize the Flask app
app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()

# Configure the language model
together_model = ChatOpenAI(
    base_url="https://api.together.xyz/v1",
    api_key="15cd22fcda5b9a47079f07d32753e11074821b123edef05700560ce01610dde3",
    model="mistralai/Mixtral-8x7B-Instruct-v0.1",
)

# Load the trained model and TF-IDF vectorizer
model = joblib.load('models/disease_prediction_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

# Load the dataset with diseases and drugs
medicine_df = pd.read_csv('models/disease_drug_data.csv')

# MongoDB setup
client = MongoClient("mongodb://localhost:27017/")
db = client.CureLink
documents_collection = db.documents
# Blockchain setup (Replace with Remix deployment details)
infura_url = "https://sepolia.infura.io/v3/8c17c57288a6445bb5d65385dfcf6197"
web3 = Web3(Web3.HTTPProvider(infura_url))
contract_address = "0xD7ACd2a9FD159E69Bb102A1ca21C9a3e3A5F771B"
contract_abi = [
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"internalType": "string",
				"name": "reportHash",
				"type": "string"
			}
		],
		"name": "addReport",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "uint256",
				"name": "reportIndex",
				"type": "uint256"
			}
		],
		"name": "approveReport",
		"outputs": [],
		"stateMutability": "nonpayable",
		"type": "function"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "reportHash",
				"type": "string"
			},
			{
				"indexed": False,
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			}
		],
		"name": "ReportAdded",
		"type": "event"
	},
	{
		"anonymous": False,
		"inputs": [
			{
				"indexed": True,
				"internalType": "address",
				"name": "patient",
				"type": "address"
			},
			{
				"indexed": False,
				"internalType": "string",
				"name": "reportHash",
				"type": "string"
			}
		],
		"name": "ReportApproved",
		"type": "event"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "patient",
				"type": "address"
			}
		],
		"name": "getReports",
		"outputs": [
			{
				"components": [
					{
						"internalType": "string",
						"name": "reportHash",
						"type": "string"
					},
					{
						"internalType": "address",
						"name": "doctor",
						"type": "address"
					},
					{
						"internalType": "bool",
						"name": "isApproved",
						"type": "bool"
					}
				],
				"internalType": "struct MedicalReport.Report[]",
				"name": "",
				"type": "tuple[]"
			}
		],
		"stateMutability": "view",
		"type": "function"
	},
	{
		"inputs": [
			{
				"internalType": "address",
				"name": "",
				"type": "address"
			},
			{
				"internalType": "uint256",
				"name": "",
				"type": "uint256"
			}
		],
		"name": "reportsByPatient",
		"outputs": [
			{
				"internalType": "string",
				"name": "reportHash",
				"type": "string"
			},
			{
				"internalType": "address",
				"name": "doctor",
				"type": "address"
			},
			{
				"internalType": "bool",
				"name": "isApproved",
				"type": "bool"
			}
		],
		"stateMutability": "view",
		"type": "function"
	}
] 
contract = web3.eth.contract(address=contract_address, abi=contract_abi)

# IPFS setup using IPFS-Toolkit
ipfs_client = ipfs_api.http_client
users_collection = db.users

# Helper Function: Generate Key Pair
def generate_key_pair():
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048
    )
    public_key = private_key.public_key()
    return private_key, public_key

# Helper Function: Serialize Keys
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

# User Registration API
@app.route("/register", methods=["POST"])
def register_user():
    data = request.json
    username = data.get("username")
    email = data.get("email")

    if not username or not email:
        return jsonify({"error": "Username and email are required"}), 400

    # Check if the user already exists
    if users_collection.find_one({"email": email}):
        return jsonify({"error": "User with this email already exists"}), 400

    # Generate key pair
    private_key, public_key = generate_key_pair()
    private_key_pem, public_key_pem = serialize_keys(private_key, public_key)

    # Save public key and user details in MongoDB
    users_collection.insert_one({
        "username": username,
        "email": email,
        "public_key": public_key_pem.decode()
    })

    # Return private key to the user
    return jsonify({
        "message": "User registered successfully",
        "private_key": private_key_pem.decode()
    }), 201

# User Login API
@app.route("/login", methods=["POST"])
def login_user():
    data = request.json
    email = data.get("email")
    private_key_input = data.get("private_key")

    if not email or not private_key_input:
        return jsonify({"error": "Email and private key are required"}), 400

    # Find the user in MongoDB
    user = users_collection.find_one({"email": email})
    if not user:
        return jsonify({"error": "User not found"}), 404

    # Compare provided private key with stored public key
    stored_public_key_pem = user["public_key"]
    stored_public_key = serialization.load_pem_public_key(stored_public_key_pem.encode())

    try:
        # Load the private key from input and extract its public key
        private_key = serialization.load_pem_private_key(
            private_key_input.encode(),
            password=None
        )
        input_public_key = private_key.public_key()

        # Verify the keys match
        if stored_public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ) == input_public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        ):
            return jsonify({"message": "Login successful"}), 200
        else:
            return jsonify({"error": "Invalid private key"}), 401
    except Exception as e:
        return jsonify({"error": "Invalid private key format"}), 400
    
@app.route("/upload", methods=["POST"])
def upload_document():
    data = request.json
    patient_address = data["patient_address"]
    document = data["document"]  # Base64-encoded document
    private_key = data["private_key"]

    # Upload to IPFS using IPFS-Toolkit
    ipfs_hash = ipfs_client.add_bytes(document.encode())

    # Build and sign transaction
    nonce = web3.eth.get_transaction_count(web3.eth.account.from_key(private_key).address)
    tx = contract.functions.uploadDocument(patient_address, ipfs_hash).buildTransaction({
        "from": web3.eth.account.from_key(private_key).address,
        "nonce": nonce,
        "gas": 2000000,
        "gasPrice": web3.toWei('20', 'gwei')
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    web3.eth.wait_for_transaction_receipt(tx_hash)

    # Record the document in MongoDB
    document_record = {
        "patient_address": patient_address,
        "ipfs_hash": ipfs_hash,
        "upload_date": datetime.utcnow(),
        "approved": False  # Initially, the document is not approved
    }
    documents_collection.insert_one(document_record)

    return jsonify({"message": "Document uploaded successfully", "ipfs_hash": ipfs_hash})


@app.route("/approve", methods=["POST"])
def approve_document():
    data = request.json
    document_index = data["document_index"]
    private_key = data["private_key"]

    # Build and sign transaction
    nonce = web3.eth.get_transaction_count(web3.eth.account.from_key(private_key).address)
    tx = contract.functions.approveDocument(document_index).buildTransaction({
        "from": web3.eth.account.from_key(private_key).address,
        "nonce": nonce,
        "gas": 2000000,
        "gasPrice": web3.toWei('20', 'gwei')
    })
    signed_tx = web3.eth.account.sign_transaction(tx, private_key)
    tx_hash = web3.eth.send_raw_transaction(signed_tx.rawTransaction)
    web3.eth.wait_for_transaction_receipt(tx_hash)

    # Update the document record in MongoDB
    document = documents_collection.find_one({"ipfs_hash": contract.functions.getDocuments(document_index).call()})
    if document:
        documents_collection.update_one(
            {"_id": document["_id"]},
            {"$set": {"approved": True, "approval_date": datetime.utcnow()}}
        )

    return jsonify({"message": "Document approved successfully"})

@app.route("/get-documents", methods=["GET"])
def get_documents():
    patient_address = request.args.get("patient_address")
    documents = contract.functions.getDocuments(patient_address).call()
    return jsonify({"documents": documents})

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
