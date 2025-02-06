import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faRobot,
  faUser,
  faSpinner,
  faChartLine,
  faSearch,
  faArrowTrendUp,
  faArrowDown
} from '@fortawesome/free-solid-svg-icons';
import FormattedMessage from '../FormattedMessage/FormattedMessage';
import DeepAlphaLogoIconBlack from "../../assets/DeepAlpha-icon-black.png"
import './ChatWindow.css';

// Stock data display components
const StockMetrics = ({ data }) => {
  if (!data?.stockData?.data) return null;



  const { currentPrice, priceChangePercent, marketCap } = data.stockData.data;
  const isPositive = priceChangePercent > 0;

  return (
    <div className="stock-metrics">
      <div className="metrics-header">
        <div className="stock-symbol">{data.ticker}</div>
        <div className="stock-price">
          <FontAwesomeIcon icon={faChartLine} />
          ${currentPrice?.toFixed(2)}
          <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            <FontAwesomeIcon icon={isPositive ? faArrowTrendUp : faArrowDown} />
            {Math.abs(priceChangePercent)?.toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">
            ${(marketCap / 1e9)?.toFixed(2)}B
          </div>
        </div>
      </div>
    </div>
  );
};

const Message = ({ role, content, data, isLoading }) => (
  <div className={`message ${role === 'assistant' ? 'assistant' : 'user'}`}>
    <div className={`avatar ${role}`}>

      {role === 'assistant' ? <img src={DeepAlphaLogoIconBlack} alt="Logo" className="main-logo-icon-black" /> : <FontAwesomeIcon
        icon={role === 'assistant' ? faRobot : faUser}
        className="avatar-icon"
      />}


    </div>
    <div className="message-content">
      <div className="sender-name">
        {role === 'assistant' ? 'Assistant' : 'You'}
      </div>
      <div className="message-text">
        {isLoading ? (
          <div className="loading-indicator">
            <FontAwesomeIcon icon={faSpinner} className="loading-icon fa-spin" />
            <span>Thinking...</span>
          </div>
        ) : (
          <>
            {role === 'assistant' ? (
              <>
                {data && <StockMetrics data={data} />}
                <FormattedMessage content={content} />
              </>
            ) : (
              <div className="text-content">{content}</div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

const EmptyState = ({ isNewChat }) => (
  <div className="empty-state">
    <div className="empty-state-content">
      <FontAwesomeIcon icon={faChartLine} className="empty-state-icon" />
      <h2 className="empty-state-title">
        {isNewChat ? 'Welcome to DeepAlpha Pro' : 'Select a Chat'}
      </h2>
      <p className="empty-state-text">
        {isNewChat ? 'Start by asking any question about stocks:' : 'Choose a previous analysis or start a new one'}
      </p>

      {isNewChat && (
        <div className="suggestion-grid">
          <div className="suggestion-item">
            <FontAwesomeIcon icon={faSearch} className="suggestion-icon" />
            <span>"How is Apple performing?"</span>
          </div>
          <div className="suggestion-item">
            <FontAwesomeIcon icon={faChartLine} className="suggestion-icon" />
            <span>"What's Tesla's revenue growth?"</span>
          </div>
          <div className="suggestion-item">
            <FontAwesomeIcon icon={faArrowTrendUp} className="suggestion-icon" />
            <span>"Is Microsoft a good investment?"</span>
          </div>
        </div>
      )}
    </div>
  </div>
);

const ChatWindow = ({ messages, isLoading, isNewChat = true }) => {
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
        <EmptyState isNewChat={isNewChat} />
      ) : (
        <div className="messages-container">
          {messages.map((message, index) => (
            <Message
              key={message.id || index}
              role={message.role}
              content={message.content}
              data={message.data}
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