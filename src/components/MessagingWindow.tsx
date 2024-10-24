import React, { useState } from 'react';
import { Window, TextBox, Button } from 'react-windows-xp';
import { Message } from '../types';
import { streamMessage } from '../api/claudeAPI';

const MessagingWindow: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async (): Promise<void> => {
    if (newMessage.trim()) {
      const userMessage: Message = {
        id: Date.now(),
        text: newMessage,
        timestamp: new Date(),
        role: 'user'
      };
      
      setMessages(prev => [...prev, userMessage]);
      setNewMessage('');
      setIsLoading(true);

      // Create a placeholder message for the assistant
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: '',
        timestamp: new Date(),
        role: 'assistant',
        isStreaming: true
      };
      
      setMessages(prev => [...prev, assistantMessage]);

      try {
        await streamMessage(newMessage, (content) => {
          setMessages(prev => prev.map(msg =>
            msg.id === assistantMessage.id
              ? { ...msg, text: msg.text + content }
              : msg
          ));
        });

        // Update the message to show it's no longer streaming
        setMessages(prev => prev.map(msg =>
          msg.id === assistantMessage.id
            ? { ...msg, isStreaming: false }
            : msg
        ));
      } catch (error) {
        console.error('Error streaming message:', error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <Window
      title="claude-3-5-sonnet-20241022"
      showClose
      showHelp
      showMaximize
      showMinimize
      style={{ height: '100%' }}
    >
      <div style={{ padding: '20px', height: 'calc(100% - 40px)', display: 'flex', flexDirection: 'column' }}>
        <div style={{ 
          flex: 1, 
          backgroundColor: '#fff', 
          marginBottom: '10px', 
          padding: '10px',
          overflowY: 'auto'
        }}>
          {messages.map((msg) => (
            <div 
              key={msg.id} 
              style={{ 
                marginBottom: '10px',
                textAlign: msg.role === 'user' ? 'right' : 'left',
                opacity: msg.isStreaming ? 0.7 : 1
              }}
            >
              <div style={{
                marginBottom: '4px'  // Add spacing between timestamp and message
              }}>
                <strong>{msg.timestamp.toLocaleTimeString()} - {msg.role}:</strong>
              </div>
              <div style={{ 
                background: msg.role === 'user' ? '#e3f2fd' : '#f5f5f5',
                padding: '8px',
                borderRadius: '8px',
                display: 'inline-block',
                maxWidth: '80%',
                textAlign: 'left'
              }}>
                {msg.text}
                {msg.isStreaming && '▊'}
              </div>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', width: '100%', gap: '10px' }}>
          <TextBox
            id="message-input"
            value={newMessage}
            onChange={(text: string) => setNewMessage(text)}
            style={{ flex: 1, width: '100%' }}
            disabled={isLoading}
          />
          <Button onClick={handleSend} disabled={isLoading}>
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </div>
      </div>
    </Window>
  );
};

export default MessagingWindow;
