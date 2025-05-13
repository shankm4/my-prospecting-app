// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import Home from './pages/Home';
import FollowUp from './pages/FollowUp';
import ManualSend from './pages/ManualSend';

function App() {
  return (
    <Router>
      <div className="p-4 shadow-md flex gap-6 bg-blue-100 text-blue-900 font-semibold">
        <Link to="/">📬 Prospection</Link>
        <Link to="/follow-up">📊 Suivi</Link>
        <Link to="/custom-send">✍️ Envoi manuel</Link>
      </div>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/follow-up" element={<FollowUp />} />
        <Route path="/custom-send" element={<ManualSend />} />
      </Routes>
    </Router>
  );
}

export default App;