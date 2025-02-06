import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faLightbulb,
  faChartLine,
  faChartPie,
  faListCheck,
  faTriangleExclamation
} from '@fortawesome/free-solid-svg-icons';
import './FormattedMessage.css';

const SECTION_CONFIG = {
  'QUICK OVERVIEW': {
    icon: faLightbulb,
    className: 'overview',
    color: '#3b82f6'
  },
  'PRICE ANALYSIS': {
    icon: faChartLine,
    className: 'price',
    color: '#10b981'
  },
  'FUNDAMENTAL METRICS': {
    icon: faChartPie,
    className: 'metrics',
    color: '#8b5cf6'
  },
  'KEY TAKEAWAYS': {
    icon: faListCheck,
    className: 'takeaways',
    color: '#f59e0b'
  },
  'RISK FACTORS': {
    icon: faTriangleExclamation,
    className: 'risks',
    color: '#ef4444'
  }
};

const Section = ({ title, content }) => {
  const config = SECTION_CONFIG[title] || {
    icon: faLightbulb,
    className: 'default',
    color: '#6b7280'
  };

  const formattedContent = content.split('\n').map((line, i) => {
    line = line.trim();
    if (!line) return null;

    // Handle bullet points (both - and numbered)
    if (line.match(/^(-|\d+\.)\s/)) {
      return (
        <li key={i} className="bullet-point">
          {formatNumbers(line.replace(/^(-|\d+\.)\s/, ''))}
        </li>
      );
    }

    return <p key={i}>{formatNumbers(line)}</p>;
  });

  return (
    <div className={`response-section ${config.className}`}>
      <div className="section-header" style={{ '--section-color': config.color }}>
        <FontAwesomeIcon icon={config.icon} className="section-icon" />
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {formattedContent}
      </div>
    </div>
  );
};

const FormattedMessage = ({ content }) => {
  // First try to split into sections
  const sections = content.split(/(?=\d\.\s+(?:QUICK OVERVIEW|PRICE ANALYSIS|FUNDAMENTAL METRICS|KEY TAKEAWAYS|RISK FACTORS))/g);

  // Process sections if they exist
  const processedSections = sections
    .map(section => {
      const match = section.match(/\d\.\s+((?:QUICK OVERVIEW|PRICE ANALYSIS|FUNDAMENTAL METRICS|KEY TAKEAWAYS|RISK FACTORS))([\s\S]*)/);
      if (!match) return null;
      return {
        title: match[1].trim(),
        content: match[2].trim()
      };
    })
    .filter(Boolean);

  // If no sections found, display content as is
  if (processedSections.length === 0) {
    return (
      <div className="ai-response">
        <div className="response-section default">
          <div className="section-content">
            {content.split('\n').map((line, i) => {
              line = line.trim();
              if (!line) return null;

              // Handle bullet points (both - and numbered)
              if (line.match(/^(-|\d+\.)\s/)) {
                return (
                  <li key={i} className="bullet-point">
                    {formatNumbers(line.replace(/^(-|\d+\.)\s/, ''))}
                  </li>
                );
              }

              return <p key={i}>{formatNumbers(line)}</p>;
            })}
          </div>
        </div>
      </div>
    );
  }

  // If sections found, display them
  return (
    <div className="ai-response">
      {processedSections.map((section, index) => (
        <Section
          key={index}
          title={section.title}
          content={section.content}
        />
      ))}
    </div>
  );
};


const formatNumbers = (text) => {
  // Format percentages
  text = text.replace(
    /([-+]?\d*\.?\d+%)/g,
    (match) => {
      const value = parseFloat(match);
      const isPositive = value >= 0;
      return `<span class="percentage-change ${isPositive ? 'positive' : 'negative'}">${match}</span>`;
    }
  );

  // Format dollar amounts
  text = text.replace(
    /\$\s*([\d,]+\.?\d*\s*[BMK]?)/g,
    '<span class="dollar-amount">$$$1</span>'
  );

  // Format standalone decimal numbers
  text = text.replace(
    /(?<!\$)(?<![A-Za-z])(\d+\.\d+|\d{1,3}(,\d{3})*(\.\d+)?|\d+)(?![A-Za-z]|\s*%|\s*[BMK])/g,
    '<span class="number">$1</span>'
  );

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

export default FormattedMessage;