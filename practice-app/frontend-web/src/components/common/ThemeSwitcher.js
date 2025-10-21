import React, { useState, useEffect } from 'react';
import './ThemeSwitcher.css';

const ThemeSwitcher = () => {
  const [theme, setTheme] = useState(localStorage.getItem('theme') || 'green');

  useEffect(() => {
    document.body.classList.remove('blue-high-contrast');
    if (theme === 'blue') {
      document.body.classList.add('blue-high-contrast');
    }
    localStorage.setItem('theme', theme);
    document.dispatchEvent(new CustomEvent('themeChanged'));
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'green' ? 'blue' : 'green'));
  };

  return (
    <div className="theme-switcher">
      <span className="theme-label">
      
      </span>
      <label className="switch">
        <input
          type="checkbox"
          checked={theme === 'blue'}
          onChange={toggleTheme}
        />
        <span className="slider">
          <span className="slider-icon">
            {theme === 'green' ? '🌿' : '🌊'}
          </span>
        </span>
      </label>
    </div>
  );
};

export default ThemeSwitcher;
