import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from './components/ChatHistory/ChatHistory';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ChatInput from './components/ChatInput/ChatInput';
import './App.css';

const App = () => {
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedChat, setSelectedChat] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const chats = [
    { 
      id: 1, 
      title: 'React Development', 
      lastMessage: 'Let\'s discuss component structure',
      timestamp: '2m ago'
    },
    { 
      id: 2, 
      title: 'UI/UX Design', 
      lastMessage: 'How about using a different color scheme?',
      timestamp: '1h ago'
    }
  ];

  const handleSubmit = async (input) => {
    setIsLoading(true);
    // Add user message
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    // Simulate AI response
    setTimeout(() => {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: 'This is a simulated response.' }
      ]);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ChatHistory
          chats={chats}
          selectedChat={selectedChat}
          onSelectChat={setSelectedChat}
        />
      </div>

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <div className="header">
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="menu-button"
          >
            <FontAwesomeIcon icon={faBars} className="menu-icon" />
          </button>
          <h1 className="header-title">
            {chats.find(chat => chat.id === selectedChat)?.title || 'New Chat'}
          </h1>
        </div>

        <ChatWindow messages={messages} isLoading={isLoading} />
        <ChatInput onSubmit={handleSubmit} isLoading={isLoading} />
      </div>
    </div>
  );
};

export default App;