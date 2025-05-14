// src/components/home/InfoBox.js

import React, { useEffect, useState } from 'react';
import { fetchWikidataDescriptionRecycling } from '../../services/wikidata';

const InfoBox = () => {
  const [description, setDescription] = useState("Loading...");

  useEffect(() => {
    fetchWikidataDescriptionRecycling()
      .then(setDescription)
      .catch(() => setDescription("Failed to load description."));
  }, []);

  return (
    <div className="info-box">
      <h3>♻️ What is Recycling?</h3>
      <p>{description}</p>
    </div>
  );
};

export default InfoBox;
