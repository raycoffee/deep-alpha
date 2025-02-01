import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faUser, faSpinner } from '@fortawesome/free-solid-svg-icons';
import './ChatWindow.css';

const Message = ({ role, content, isLoading }) => (
  <div className={`message ${role === 'assistant' ? 'assistant' : 'user'}`}>
    <div className={`avatar ${role}`}>
      <FontAwesomeIcon 
        icon={role === 'assistant' ? faRobot : faUser} 
        className="avatar-icon" 
      />
    </div>
    <div className="message-content">
      <div className="sender-name">
        {role === 'assistant' ? 'Assistant' : 'You'}
      </div>
      <div className="message-text">
        {isLoading ? (
          <div className="loading-indicator">
            <FontAwesomeIcon icon={faSpinner} className="loading-icon fa-spin" />
            <span>Generating response...</span>
          </div>
        ) : (
          content
        )}
      </div>
    </div>
  </div>
);

const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="chat-window">
      {messages.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-content">
            <FontAwesomeIcon icon={faRobot} className="empty-state-icon" />
            <h2 className="empty-state-title">Start a conversation</h2>
            <p className="empty-state-text">Ask anything to get started</p>
          </div>
        </div>
      ) : (
        <div className="messages-container">
          {messages.map((message, index) => (
            <Message
              key={message.id || index}
              role={message.role}
              content={message.content}
              isLoading={isLoading && index === messages.length - 1}
            />
          ))}
          <div ref={messagesEndRef} />
        </div>
      )}
    </div>
  );
};

export default ChatWindow;