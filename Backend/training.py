import os
import pandas as pd
import tensorflow as tf
import numpy as np
from matplotlib import pyplot as plt
from tensorflow.keras.layers import TextVectorization
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import LSTM, Dropout, Bidirectional, Dense, Embedding
from tensorflow.keras.losses import BinaryCrossentropy
from tensorflow.keras.optimizers import Adam
import seaborn as sns
from tensorflow.keras.metrics import Precision, Recall
from tensorflow.keras.layers import Input
import matplotlib.pyplot as plt

# Load the dataset
df = pd.read_csv('/kaggle/input/jigsaw-toxic-comment-classification-challenge/train.csv')
df.head()

# training dataset plot
plt.figure(figsize=(8,4))
plt.xlabel('Classes')
plt.ylabel('Fraction of text in each label')
plt.title('Training Dataset Classification')
sns.barplot(df)
plt.show()

# Features and labels extraction
X = df['comment_text']
y = df[df.columns[2:]].values

# Vectorization
MAX_FEATURES = 200000  # number of words in the vocab

vectorizer = TextVectorization(max_tokens=MAX_FEATURES,
                               output_sequence_length=1800,
                               output_mode='int')
vectorizer.adapt(X.values)

vectorized_text = vectorizer(X.values)


# Create the dataset
dataset = tf.data.Dataset.from_tensor_slices((vectorized_text, y))
dataset = dataset.cache()
dataset = dataset.shuffle(160000)
dataset = dataset.batch(16)
dataset = dataset.prefetch(8)  # helps bottlenecks

# Split the dataset
dataset_size = len(dataset)
train_size = int(0.7 * dataset_size)
val_size = int(0.2 * dataset_size)

train = dataset.take(train_size)
val = dataset.skip(train_size).take(val_size)
test = dataset.skip(train_size + val_size)


max_length=1000;
MAX_FEATURES = 200000;

# Model layer creation
model = Sequential()
# Define the input shape using the Input layer
model.add(Input(shape=(max_length,)))
# Create the embedding layer
model.add(Embedding(MAX_FEATURES + 1, 32))
# Bidirectional LSTM Layer
model.add(Bidirectional(LSTM(32, activation='tanh')))
# Feature extractor Fully connected layers
model.add(Dense(128, activation='relu'))
model.add(Dense(256, activation='relu'))
model.add(Dense(128, activation='relu'))
# Final layer 
model.add(Dense(6, activation='sigmoid'))

# Compile the model
model.compile(loss=BinaryCrossentropy(), optimizer=Adam(), metrics=['accuracy', Precision(), Recall()])

# Model summary
model.summary()

# Train the model and save model
history = model.fit(train, epochs=10,validation_data=val,verbose=1)

model_json = model.to_json()
with open("toxicity_model_architecture10.json", "w") as json_file:
    json_file.write(model_json)

model.save_weights("toxicity_model_weights10.weights.h5")

#print keys for metrics graph
print(history.history.keys())

# Plotting training history
plt.figure(figsize=(16, 8))

# Plot accuracy
plt.subplot(2, 2, 1)
plt.plot(history.history['accuracy'], label='Training Accuracy')
plt.plot(history.history['val_accuracy'], label='Validation Accuracy')
plt.xlabel('Epoch')
plt.ylabel('Accuracy')
plt.title('Training and Validation Accuracy')
plt.legend()

# Plot loss
plt.subplot(2, 2, 2)
plt.plot(history.history['loss'], label='Training Loss')
plt.plot(history.history['val_loss'], label='Validation Loss')
plt.xlabel('Epoch')
plt.ylabel('Loss')
plt.title('Training and Validation Loss')
plt.legend()

# Plot precision
plt.subplot(2, 2, 3)
plt.plot(history.history['precision'], label='Training Precision')
plt.plot(history.history['val_precision'], label='Validation Precision')
plt.xlabel('Epoch')
plt.ylabel('Precision')
plt.title('Training and Validation Precision')
plt.legend()

# Plot recall
plt.subplot(2, 2, 4)
plt.plot(history.history['recall'], label='Training Recall')
plt.plot(history.history['val_recall'], label='Validation Recall')
plt.xlabel('Epoch')
plt.ylabel('Recall')
plt.title('Training and Validation Recall')
plt.legend()

#plot correlation matrix to show which classes are more related to each other
plt.figure(figsize=(16, 8))
plt.title("Correlation Matrix")
class_names = ['toxic','severe_toxic', 'obscene','threat','insult','identity_hate']
data = df[class_names]
sns.heatmap(data.astype(float).corr(), annot=True)
plt.show()

import matplotlib.pyplot as plt

# Example of using the loaded model for prediction in backend
input_text = "i love you as i hate you"
vectorized_input_text = vectorizer([input_text])  # Assuming you have `vectorizer` defined
res = model.predict(vectorized_input_text)
print("Prediction for input text:", res)

# Convert probabilities to percentages
res_percentages = res[0] * 100

# Plotting the prediction probabilities as percentages
class_names = ['Toxic', 'Severe Toxic', 'Obscene', 'Threat', 'Insult', 'Identity hate']

plt.figure(figsize=(8, 4))  # Adjust figure size as needed
bars = plt.bar(class_names, res_percentages)
plt.xlabel('Classes')
plt.ylabel('Prediction Percentage (%)')
plt.title(f'Prediction Percentages for Input Text: "{input_text}"')
plt.ylim(0, 110)  # Ensure y-axis ranges from 0 to 100 for percentages

# Add percentages on top of bars with adjusted positions
for bar, percentage in zip(bars, res_percentages):
    yval = bar.get_height()
    plt.text(bar.get_x() + bar.get_width()/2, yval + 1, f'{percentage:.2f}%', ha='center', va='bottom', color='black', fontsize=10)

plt.tight_layout()
plt.show()


# entire model's evaluation metrics
from tensorflow.keras.metrics import Precision, Recall, CategoricalAccuracy

# Initialize the metrics
pre = Precision()
re = Recall()
acc = CategoricalAccuracy()

# Iterate through the test data and update the metrics
for batch in test.as_numpy_iterator(): 
    # Unpack the batch
    X_true, y_true = batch
    # Make a prediction
    yhat = model.predict(X_true)
    
    # Flatten the predictions and true values
    y_true = y_true.flatten()
    yhat = yhat.flatten()
    
    # Update the state of each metric
    pre.update_state(y_true, yhat)
    re.update_state(y_true, yhat)
    acc.update_state(y_true, yhat)

# Calculate the final results
precision = pre.result().numpy()
recall = re.result().numpy()
accuracy = acc.result().numpy()

# Calculate F1 Score
f1_score = 2 * (precision * recall) / (precision + recall)

# Print the results
print(f'Precision: {precision}, Recall: {recall}, Accuracy: {accuracy}, F1 Score: {f1_score}')

# Plot the metrics
metrics = ['Accuracy', 'Precision', 'Recall', 'F1 Score']
values = [accuracy, precision, recall, f1_score]

plt.figure(figsize=(8, 4))
bar_width = 0.4
plt.bar(metrics, values, color=['blue', 'green', 'red', 'purple'])
plt.xlabel('Metrics')
plt.ylabel('Values')
plt.title('Model Performance Metrics')
plt.ylim(0, 1)  # Assuming binary classification with values between 0 and 1
plt.show()
