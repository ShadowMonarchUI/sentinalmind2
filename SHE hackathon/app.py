from flask import Flask, render_template, request
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split

app = Flask(__name__)

# Synthetic dataset (same as before)
data = {
    'sleep_hours': [6, 8, 5, 7, 4, 9, 3, 8, 6, 5],
    'appetite_loss': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'fatigue': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'concentration_loss': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'mood_swings': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'social_withdrawal': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'irritability': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'weight_change': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'suicidal_thoughts': [0, 0, 1, 0, 1, 0, 1, 0, 1, 1],
    'depressed': [1, 0, 1, 0, 1, 0, 1, 0, 1, 1]
}
df = pd.DataFrame(data)
X = df.drop('depressed', axis=1)
y = df['depressed']
model = RandomForestClassifier(random_state=42)
model.fit(X, y)

@app.route('/', methods=['GET', 'POST'])
def index():
    prediction = None
    status = None
    mental_illness = None
    depression_proba = None
    status_proba = None
    mental_illness_proba = None
    if request.method == 'POST':
        sleep_hours = float(request.form['sleep_hours'])
        # Convert all symptoms from percentage (0-100) to 0-1 scale
        appetite_loss = float(request.form['appetite_loss']) / 100.0
        fatigue = float(request.form['fatigue']) / 100.0
        concentration_loss = float(request.form['concentration_loss']) / 100.0
        mood_swings = float(request.form['mood_swings']) / 100.0
        social_withdrawal = float(request.form['social_withdrawal']) / 100.0
        irritability = float(request.form['irritability']) / 100.0
        weight_change = float(request.form['weight_change']) / 100.0
        suicidal_thoughts = float(request.form['suicidal_thoughts']) / 100.0
        user_features = np.array([[sleep_hours, appetite_loss, fatigue, concentration_loss, mood_swings, social_withdrawal, irritability, weight_change, suicidal_thoughts]])
        # For model compatibility, round to 0 or 1 for prediction (since model was trained on binary)
        binarized_features = np.array([[sleep_hours,
                                        1 if appetite_loss >= 0.5 else 0,
                                        1 if fatigue >= 0.5 else 0,
                                        1 if concentration_loss >= 0.5 else 0,
                                        1 if mood_swings >= 0.5 else 0,
                                        1 if social_withdrawal >= 0.5 else 0,
                                        1 if irritability >= 0.5 else 0,
                                        1 if weight_change >= 0.5 else 0,
                                        1 if suicidal_thoughts >= 0.5 else 0]])
        pred = model.predict(binarized_features)[0]
        proba = model.predict_proba(binarized_features)[0]
        depression_proba = f"{proba[1]*100:.1f}%" if pred == 1 else f"{proba[0]*100:.1f}%"
        prediction = 'Depressed' if pred == 1 else 'Not Depressed'
        # Status: Abnormal if average symptom percentage > 30%
        symptoms = [appetite_loss, fatigue, concentration_loss, mood_swings, social_withdrawal, irritability, weight_change, suicidal_thoughts]
        symptom_score = sum(symptoms) / len(symptoms)
        status = 'Abnormal' if symptom_score > 0.3 else 'Normal'
        status_proba = f"{symptom_score*100:.1f}%"
        # Mental illness: if depressed or suicidal thoughts
        if pred == 1 or suicidal_thoughts >= 0.5:
            mental_illness = 'Possible Mental Illness'
            mental_illness_proba = depression_proba
        else:
            mental_illness = 'No Significant Mental Illness Detected'
            mental_illness_proba = f"{(1-symptom_score)*100:.1f}%"
    return render_template('index.html', prediction=prediction, status=status, mental_illness=mental_illness, depression_proba=depression_proba, status_proba=status_proba, mental_illness_proba=mental_illness_proba)

if __name__ == '__main__':
    app.run(debug=True)
