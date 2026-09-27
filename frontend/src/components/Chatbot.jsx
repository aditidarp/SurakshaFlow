import { useState } from "react";
import API from "../api";

export default function Chatbot() {
  const [messages, setMessages] = useState([
    { text: "Hello! I'm your SurakshaFlow assistant. How can I help with disaster preparedness or emergency information?", sender: "bot" }
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage = { text: input, sender: "user" };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    try {
      const res = await API.post("/chat", { message: input });
      const botMessage = { text: res.data.response, sender: "bot" };
      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      const errorMessage = { text: "Sorry, I'm having trouble connecting. Please try again.", sender: "bot" };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") sendMessage();
  };

  return (
    <div className="chatbot-container">
      <div className="chatbot-header">
        <h4>🤖 SurakshaFlow Assistant</h4>
      </div>
      <div className="chatbot-messages">
        {messages.map((msg, index) => (
          <div key={index} className={`message ${msg.sender}`}>
            <p>{msg.text}</p>
          </div>
        ))}
        {isLoading && <div className="message bot loading">Typing...</div>}
      </div>
      <div className="chatbot-input">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Ask about disasters, safety tips..."
        />
        <button onClick={sendMessage} disabled={isLoading}>Send</button>
      </div>
    </div>
  );
}