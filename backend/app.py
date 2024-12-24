from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib  # for loading your trained model
import pandas as pd
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# Load environment variables
load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)

# Load the trained model and vectorizer
model = joblib.load('models/trained_model.pkl')
vectorizer = joblib.load('models/tfidf_vectorizer.pkl')

# Load the dataset with diseases and drugs
medicine_df = pd.read_csv('models/disease_drug_data.csv')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.json
    input_sentence = data.get('sentence', '')

    # Transform the input sentence using the vectorizer
    transformed_input = vectorizer.transform([input_sentence])

    # Predict using the loaded model
    predicted_disease = model.predict(transformed_input)[0]

    # Retrieve medicines for the predicted disease
    if predicted_disease in medicine_df['disease'].values:
        drugs_for_disease = medicine_df[medicine_df['disease'] == predicted_disease]['drug'].tolist()
    else:
        drugs_for_disease = []

    # Use Gemini API to generate a comprehensive response
    gemini = genai.GenerativeModel('gemini-pro')
    response_text = gemini.generate_content(f"""Based on the detected disease ({predicted_disease}), here are the recommended medicines: {drugs_for_disease}. Please provide additional information about the disease and treatment options in the following format: Predicted Disease: \nRecommended Medicines: \nAdditional Information: \nWhen to see a doctor: \n""")

    # Format the response
    response = {
        "Doctor": {
            "disease": predicted_disease,
            "recommended_medicines": drugs_for_disease,
            "response": str(response_text.text)
        }
    }
    
    return jsonify(response)

if __name__ == '__main__':
    app.run(debug=True)
