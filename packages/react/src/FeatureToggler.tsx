import React, { useContext } from 'react';
import { UnrevealedContext } from './context';

export function FeatureToggler() {
  const { allFeatures, filteredFeatures, setFilteredFeatures } =
    useContext(UnrevealedContext);

  return (
    <div
      style={{
        position: 'fixed',
        zIndex: 1000000,
        bottom: 32,
        right: 32,
        width: 200,
        background: '#E7F5FF',
        borderRadius: 5,
      }}
    >
      <ul style={{ listStyle: 'none', padding: 12, margin: 0 }}>
        {[...allFeatures].map((feature) => {
          const id = `unrevealed-switch-${feature}`;
          return (
            <li
              key={feature}
              style={{
                display: 'flex',
                gap: '8px',
                alignItems: 'center',
              }}
            >
              <input
                type="checkbox"
                name={feature}
                id={id}
                checked={!filteredFeatures.has(feature)}
                onChange={(event) => {
                  if (event.currentTarget.checked) {
                    setFilteredFeatures(
                      new Set(
                        [...filteredFeatures].filter((f) => feature !== f),
                      ),
                    );
                  } else {
                    setFilteredFeatures(
                      new Set([...filteredFeatures, feature]),
                    );
                  }
                }}
              />
              <label htmlFor={id}>{feature}</label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
