// src/pages/FollowUp.jsx
import React, { useEffect, useState } from 'react';
import axios from 'axios';

function FollowUp() {
  const [sentEmails, setSentEmails] = useState([]);

  useEffect(() => {
    axios.get('https://my-prospecting-backend.onrender.com/sent-emails').then(res => setSentEmails(res.data));
  }, []);

  const toggleAnswered = async (index) => {
    const contact = sentEmails[index];
    await axios.post('https://my-prospecting-backend.onrender.com/mark-answered', {
      firstName: contact.firstName,
      lastName: contact.lastName,
      company: contact.company
    });
    const updated = [...sentEmails];
    updated[index].answered = !updated[index].answered;
    setSentEmails(updated);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto bg-white shadow rounded-xl mt-6">
      <h2 className="text-3xl font-bold text-blue-700 mb-4">📊 Suivi des mails envoyés</h2>
      <table className="table-auto w-full text-sm">
        <thead className="bg-blue-100">
          <tr>
            <th className="border px-2 py-1">Nom</th>
            <th className="border px-2 py-1">Entreprise</th>
            <th className="border px-2 py-1">Emails</th>
            <th className="border px-2 py-1">Date</th>
            <th className="border px-2 py-1">Réponse</th>
          </tr>
        </thead>
        <tbody>
          {sentEmails.map((item, idx) => (
            <tr key={idx} className="hover:bg-gray-50">
              <td className="border px-2 py-1">{item.firstName} {item.lastName}</td>
              <td className="border px-2 py-1">{item.company}</td>
              <td className="border px-2 py-1">{item.emails?.join(', ')}</td>
              <td className="border px-2 py-1">{new Date(item.dateSent).toLocaleDateString()}</td>
              <td className="border px-2 py-1 text-center">
                <input type="checkbox" checked={item.answered} onChange={() => toggleAnswered(idx)} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default FollowUp;
