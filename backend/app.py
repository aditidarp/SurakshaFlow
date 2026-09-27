from flask import Flask, request, jsonify
import pickle
import joblib
import os

app = Flask(__name__)

# Safe model loading
rain_model = None
base_ml_path = os.path.join(os.path.dirname(__file__), 'ml') if os.path.isdir(os.path.join(os.path.dirname(__file__), 'ml')) else os.path.join('ml')

try:
    rain_model_path = os.path.join(base_ml_path, 'rain_prediction_model.pkl')
    with open(rain_model_path, 'rb') as f:
        rain_model = pickle.load(f)
except Exception as e:
    print('Failed to load rain model:', e)


@app.route('/')
def home():
    return 'SurakshaFlow Backend is Running 🚀'


@app.route('/predict', methods=['POST'])
def predict_rain():
    if rain_model is None:
        return jsonify({'error': 'Rain model not available'}), 503

    data = request.get_json() or {}
    try:
        temp = float(data['temperature'])
        humidity = float(data['humidity'])
        wind = float(data['wind'])
        pressure = float(data['pressure'])
    except Exception:
        return jsonify({'error': 'Invalid input. Provide temperature, humidity, wind, pressure.'}), 400

    prediction = rain_model.predict([[temp, humidity, wind, pressure]])[0]

    if prediction > 100:
        alert = '🚨 Flood Alert'
    elif prediction > 30:
        alert = '⚠️ Heavy Rain Alert'
    else:
        alert = '✅ No Risk'

    return jsonify({
        'predicted_rainfall': round(float(prediction), 2),
        'alert': alert
    })


@app.route('/predict-disease', methods=['POST'])
def predict_disease():
    if disease_model is None:
        return jsonify({'error': 'Disease model not available'}), 503

    data = request.get_json() or {}
    try:
        X = [[int(data['fever']), int(data['cough']), int(data['fatigue'])]]
    except Exception:
        return jsonify({'error': 'Invalid input. Provide fever, cough, fatigue as 0/1.'}), 400

    result = disease_model.predict(X)
    return jsonify({'prediction': str(result[0])})


@app.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    username = data.get('username')
    password = data.get('password')

    if username == 'admin' and password == '123456':
        return jsonify({'token': 'abc123'})
    else:
        return jsonify({'error': 'Invalid username or password'}), 401


if __name__ == '__main__':
    app.run(debug=True, port=8000)
