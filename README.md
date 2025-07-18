﻿# Curelink AI

## Overview
Curelink AI is a decentralized medical storage system leveraging blockchain technology for secure and immutable storage of medical records. Users can add their own reports, while hospitals can submit reports using a patient’s public address. Patients must verify and accept these records before they are permanently stored. Additional features include a medicine price comparison tool and an AI-driven disease prediction system.

## Features
- **Decentralized Medical Storage**: Securely store medical reports on the blockchain, ensuring immutability.
- **Hospital Report Submission**: Hospitals can send report requests using the patient’s public address, requiring patient verification before storage.
- **Private Key Authentication**: Patients log in using their private key to manage records.
- **Public Key Access**: View any patient’s records using their public key.
- **Medicine Price Comparison**: Compare medicine prices from various pharmacy websites.
- **AI-Powered Disease Prediction**: Input symptoms in plain English to get a predicted diagnosis, recommended medicines, and doctor visit advice.

## Tech Stack
- **Backend**: Python, Flask
- **Frontend**: NextJS, ShadCN
- **Database**: MongoDB
- **Blockchain**: Solidity, Ethereum
- **Machine Learning**: AI model for disease prediction

## Installation
### Prerequisites
- Python 3.8+
- Node.js 16+
- MongoDB
- MetaMask (for blockchain transactions)

### Setup Backend
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows use `venv\Scripts\activate`
pip install -r requirements.txt
flask run
```

### Setup Frontend
```bash
cd next-frontend
npm install
npm run dev
```

## Usage
1. **User Registration & Authentication**:
   - Log in using a private key.
   - Hospitals can submit reports using a patient’s public address.
2. **Medical Report Storage**:
   - Patients add their own reports.
   - Hospitals send requests, and patients verify details before accepting.
   - Reports are permanently stored on the blockchain.
3. **Medicine Price Comparison**:
   - Enter a medicine name to compare prices from different pharmacy websites.
4. **Disease Prediction**:
   - Input symptoms in plain English to get a predicted diagnosis and recommended medicines.
   - Receive recommendations on when to see a doctor.



