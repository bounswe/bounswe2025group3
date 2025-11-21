import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next'; 
import {
  fetchWikidataDescriptionRecycling,
  fetchWikidataDescriptionSustainableDevelopment,
  fetchWikidataDescriptionCircularEconomy,
} from '../../services/wikidata';

const InfoBox = () => {
  const { t, i18n } = useTranslation(); 
  const [recyclingDesc, setRecyclingDesc] = useState(t('home.info_box.loading'));
  const [sustainableDesc, setSustainableDesc] = useState(t('home.info_box.loading'));
  const [circularEconomyDesc, setCircularEconomyDesc] = useState(t('home.info_box.loading'));

  useEffect(() => {

    const lang = i18n.language; 

    fetchWikidataDescriptionRecycling("Q132580", lang)
      .then(setRecyclingDesc)
      .catch(() => setRecyclingDesc(t('home.info_box.error')));

  
    
    fetchWikidataDescriptionSustainableDevelopment() 
      .then(setSustainableDesc)
      .catch(() => setSustainableDesc(t('home.info_box.error')));

    fetchWikidataDescriptionCircularEconomy("Q1062957", lang)
      .then(setCircularEconomyDesc)
      .catch(() => setCircularEconomyDesc(t('home.info_box.error')));

  }, [t, i18n.language]);

  return (
    <div className="info-box">
      <h3>♻️ {t('home.info_box.recycling_title')}</h3>
      <p>{recyclingDesc}</p>

      <h3>🧭 {t('home.info_box.sustainable_title')}</h3>
      <p>{sustainableDesc}</p>

      <h3>🔄 {t('home.info_box.circular_title')}</h3>
      <p>{circularEconomyDesc}</p>
    </div>
  );
};

export default InfoBox;