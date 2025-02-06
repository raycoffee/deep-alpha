import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faRobot, faPlus } from '@fortawesome/free-solid-svg-icons';
import DeepAlphaLogo from "../../assets/DeepAlpha-logo-dark.png"
import './ChatHistory.css';

const ChatHistoryItem = ({ title, active, onClick, lastMessage, timestamp }) => (
  <button
    onClick={onClick}
    className={`chat-history-item ${active ? 'active' : ''}`}
  >
    <div className="chat-history-item-content">
      <FontAwesomeIcon icon={faRobot} className="chat-history-icon" />
      <div className="chat-history-text">
        <div className="chat-history-title">{title}</div>
        {lastMessage && (
          <div className="chat-history-message">{lastMessage}</div>
        )}
      </div>
      {timestamp && (
        <div className="chat-history-time">{timestamp}</div>
      )}
    </div>
  </button>
);

const ChatHistory = ({ chats, selectedChat, onSelectChat, onNewChat }) => {
  return (
    <div className="chat-history">
      <div className="new-chat-container">
      <img src={DeepAlphaLogo} alt="Logo" className="main-logo" /> {/* Use the imported image */}
        <button className="new-chat-button" onClick={() => onNewChat()}>
          <FontAwesomeIcon icon={faPlus} className="new-chat-icon" />
          <span>New Chat</span>
        </button>
      </div>

      <div className="chat-list">
        {chats.map((chat) => (
          <ChatHistoryItem
            key={chat.id}
            title={chat.title}
            lastMessage={chat.lastMessage}
            timestamp={chat.timestamp}
            active={chat.id === selectedChat}
            onClick={() => onSelectChat(chat.id)}
          />
        ))}
      </div>

      <div className="user-profile">
        <div className="user-profile-content">
          <div className="user-avatar">
            <span>JD</span>
          </div>
          <span className="user-name">John Doe</span>
        </div>
      </div>
    </div>
  );
};

export default ChatHistory;