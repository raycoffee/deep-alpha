import React, { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from './components/ChatHistory/ChatHistory';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ChatInput from './components/ChatInput/ChatInput';
import axios from 'axios'
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

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
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {

      const response = await axios.post(`${API_BASE_URL}/analysis/analyze`, {
        query: input
      })

      const { data } = response.data;

      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.llmResponse.kwargs.content,
        data: {
          ticker: data.ticker,
          stockData: data.stockData,
          analysis: data.analysis
        }
      }]);

    } catch (err) {
      console.error('Error analyzing query:', err);
      setError(err.response?.data?.error || 'Error analyzing your query');


      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Sorry, I encountered an error while analyzing your query. Please try again.',
        error: true
      }]);
    } finally {
      setIsLoading(false);
    }
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