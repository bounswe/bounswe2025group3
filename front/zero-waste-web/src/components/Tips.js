import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Tips = () => {
  const [tips, setTips] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const response = await axios.get(
          'https://www.wikidata.org/w/api.php?action=query&list=search&srsearch=sustainability&format=json&origin=*'
        );
        setTips(response.data.query.search);
      } catch (err) {
        setError('Failed to fetch tips');
      }
    };
    fetchTips();
  }, []);

  return (
    <div>
      <h3>Eco-Friendly Tips</h3>
      {error && <p className="error">{error}</p>}
      <ul>
        {tips.length === 0 && !error ? (
          <p>Loading tips...</p>
        ) : (
          tips.map((tip) => <li key={tip.pageid}>{tip.title}</li>)
        )}
      </ul>
    </div>
  );
};

export default Tips;