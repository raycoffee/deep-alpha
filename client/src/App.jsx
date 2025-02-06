import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBars, faSignOutAlt, faSquareCaretLeft, faSquareCaretRight } from '@fortawesome/free-solid-svg-icons';
import ChatHistory from './components/ChatHistory/ChatHistory';
import ChatWindow from './components/ChatWindow/ChatWindow';
import ChatInput from './components/ChatInput/ChatInput';
import Login from './components/Auth/Login';
import { useAuth } from './context/AuthContext';
import axios from 'axios';
import './App.css';

const API_BASE_URL = 'http://localhost:3001/api';

const App = () => {
  const { chatId } = useParams();
  const navigate = useNavigate();
  const { user, loading, logout } = useAuth();
  const [messages, setMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [error, setError] = useState(null);
  const [chats, setChats] = useState([]);

  // Fetch all chats for the sidebar
  const fetchChats = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/analysis/chats`, {
        withCredentials: true
      });
      setChats(response.data.data);
    } catch (err) {
      console.error('Error fetching chats:', err);
      setError('Failed to load chats');
    }
  };

  // Load specific chat when chatId changes
  const loadChat = async (id) => {
    if (!id) {
      setMessages([]);
      return;
    }

    try {
      setIsLoading(true);
      const response = await axios.get(`${API_BASE_URL}/analysis/chats/${id}`, {
        withCredentials: true
      });
      setMessages(response.data.data.messages);
    } catch (err) {
      console.error('Error loading chat:', err);
      setError('Failed to load chat');
      navigate('/'); // Redirect to new chat if load fails
    } finally {
      setIsLoading(false);
    }
  };

  // Load chats on mount and handle initial state
  useEffect(() => {
    if (user) {
      fetchChats();
      // If no chatId in URL, ensure we're in a new chat state
      if (!chatId) {
        setMessages([]);
      }
    }
  }, [user]);

  // Load specific chat when URL changes
  useEffect(() => {
    if (chatId) {
      loadChat(chatId);
    }
  }, [chatId]);

  const handleSubmit = async (input) => {
    setIsLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: input }]);

    try {
      const response = await axios.post(`${API_BASE_URL}/analysis/analyze`, {
        query: input,
        chatId: chatId // Include chatId if it exists
      }, {
        withCredentials: true
      });

      const { data } = response.data;

      // Update messages with AI response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.llmResponse.kwargs.content,
        data: {
          ticker: data.ticker,
          stockData: data.stockData,
          analysis: data.analysis
        }
      }]);

      // If this was first message in a new chat, update URL and chat list
      if (data.chat && !chatId) {
        navigate(`/${data.chat.id}`);
        await fetchChats(); // Refresh chat list
      }
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

  const handleChatSelect = (id) => {
    if (id) {
      navigate(`/${id}`);
    } else {
      startNewChat();
    }
  };

  const startNewChat = () => {
    console.log("I was hit", "🥶")
    navigate('/');
    setMessages([]);
  };

  const handleLogout = async () => {
    try {
      await logout();
      setMessages([]);
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        Loading...
      </div>
    );
  }

  if (!user) {
    return <Login />;
  }

  const currentChat = chatId ? chats.find(chat => chat.id === chatId) : null;

  return (
    <div className="app">
      <div className={`sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <ChatHistory
          chats={chats}
          selectedChat={chatId}
          onSelectChat={handleChatSelect}
          onNewChat={startNewChat}
        />
      </div>

      <div className="main-content">
        <div className="header">
          <div className="header-left">
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="menu-button"
            >
              {isSidebarOpen ? <FontAwesomeIcon icon={faSquareCaretLeft} className="menu-icon" /> : <FontAwesomeIcon icon={faSquareCaretRight} className="menu-icon" />}
              
            </button>
            <h1 className="header-title">
              {currentChat?.title || 'New Stock Analysis'}
            </h1>
          </div>
          <div className="header-right">
            <span className="user-name">{user.name}</span>
            <button onClick={handleLogout} className="logout-button">
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
          </div>
        </div>

        {error && (
          <div className="error-banner">
            {error}
            <button onClick={() => setError(null)} className="error-close">×</button>
          </div>
        )}

        <ChatWindow 
          messages={messages} 
          isLoading={isLoading}
          isNewChat={!chatId} 
        />
        <ChatInput 
          onSubmit={handleSubmit} 
          isLoading={isLoading}
          placeholder={!chatId ? "Ask about any stock (e.g., 'How is Apple performing?')" : "Type your message..."}
        />
      </div>
    </div>
  );
};

export default App;