import React, { useState, useEffect } from 'react';
import './ThemeSwitcher.css'; // We will create this file next

const ThemeSwitcher = () => {
  // Get theme from localStorage or default to 'green' (your :root default)
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'green');

  // Effect to apply the correct class to the <body>
  useEffect(() => {
    // Clear any existing theme classes
    document.body.classList.remove('blue-high-contrast');

    // Add the new theme class if it's not the default
    if (theme === 'blue') {
      document.body.classList.add('blue-high-contrast');
    }
    
    // Save the preference to localStorage
    localStorage.setItem('theme', theme);
  }, [theme]); // Rerun this effect whenever the 'theme' state changes

  // Toggle theme state between 'green' and 'blue'
  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'green' ? 'blue' : 'green'));
  };

  return (
    <button onClick={toggleTheme} className="theme-switcher-button" title="Toggle Theme">
      {/* Show a different icon based on the current theme */}
      {theme === 'green' ? '🎨' : '🌿'}
    </button>
  );
};

export default ThemeSwitcher;