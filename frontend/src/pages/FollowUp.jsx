// src/pages/FollowUp.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FollowUp() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    axios.get('https://my-prospecting-backend.onrender.com/sent-emails')
      .then(res => setContacts(res.data))
      .catch(console.error);
  }, []);

  const toggleAnswered = async (c) => {
    await axios.post('https://my-prospecting-backend.onrender.com/mark-answered', {
      firstName: c.firstName,
      lastName: c.lastName,
      company: c.company
    });
    setContacts(prev => prev.map(p => p.firstName === c.firstName && p.lastName === c.lastName && p.company === c.company ? { ...p, answered: !p.answered } : p));
  };

  return (
    <div className="p-4">
      <h2 className="text-2xl font-bold">Suivi des envois</h2>
      <table className="w-full mt-4">
        <thead className="bg-gray-100">
          <tr>
            <th className="text-left p-2">Nom</th>
            <th className="text-left p-2">Entreprise</th>
            <th className="text-left p-2">Date</th>
            <th className="text-center p-2">Réponse</th>
          </tr>
        </thead>
        <tbody>
          {contacts.map((c, i) => (
            <tr key={i} className="border-t">
              <td className="p-2">{c.firstName} {c.lastName}</td>
              <td className="p-2">{c.company}</td>
              <td className="p-2">{new Date(c.dateSent).toLocaleDateString()}</td>
              <td className="p-2 text-center">
                <input type="checkbox" checked={c.answered} onChange={() => toggleAnswered(c)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FollowUp;
