import React from 'react';
import './ResultCard.css'; 
import { mockData } from '../mockApi';

// 1. Import our new "useLanguage" hook
// Note: '../' goes up from 'components' to 'src'
import { useLanguage } from '../context/LanguageContext';

function ResultCard() {
  const data = mockData;
  
  // 2. Get the text from our context
  const { text } = useLanguage();

  const getBadgeClass = (score) => {
    if (score.includes("High Dairy")) {
      return 'green-badge'; 
    }
    return 'default-badge';
  };

  const confidencePercent = (data.confidence * 100).toFixed(0);

  return (
    <div className="result-container">
      <div className="result-card">
        
        <div className="result-image-placeholder">
          <p>Uploaded Image</p>
        </div>

        <div className="result-section">
          {/* 3. Use the text from the context */}
          <h2>{text.breedHeader}</h2>
          <p className="breed-name">{data.breed}</p>
          <p className="breed-confidence">
            Confidence: {confidencePercent}%
          </p>
        </div>

        <div className="result-section">
          <h2>Smart Assessment</h2>
          <div className="assessment-score">
            <span className={`badge ${getBadgeClass(data.atc_lite_score)}`}>
              {data.atc_lite_score}
            </span>
          </div>
          <p className="assessment-info">{data.atc_lite_info}</p>
        </div>

      </div>
    </div>
  );
}

export default ResultCard;