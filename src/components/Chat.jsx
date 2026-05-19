import { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { getSocketUrl, getSocketOptions } from '../services/api';
import { useAuth } from '../context/AuthContext';

export default function Chat() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState(null);
  const [isOpen, setIsOpen] = useState(false);
  const messagesEndRef = useRef(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const newSocket = io(getSocketUrl(), getSocketOptions());
    setSocket(newSocket);

    newSocket.on('chat_history', (history) => {
      setMessages(history);
    });

    newSocket.on('chat_message', (msg) => {
      setMessages(prev => [...prev, msg]);
    });

    return () => newSocket.close();
  }, [user?.id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const sendMessage = (e) => {
    e.preventDefault();
    if (!input.trim() || !socket || !user) return;

    socket.emit('chat_message', {
      senderId: user.id,
      senderName: user.name,
      role: user.role?.name || "Normal User",
      text: input
    });
    setInput('');
  };

  if (!user) return null; // Don't show chat if not logged in

  return (
    <div style={{ position: 'fixed', bottom: '20px', right: '20px', zIndex: 1000, width: '350px', background: '#1c1c1e', borderRadius: '12px', border: '1px solid #333', overflow: 'hidden', boxShadow: '0 10px 30px rgba(0,0,0,0.5)' }}>
      <div 
        style={{ padding: '15px', background: '#ff5e62', color: '#fff', cursor: 'pointer', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
        onClick={() => setIsOpen(!isOpen)}
      >
        <h4 style={{ margin: 0 }}>💬 Community Chat</h4>
        <span>{isOpen ? '▼' : '▲'}</span>
      </div>
      
      {isOpen && (
        <div style={{ display: 'flex', flexDirection: 'column', height: '400px' }}>
          <div style={{ flex: 1, overflowY: 'auto', padding: '15px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {messages.map((msg, idx) => {
              const isMe = msg.senderId === user.id;
              return (
                <div key={idx} style={{ alignSelf: isMe ? 'flex-end' : 'flex-start', maxWidth: '80%' }}>
                  <div style={{ fontSize: '0.75rem', color: '#888', marginBottom: '2px', textAlign: isMe ? 'right' : 'left' }}>
                    {isMe ? 'You' : `${msg.senderName} (${msg.role})`}
                  </div>
                  <div style={{ padding: '8px 12px', borderRadius: '8px', background: isMe ? '#ff5e62' : '#333', color: '#fff' }}>
                    {msg.text}
                  </div>
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
          <form onSubmit={sendMessage} style={{ display: 'flex', padding: '10px', borderTop: '1px solid #333', background: '#111' }}>
            <input 
              type="text" 
              value={input} 
              onChange={e => setInput(e.target.value)} 
              placeholder="Type a message..." 
              style={{ flex: 1, padding: '10px', borderRadius: '6px', border: '1px solid #333', background: '#222', color: '#fff', marginRight: '10px' }}
            />
            <button type="submit" className="btn btn-primary" style={{ padding: '0 15px' }}>Send</button>
          </form>
        </div>
      )}
    </div>
  );
}
