import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // 👈 assure-toi que c'est bien "App" et pas un autre nom

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
