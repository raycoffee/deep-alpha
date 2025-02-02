import React, { useRef, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faRobot, 
  faUser, 
  faSpinner, 
  faChartLine,
  faArrowUp,
  faArrowDown,
  faDollarSign,
  faPercent
} from '@fortawesome/free-solid-svg-icons';
import FormattedMessage from '../FormattedMessage/FormattedMessage.jsx';
import './ChatWindow.css';

// Stock Metrics Component
const StockMetrics = ({ data }) => {
  if (!data?.stockData) return null;

  const { currentPrice, priceChangePercent, marketCap, periodPerformance } = data.stockData.data;
  const isPositive = priceChangePercent > 0;

  return (
    <div className="stock-metrics">
      <div className="metrics-header">
        <div className="stock-symbol">{data.ticker}</div>
        <div className="stock-price">
          <FontAwesomeIcon icon={faDollarSign} />
          {currentPrice.toFixed(2)}
          <span className={`price-change ${isPositive ? 'positive' : 'negative'}`}>
            <FontAwesomeIcon icon={isPositive ? faArrowUp : faArrowDown} />
            {Math.abs(priceChangePercent).toFixed(2)}%
          </span>
        </div>
      </div>
      <div className="metrics-grid">
        <div className="metric-item">
          <div className="metric-label">Market Cap</div>
          <div className="metric-value">
            ${(marketCap / 1e9).toFixed(2)}B
          </div>
        </div>
        <div className="metric-item">
          <div className="metric-label">YTD Performance</div>
          <div className={`metric-value ${periodPerformance > 0 ? 'positive' : 'negative'}`}>
            <FontAwesomeIcon icon={periodPerformance > 0 ? faArrowUp : faArrowDown} />
            {Math.abs(periodPerformance).toFixed(2)}%
          </div>
        </div>
      </div>
    </div>
  );
};


const FinancialMetrics = ({ data }) => {
  if (!data?.stockData?.data) return null;

  const {
    peRatio,
    profitMargins,
    revenueGrowth,
    operatingMargins
  } = data.stockData.data;

  const metrics = [
    { label: 'P/E Ratio', value: peRatio?.toFixed(2) },
    { label: 'Profit Margin', value: `${(profitMargins * 100).toFixed(2)}%` },
    { label: 'Revenue Growth', value: `${(revenueGrowth * 100).toFixed(2)}%` },
    { label: 'Operating Margin', value: `${(operatingMargins * 100).toFixed(2)}%` }
  ];

  return (
    <div className="financial-metrics">
      <div className="metrics-grid">
        {metrics.map((metric, index) => (
          <div key={index} className="metric-item">
            <div className="metric-label">{metric.label}</div>
            <div className="metric-value">{metric.value}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Loading Indicator Component
const LoadingIndicator = () => (
  <div className="loading-indicator">
    <FontAwesomeIcon icon={faSpinner} className="loading-icon fa-spin" />
    <span>Generating response...</span>
  </div>
);

// Empty State Component
const EmptyState = () => (
  <div className="empty-state">
    <div className="empty-state-content">
      <FontAwesomeIcon icon={faRobot} className="empty-state-icon" />
      <h2 className="empty-state-title">Start a conversation</h2>
      <p className="empty-state-text">
        Ask me about any stock! Try "How is Apple doing?" or "Is Microsoft a good buy?"
      </p>
    </div>
  </div>
);

// Message Component
const Message = ({ role, content, data, isLoading }) => (
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
          <LoadingIndicator />
        ) : (
          <>
            {role === 'assistant' ? (
              <FormattedMessage content={content} />
            ) : (
              <div className="user-message">{content}</div>
            )}
            {data && (
              <div className="data-content">
                <StockMetrics data={data} />
                <FinancialMetrics data={data} />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  </div>
);

// Main ChatWindow Component
const ChatWindow = ({ messages, isLoading }) => {
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  if (messages.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="chat-window">
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
    </div>
  );
};

export default ChatWindow;