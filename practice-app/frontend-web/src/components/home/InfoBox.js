import React, { useEffect, useState } from 'react';
import {
  fetchWikidataDescriptionRecycling,
  fetchWikidataDescriptionSustainableDevelopment
} from '../../services/wikidata';

const InfoBox = () => {
  const [recyclingDesc, setRecyclingDesc] = useState("Loading recycling...");
  const [sustainableDesc, setSustainableDesc] = useState("Loading sustainable development...");

  useEffect(() => {
    fetchWikidataDescriptionRecycling()
      .then(setRecyclingDesc)
      .catch(() => setRecyclingDesc("Failed to load recycling description."));

    fetchWikidataDescriptionSustainableDevelopment()
      .then(setSustainableDesc)
      .catch(() => setSustainableDesc("Failed to load description."));
  }, []);

  return (
    <div className="info-box">
      <h3>♻️ What is Recycling?</h3>
      <p>{recyclingDesc}</p>

      <h3>🧭 What is Sustainable Development?</h3>
      <p>{sustainableDesc}</p>
    </div>
  );
};

export default InfoBox;