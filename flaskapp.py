from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import uuid

app = Flask(__name__)
CORS(app)

# In-memory database
alerts_db = []

# Helper function to generate ID
def generate_id():
    return str(uuid.uuid4())

# ==================== ALERT ENDPOINTS ====================

# GET /api/alerts - Fetch all alerts
@app.route('/api/alerts', methods=['GET'])
def get_alerts():
    """Fetch all alerts from database"""
    return jsonify(alerts_db), 200

# POST /api/alerts - Create new alert
@app.route('/api/alerts', methods=['POST'])
def create_alert():
    """Create a new alert"""
    try:
        data = request.get_json()
        
        # Validate required fields
        if not data.get('title') or not data.get('description'):
            return jsonify({'error': 'Title and description are required'}), 400
        
        # Create alert object
        new_alert = {
            'id': generate_id(),
            'title': data.get('title'),
            'description': data.get('description'),
            'location': data.get('location', 'Unknown'),
            'severity': data.get('severity', 'low'),  # low, medium, high
            'createdAt': datetime.now().isoformat()
        }
        
        # Add to database
        alerts_db.append(new_alert)
        
        return jsonify(new_alert), 201
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# GET /api/alerts/<id> - Fetch single alert
@app.route('/api/alerts/<alert_id>', methods=['GET'])
def get_alert(alert_id):
    """Fetch a single alert by ID"""
    alert = next((a for a in alerts_db if a['id'] == alert_id), None)
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    return jsonify(alert), 200

# PUT /api/alerts/<id> - Update alert
@app.route('/api/alerts/<alert_id>', methods=['PUT'])
def update_alert(alert_id):
    """Update an alert"""
    try:
        alert = next((a for a in alerts_db if a['id'] == alert_id), None)
        
        if not alert:
            return jsonify({'error': 'Alert not found'}), 404
        
        data = request.get_json()
        
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
    
    except Exception as e:
        return jsonify({'error': str(e)}), 500

# DELETE /api/alerts/<id> - Delete alert
@app.route('/api/alerts/<alert_id>', methods=['DELETE'])
def delete_alert(alert_id):
    """Delete an alert"""
    global alerts_db
    
    alert = next((a for a in alerts_db if a['id'] == alert_id), None)
    
    if not alert:
        return jsonify({'error': 'Alert not found'}), 404
    
    alerts_db = [a for a in alerts_db if a['id'] != alert_id]
    
    return jsonify({'message': 'Alert deleted successfully'}), 200

# ==================== HEALTH CHECK ====================

@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint"""
    return jsonify({'status': 'Server running', 'alerts_count': len(alerts_db)}), 200

# ==================== RUN SERVER ====================

if __name__ == '__main__':
    print("🚀 Flask server starting on http://localhost:5000")
    print("✅ CORS enabled for React frontend")
    print("📊 Alert management API ready!")
    app.run(debug=True, port=5000)
