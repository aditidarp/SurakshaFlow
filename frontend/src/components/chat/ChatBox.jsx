import React, { useEffect, useRef } from 'react';
import './ChatBox.css';

const ChatBox = ({ messages, onSendMessage, connectionStatus }) => {
  const messageRef = useRef();
  const scrollRef = useRef();

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const text = messageRef.current.value.trim();
    if (!text) return;
    onSendMessage({ sender: 'rescue', content: text });
    messageRef.current.value = '';
  };

  return (
    <section className="chat-panel">
      <div className="panel-header">
        <h2>Admin Communication</h2>
        <span className={connectionStatus === 'connected' ? 'status-connected' : 'status-disconnected'}>
          {connectionStatus}
        </span>
      </div>
      <div className="messages-container" ref={scrollRef}>
        {messages.length === 0 ? (
          <div className="empty-state">No messages yet</div>
        ) : (
          messages.map((msg) => (
            <div className={`chat-message ${msg.sender === 'admin' ? 'admin' : 'rescue'}`} key={msg.id}> 
              <div className="message-header">
                <strong>{msg.sender}</strong>
                <span>{new Date(msg.timestamp).toLocaleTimeString()}</span>
              </div>
              <div className="message-body">{msg.content}</div>
            </div>
          ))
        )}
      </div>
      <form className="chat-form" onSubmit={handleSubmit}>
        <input ref={messageRef} placeholder="Type message..." />
        <button type="submit">Send</button>
      </form>
    </section>
  );
};

export default ChatBox;
