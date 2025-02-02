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
    color: '#3b82f6' // blue
  },
  'PRICE ANALYSIS': {
    icon: faChartLine,
    className: 'price',
    color: '#10b981' // green
  },
  'FUNDAMENTAL METRICS': {
    icon: faChartPie,
    className: 'metrics',
    color: '#8b5cf6' // purple
  },
  'KEY TAKEAWAYS': {
    icon: faListCheck,
    className: 'takeaways',
    color: '#f59e0b' // amber
  },
  'RISK FACTORS': {
    icon: faTriangleExclamation,
    className: 'risks',
    color: '#ef4444' // red
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
  // Split content into sections based on numbers (1., 2., etc.)
  const sections = content.split(/(?=\d\.\s+(?:QUICK OVERVIEW|PRICE ANALYSIS|FUNDAMENTAL METRICS|KEY TAKEAWAYS|RISK FACTORS))/g);

  // Process each section to get title and content
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

// Helper function to format numbers and percentages
const formatNumbers = (text) => {
  // Format percentages
  text = text.replace(
    /(-?\d+\.?\d*%)/g,
    (match) => {
      const value = parseFloat(match);
      const isPositive = value >= 0;
      return `<span class="percentage-change ${isPositive ? 'positive' : 'negative'}">${match}</span>`;
    }
  );

  // Format dollar amounts
  text = text.replace(
    /\$(\d+\.?\d*[BMK]?)/g,
    '<span class="dollar-amount">$$$1</span>'
  );

  // Use dangerouslySetInnerHTML to render the formatted text
  return <span dangerouslySetInnerHTML={{ __html: text }} />;
};

export default FormattedMessage;