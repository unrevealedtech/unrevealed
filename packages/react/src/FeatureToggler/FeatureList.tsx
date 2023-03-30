import React, { useContext } from 'react';
import { UnrevealedContext } from '../context';

export function FeatureList() {
  const { allFeatures, filteredFeatures, setFilteredFeatures } =
    useContext(UnrevealedContext);

  const features = [...allFeatures].sort((a, b) => (a > b ? 1 : -1));

  const handleChange =
    (feature: string) => (event: React.ChangeEvent<HTMLInputElement>) => {
      if (event.currentTarget.checked) {
        setFilteredFeatures(
          new Set([...filteredFeatures].filter((f) => feature !== f)),
        );
      } else {
        setFilteredFeatures(new Set([...filteredFeatures, feature]));
      }
    };

  return (
    <div className="unrevealed-react-list-wrapper">
      <ul className="unrevealed-react-list">
        {features.map((feature) => {
          const id = `unrevealed-switch-${feature}`;
          return (
            <li key={feature} className="unrevealed-react-list-item">
              <input
                type="checkbox"
                name={feature}
                id={id}
                checked={!filteredFeatures.has(feature)}
                onChange={handleChange(feature)}
              />
              <label htmlFor={id}>{feature}</label>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
