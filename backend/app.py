from dotenv import load_dotenv
from flask import Flask, request, jsonify
import joblib  # for loading your trained model
import pandas as pd
from difflib import get_close_matches  # for approximate matching
import google.generativeai as genai
import os
from flask_cors import CORS

app = Flask(__name__)
CORS(app) 

load_dotenv()
GEMINI_API_KEY = os.getenv('GEMINI_API_KEY')
genai.configure(api_key=GEMINI_API_KEY)
# Load your trained model
model = joblib.load('models/disease_model.pkl')

# Load training data and get the list of symptoms
df = pd.read_csv('models/disease_prediction.csv')
symptoms_list = df.columns.tolist()[:-1]  # Assuming last column is the target

# Load the dataset with diseases and drugs
medicine_df = pd.read_csv('models/disease_drug_data.csv')

@app.route('/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.json
    input_sentence = data.get('sentence', '')
    
    # Initialize symptoms_found dictionary
    symptoms_found = {symptom: 0 for symptom in symptoms_list}

    # Process the input sentence to extract symptoms
    words = input_sentence.lower().replace(".","").replace(",","").split()

    # Check for each symptom if it's present in the input sentence
    for symptom in symptoms_list:
        symptom_words = symptom.split('_')  # Split the symptom into individual words
        if all(word in words for word in symptom_words):
            symptoms_found[symptom] = 1  # Set to 1 if symptom is found

    # Prepare the input for the model
    model_input = [symptoms_found[symptom] for symptom in symptoms_list]

    # Ensure the input shape matches the expected number of features
    if len(model_input) != len(symptoms_list):
        return jsonify({'error': 'Input features do not match the expected number.'}), 400

    # Predict using the loaded model
    predicted_disease = model.predict([model_input])[0]

    # Fuzzy match the predicted disease with the disease names in the drug dataset
    disease_names = medicine_df['disease'].unique()
    matched_disease = get_close_matches(predicted_disease, disease_names, n=1, cutoff=0.6)
    
    if matched_disease:
        # Retrieve all the drugs associated with the matched disease
        drugs_for_disease = medicine_df[medicine_df['disease'] == matched_disease[0]]['drug'].tolist()

        # Use Gemini API to generate a comprehensive response
        gemini = genai.GenerativeModel('gemini-pro')
        response_text = gemini.generate_content(f"""Based on the detected symptoms ({symptoms_found}), the predicted disease is {matched_disease[0]}. Here are the recommended medicines: {drugs_for_disease}. Please provide a comprehensive response to the user, including additional information about the disease and treatment options. Format should be: Predicted Disease: \nRecommended Medicines: \nAdditional Information: \nWhen to see a doctor: \n""")

        # Format the response
        response = {
            "Doctor": {
                "disease": matched_disease[0],
                "symptoms_detected": [symptom for symptom, found in symptoms_found.items() if found],
                "recommended_medicines": drugs_for_disease,
                "response": str(response_text.text)
            }
        }
    else:
        response = {
            "Doctor": {
                "disease": "No close match found",
                "symptoms_detected": [symptom for symptom, found in symptoms_found.items() if found],
                "recommended_medicines": []
            }
        }
    return jsonify(response)


if __name__ == '__main__':
    app.run(debug=True)
