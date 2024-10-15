from flask import Flask, request, jsonify
import joblib  # for loading your trained model
import pandas as pd

app = Flask(__name__)

# Load your trained model
model = joblib.load('models/disease_model.pkl')

# Load training data and get the list of symptoms
df = pd.read_csv('models/training_data.csv')
symptoms_list = df.columns.tolist()[:-1]  # Assuming last column is the target

@app.route('/predict', methods=['POST'])
def predict():
    # Get the input sentence from the request
    data = request.json
    input_sentence = data.get('sentence', '')
    
    # Initialize symptoms_found dictionary
    symptoms_found = {symptom: 0 for symptom in symptoms_list}

    # Process the input sentence to extract symptoms
    # Split the sentence into words
    words = input_sentence.lower().replace(".","").replace(",","").split()

    # Check for each symptom if it's present in the input sentence
    for symptom in symptoms_list:
        symptom_words = symptom.split('_')  # Split the symptom into individual words
        # Check if all words in the symptom are present in the input sentence
        if all(word in words for word in symptom_words):
            symptoms_found[symptom] = 1  # Set to 1 if symptom is found

    # Prepare the input for the model (converting boolean to integer)
    model_input = [symptoms_found[symptom] for symptom in symptoms_list]

    # Ensure the input shape matches the expected number of features
    if len(model_input) != len(symptoms_list):
        return jsonify({'error': 'Input features do not match the expected number.'}), 400

    # Predict using the loaded model
    prediction = model.predict([model_input])

    # Return the prediction result
    return jsonify({'prediction': prediction[0], 'symptoms_found': symptoms_found})

if __name__ == '__main__':
    app.run(debug=True)
