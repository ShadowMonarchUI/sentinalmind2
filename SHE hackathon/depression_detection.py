import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, accuracy_score

# 1. Data Loading and Preprocessing
# For demonstration, we create a small synthetic dataset.
data = {
    'sleep_hours': [6, 8, 5, 7, 4, 9, 3, 8, 6, 5],
    'appetite_loss': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'fatigue': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'concentration_loss': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'depressed': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1]  # 1: Depressed, 0: Not Depressed
}
df = pd.DataFrame(data)

# Features and target variable
X = df.drop('depressed', axis=1)
y = df['depressed']

# Split data into training and testing sets
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.3, random_state=42)

# 2. Model Training
# We use a Random Forest Classifier for this example.
model = RandomForestClassifier(random_state=42)
model.fit(X_train, y_train)

# 3. Model Evaluation
# Predict on the test set
predictions = model.predict(X_test)

# Print evaluation metrics
print('Accuracy:', accuracy_score(y_test, predictions))
print('Classification Report:')
print(classification_report(y_test, predictions))

# 4. Prediction Example
# Predict depression for a new individual
# Example: 5 hours sleep, appetite loss, fatigue, concentration loss
new_data = np.array([[5, 1, 1, 1]])
prediction = model.predict(new_data)
print('Predicted (1=Depressed, 0=Not Depressed):', prediction[0])

# -----------------------------
# Explanations:
# - Data is synthetically generated for demonstration. Replace with real data for actual use.
# - Features: sleep_hours, appetite_loss, fatigue, concentration_loss.
# - Target: depressed (1 or 0).
# - Model: RandomForestClassifier is used for classification.
# - The script prints accuracy, a classification report, and a sample prediction.
#
# To run: Open terminal and execute 'python depression_detection.py'
