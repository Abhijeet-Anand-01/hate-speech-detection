from flask import Flask, request, jsonify
from flask_cors import CORS
import tensorflow as tf
from tensorflow.keras.models import model_from_json
from tensorflow.keras.losses import BinaryCrossentropy
from tensorflow.keras.optimizers import Adam
from tensorflow.keras.metrics import Precision, Recall
from tensorflow.keras.layers import TextVectorization
import pandas as pd
from data_manager import users_data, save_users_data

# Load model architecture from JSON file
with open('toxicity_model_architecture10.json', 'r') as json_file:
    loaded_model_json = json_file.read()

# Load full model including architecture and weights
loaded_model = model_from_json(loaded_model_json)
loaded_model.load_weights('toxicity_model_weights10.weights.h5')

# Compile the loaded model
loaded_model.compile(loss=BinaryCrossentropy(), optimizer=Adam(), metrics=['accuracy', Precision(), Recall()])

# Verify the loaded model summary
print(loaded_model.summary())


df = pd.read_csv('./kaggle/input/train.csv')
df.head()
X = df['comment_text']


MAX_FEATURES = 200000 

# Initialize and adapt the TextVectorization layer
vectorizer = TextVectorization(max_tokens=MAX_FEATURES,
                               output_sequence_length=1800,
                               output_mode='int')

# For demonstration purposes, adapt the vectorizer with some sample texts
train_texts = [
    "This is a sample text.",
    "Here is another example sentence.",
    "More text data for the model to learn from.",
    # Add more sample texts from your training data...
]
# vectorizer.adapt(train_texts)

vectorizer.adapt(X.values)

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for all routes

# Store predictions globally
prediction_results = {}

# input_text = "you are dumb"

# vectorized_input_text = vectorizer([input_text])
# res = loaded_model.predict(vectorized_input_text)
# print(res)

@app.route('/predict', methods=['POST'])
def predict():
    input_data = request.get_json()
    input_text = input_data.get('text', '')

    if not input_text:
        return jsonify({'error': 'No input text provided'}), 400

    vectorized_input_text = vectorizer([input_text])
    res = loaded_model.predict(vectorized_input_text)

    # Convert probabilities to percentages
    res_percentages = (res[0] * 100).tolist()
    
    # Store the result
    prediction_results['last_prediction'] = {
        'input_text': input_text,
        'predictions': res_percentages
    }
    
    return jsonify({
        'input_text': input_text,
        'predictions': res_percentages
    })


@app.route('/get_prediction', methods=['GET'])
def get_prediction():
    if 'last_prediction' in prediction_results:
        return jsonify(prediction_results['last_prediction'])
    else:
        return jsonify({'error': 'No predictions made yet'}), 400


@app.route('/users', methods=['GET'])
def get_users():
    return jsonify(users_data)


@app.route('/users', methods=['POST'])
def update_users():
    global users_data
    new_data = request.get_json()
    if new_data:
        users_data = new_data
        save_users_data()  # Save updated data
        return jsonify({'message': 'Data updated successfully'}), 200
    else:
        return jsonify({'error': 'Invalid JSON'}), 400

if __name__ == '__main__':
    app.run(debug=True)
 