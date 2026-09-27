import os
import requests
from flask import Flask, request, jsonify
from flask_cors import CORS

app = Flask(__name__)
# Enable CORS for the React frontend running on port 3000
CORS(app)

# The existing Node.js Backend URL
NODE_BACKEND_URL = os.environ.get("NODE_BACKEND_URL", "http://localhost:5000")

# Disaster keywords in multi-language
KEYWORD_MAP = {
    'fire': ['fire', 'aag', 'jal', 'burning'],
    'flood': ['flood', 'paani', 'badh', 'drowning', 'water'],
    'earthquake': ['earthquake', 'bhookamp', 'shaking', 'tremor'],
    'landslide': ['landslide', 'pahar', 'mountain'],
    'cyclone': ['cyclone', 'toofan', 'storm', 'wind'],
    'help': ['help', 'bachao', 'madat', 'sos', 'emergency']
}

def analyze_command(text):
    """
    Simple intent recognition based on keyword matching.
    In a real app, you would use NLP (SpaCy/NLTK) or an LLM here.
    """
    text_lower = text.lower()
    
    detected_type = 'General'
    severity = 'High'
    
    # Priority check for specific disasters
    for disaster_type, keywords in KEYWORD_MAP.items():
        if any(kw in text_lower for kw in keywords):
            if disaster_type != 'help':
                detected_type = disaster_type.capitalize()
                severity = 'Critical'
                break
            else:
                detected_type = 'Emergency SOS'
                severity = 'High'
                
    return detected_type, severity

@app.route('/api/voice-command', methods=['POST'])
def process_voice_command():
    try:
        data = request.get_json()
        command_text = data.get('command', '')
        location = data.get('location', {})
        
        if not command_text:
            return jsonify({'error': 'No voice command provided.'}), 400
            
        print(f"🎙️ Received Voice Command: '{command_text}'")
        print(f"📍 Location: {location}")
        
        detected_type, severity = analyze_command(command_text)
        
        # Build alert payload for Node.js backend
        # Using the simplified '/api/alerts/simple/create' endpoint designed for script access
        alert_payload = {
            "title": f"Voice SOS: {detected_type}",
            "description": f"Voice Command Triggered: '{command_text}'",
            "type": detected_type,
            "severity": severity,
            "location": f"Lat: {location.get('lat', 'Unknown')}, Lng: {location.get('lng', 'Unknown')}"
        }
        
        print(f"🚀 Forwarding to Node Backend: {alert_payload}")
        
        # Forward to Node.js backend to broadcast & save to DB
        response = requests.post(f"{NODE_BACKEND_URL}/api/alerts/simple/create", json=alert_payload)
        
        if response.status_code in [200, 201]:
            print("✅ Alert successfully registered in primary system.")
            return jsonify({
                'success': True,
                'message': 'Alert synthesized and broadcasted.',
                'detected_type': detected_type,
                'severity': severity
            }), 200
        else:
            print(f"❌ Failed to forward alert. Status: {response.status_code}")
            return jsonify({
                'success': False, 
                'error': 'Primary node backend rejected the alert formulation.',
                'details': response.text
             }), 500
             
    except requests.exceptions.ConnectionError:
        return jsonify({
            'success': False,
            'error': 'Could not connect to Node.js backend to dispatch alert.'
        }), 503
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({
        'status': 'Voice NLP Service Active',
        'port': 5001,
        'connected_master': NODE_BACKEND_URL
    })

if __name__ == '__main__':
    print("=========================================")
    print("🎙️ Starting NLP Voice Assistant Service")
    print("📍 Port: 5001")
    print("🔄 Route: POST /api/voice-command")
    print("=========================================")
    # Run on 5001 to prevent crashing the Node.js backend running on 5000
    app.run(debug=True, port=5001)
