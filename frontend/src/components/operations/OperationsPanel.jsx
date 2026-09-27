import React from 'react';
import './OperationsPanel.css';

const OperationsPanel = ({ operations, onUpdateOperation }) => {
  return (
    <section className="operations-panel">
      <div className="panel-header">
        <h2>Active Operations</h2>
        <span>({operations.length})</span>
      </div>
      {!operations.length ? (
        <div className="empty-state">No operations active</div>
      ) : (
        <div className="operation-list">
          {operations.map((op) => (
            <article key={op.id} className={`operation-card ${op.status}`}>
              <div className="operation-top">
                <h3>{op.teamName}</h3>
                <span>{op.status}</span>
              </div>
              <div className="operation-meta">
                <span>{op.location ?? 'Unknown location'}</span>
                <span>{new Date(op.updatedAt || op.startedAt || op.timestamp || Date.now()).toLocaleTimeString()}</span>
              </div>
              <div className="operation-actions">
                <button onClick={() => onUpdateOperation(op.id, 'active')}>Active</button>
                <button onClick={() => onUpdateOperation(op.id, 'completed')}>Complete</button>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
};

export default OperationsPanel;
