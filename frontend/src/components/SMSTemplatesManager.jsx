import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/SMSTemplatesManager.css';

const SMSTemplatesManager = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    disasterType: 'flood',
    message: '',
    description: '',
    variables: [],
    isActive: true,
  });

  const [variableInput, setVariableInput] = useState('');

  const disasterTypes = ['flood', 'earthquake', 'cyclone', 'fire', 'landslide'];

  // Fetch templates
  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/api/sms-templates', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });
      setTemplates(response.data.data || []);
      setError('');
    } catch (err) {
      setError('Failed to fetch templates');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleAddVariable = () => {
    if (variableInput.trim()) {
      setFormData({
        ...formData,
        variables: [...formData.variables, variableInput.trim()],
      });
      setVariableInput('');
    }
  };

  const handleRemoveVariable = (index) => {
    setFormData({
      ...formData,
      variables: formData.variables.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!formData.name || !formData.message) {
        setError('Name and message are required');
        return;
      }

      if (formData.message.length > 160) {
        setError('Message cannot exceed 160 characters');
        return;
      }

      const url = editingId
        ? `/api/sms-templates/${editingId}`
        : '/api/sms-templates';

      const method = editingId ? 'PUT' : 'POST';

      const response = await axios({
        method,
        url,
        data: formData,
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess(
        editingId ? 'Template updated successfully' : 'Template created successfully'
      );

      // Reset form
      setFormData({
        name: '',
        disasterType: 'flood',
        message: '',
        description: '',
        variables: [],
        isActive: true,
      });
      setEditingId(null);
      setShowForm(false);

      // Refresh templates
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save template');
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (template) => {
    setFormData(template);
    setEditingId(template._id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template?')) {
      return;
    }

    try {
      await axios.delete(`/api/sms-templates/${id}`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
      });

      setSuccess('Template deleted successfully');
      fetchTemplates();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to delete template');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingId(null);
    setFormData({
      name: '',
      disasterType: 'flood',
      message: '',
      description: '',
      variables: [],
      isActive: true,
    });
  };

  return (
    <div className="templates-manager">
      <div className="templates-header">
        <h2>SMS Message Templates</h2>
        <button
          className="btn-primary"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? 'Cancel' : '+ New Template'}
        </button>
      </div>

      {error && <div className="alert alert-error">{error}</div>}
      {success && <div className="alert alert-success">{success}</div>}

      {showForm && (
        <div className="template-form">
          <h3>{editingId ? 'Edit Template' : 'Create New Template'}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Template Name *</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Flood Alert - High Severity"
                />
              </div>

              <div className="form-group">
                <label>Disaster Type *</label>
                <select
                  name="disasterType"
                  value={formData.disasterType}
                  onChange={handleInputChange}
                >
                  {disasterTypes.map((type) => (
                    <option key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Message *</label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Enter SMS message (max 160 characters)"
                rows="3"
                maxLength="160"
              />
              <small>
                {formData.message.length}/160 characters
              </small>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Template description"
                rows="2"
              />
            </div>

            <div className="form-group">
              <label>Message Variables</label>
              <div className="variables-input">
                <input
                  type="text"
                  value={variableInput}
                  onChange={(e) => setVariableInput(e.target.value)}
                  placeholder="e.g., {{location}}, {{severity}}"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddVariable();
                    }
                  }}
                />
                <button
                  type="button"
                  onClick={handleAddVariable}
                  className="btn-secondary"
                >
                  Add Variable
                </button>
              </div>

              {formData.variables.length > 0 && (
                <div className="variables-list">
                  {formData.variables.map((variable, index) => (
                    <div key={index} className="variable-tag">
                      {variable}
                      <button
                        type="button"
                        onClick={() => handleRemoveVariable(index)}
                        className="remove-btn"
                      >
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="form-group checkbox">
              <label>
                <input
                  type="checkbox"
                  name="isActive"
                  checked={formData.isActive}
                  onChange={handleInputChange}
                />
                Active Template
              </label>
            </div>

            <div className="form-actions">
              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Saving...' : editingId ? 'Update Template' : 'Create Template'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="btn-secondary"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="templates-list">
        {loading && !showForm ? (
          <div className="loading">Loading templates...</div>
        ) : templates.length === 0 ? (
          <div className="empty-state">
            <p>No templates created yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="templates-grid">
            {templates.map((template) => (
              <div
                key={template._id}
                className={`template-card ${!template.isActive ? 'inactive' : ''}`}
              >
                <div className="template-header">
                  <h4>{template.name}</h4>
                  <span className={`disaster-badge disaster-${template.disasterType}`}>
                    {template.disasterType}
                  </span>
                </div>

                <p className="template-message">{template.message}</p>

                {template.variables.length > 0 && (
                  <div className="template-variables">
                    <strong>Variables:</strong>
                    <div className="var-list">
                      {template.variables.map((v, i) => (
                        <span key={i} className="var-badge">
                          {v}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="template-footer">
                  <small>Used {template.usageCount || 0} times</small>
                  <div className="template-actions">
                    <button
                      onClick={() => handleEdit(template)}
                      className="btn-edit"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(template._id)}
                      className="btn-delete"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default SMSTemplatesManager;
