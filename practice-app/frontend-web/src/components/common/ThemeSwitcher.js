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

    // *** THIS IS THE FIX ***
    // Dispatch a custom event on the document that other components can listen to.
    // This notifies the ForgotPasswordPage (and any other page) that the theme has changed.
    document.dispatchEvent(new CustomEvent('themeChanged'));
    // *** END OF FIX ***

  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'green' ? 'blue' : 'green'));
  };

  return (
    <button onClick={toggleTheme} className="theme-switcher-button" title="Toggle Theme">
      {theme === 'green' ? '🎨' : '🌿'}
    </button>
  );
};

export default ThemeSwitcher;