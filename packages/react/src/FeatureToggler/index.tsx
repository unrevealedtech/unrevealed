import React, { useState } from 'react';
import { FeatureList } from './FeatureList';
import styles from './styles.css';

export function FeatureToggler() {
  const [isVisible, setIsVisible] = useState(false);

  return (
    <>
      <style>{styles}</style>
      <div className="unrevealed-react-wrapper">
        {isVisible && <FeatureList />}
        <button
          className={`unrevealed-react-button ${
            isVisible ? 'unrevealed-react-button__active' : ''
          }`}
          onClick={() => setIsVisible((prev) => !prev)}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="icon icon-tabler icon-tabler-toggle-right"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            strokeWidth="1.5"
            stroke="#228be6"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path stroke="none" d="M0 0h24v24H0z" fill="none" />
            <circle cx="16" cy="12" r="2" />
            <rect x="2" y="6" width="20" height="12" rx="6" />
          </svg>
        </button>
      </div>
    </>
  );
}
