// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import FollowUp from './pages/FollowUp';

function App() {
  return (
    <Router>
      <div className="p-4 shadow-md flex gap-6 bg-white">
        <Link to="/">Prospection</Link>
        <Link to="/follow-up">Suivi</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/follow-up" element={<FollowUp />} />
      </Routes>
    </Router>
  );
}

export default App;