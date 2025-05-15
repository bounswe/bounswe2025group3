import React, { useEffect, useState } from 'react';
import {
  fetchWikidataDescriptionRecycling,
  fetchWikidataDescriptionSustainableDevelopment,
  fetchWikidataDescriptionWasteManagement,
  fetchWikidataDescriptionCircularEconomy,
} from '../../services/wikidata';

const InfoBox = () => {
  const [recyclingDesc, setRecyclingDesc] = useState("Loading recycling...");
  const [sustainableDesc, setSustainableDesc] = useState("Loading sustainable development...");
  const [wasteManagementDesc, setWasteManagementDesc] = useState("Loading waste management...");
  const [circularEconomyDesc, setCircularEconomyDesc] = useState("Loading circular economy...");

  useEffect(() => {
    fetchWikidataDescriptionRecycling()
      .then(setRecyclingDesc)
      .catch(() => setRecyclingDesc("Failed to load recycling description."));
   
    fetchWikidataDescriptionSustainableDevelopment()
      .then(setSustainableDesc)
      .catch(() => setSustainableDesc("Failed to load description."));
     fetchWikidataDescriptionWasteManagement()
      .then(setWasteManagementDesc)
      .catch(() => setWasteManagementDesc("Failed to load waste management description."));

    fetchWikidataDescriptionCircularEconomy()
    .then(setCircularEconomyDesc)
    .catch(() => setCircularEconomyDesc("Failed to load circular economy description."));
  }, []);

  return (
    <div className="info-box">
      <h3>♻️ What is Recycling?</h3>
      <p>{recyclingDesc}</p>

      <h3>🧭 What is Sustainable Development?</h3>
      <p>{sustainableDesc}</p>
      <h3>🔄 What is Waste Management?</h3>
      <p>{wasteManagementDesc}</p>
      <h3>🔄 What is Circular Economy?</h3>
      <p>{circularEconomyDesc}</p>
    </div>
  );
};

export default InfoBox;
