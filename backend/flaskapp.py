from flask import Flask, request, jsonify
from flask_cors import CORS
import uuid
from datetime import datetime

app = Flask(__name__)
CORS(app)

# In-memory database for alerts
alerts_db = []

def generate_id():
    """Generate a unique ID for alerts"""
    return str(uuid.uuid4())

# ==================== HEALTH CHECK ====================
@app.route('/health', methods=['GET'])
def health():
    return jsonify({'status': 'ok', 'message': 'Flask Alert API is running'}), 200

# ==================== GET ALL ALERTS ====================
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Fetch all alerts - Admin and User both use this endpoint"""
    return jsonify(alerts_db), 200

# ==================== CREATE ALERT (ADMIN) ====================
@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create a new alert - Admin only"""
    data = request.get_json()
    
    # Validation
    if not data.get('title') or not data.get('description'):
        return jsonify({'error': 'Title and description are required'}), 400
    
    new_alert = {
        'id': generate_id(),
        'title': data.get('title'),
        'description': data.get('description'),
        'location': data.get('location', ''),
        'severity': data.get('severity', 'medium'),
        'createdAt': datetime.utcnow().isoformat() + 'Z'
    }
    
    alerts_db.append(new_alert)
    return jsonify(new_alert), 201

# ==================== GET SINGLE ALERT ====================
@app.route('/api/alerts/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    """Fetch a single alert by ID"""
    alert = next((a for a in alerts_db if a['id'] == alert_id), None)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    return jsonify(alert), 200

# ==================== UPDATE ALERT (ADMIN) ====================
@app.route('/api/alerts/<alert_id>', methods=['PUT'])
def update_alert(alert_id):
    """Update an existing alert - Admin only"""
    data = request.get_json()
    
    alert = next((a for a in alerts_db if a['id'] == alert_id), None)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    # Update fields if provided
    if 'title' in data:
        alert['title'] = data['title']
    if 'description' in data:
        alert['description'] = data['description']
    if 'location' in data:
        alert['location'] = data['location']
    if 'severity' in data:
        alert['severity'] = data['severity']
    
    return jsonify(alert), 200

# ==================== DELETE ALERT (ADMIN) ====================
@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete an alert - Admin only"""
    global alerts_db
    alert = next((a for a in alerts_db if a['id'] == alert_id), None)
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    alerts_db = [a for a in alerts_db if a['id'] != alert_id]
    return jsonify({'message': 'Alert deleted successfully'}), 200

# ==================== ERROR HANDLERS ====================
@app.errorhandler(404)
def not_found(error):
    return jsonify({'error': 'Endpoint not found'}), 404

@app.errorhandler(500)
def server_error(error):
    return jsonify({'error': 'Internal server error'}), 500

if __name__ == '__main__':
    print("🚀 Flask Alert API starting on http://localhost:5000")
    app.run(debug=True, port=5000)
