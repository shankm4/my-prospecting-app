import React, { useState } from 'react';
import axios from 'axios';

function SendEmailWithAttachment() {
  const [file, setFile] = useState(null);
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState('');

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file || !email) {
      setStatus('Veuillez remplir tous les champs.');
      return;
    }

    const formData = new FormData();
    formData.append('email', email);
    formData.append('message', message);
    formData.append('cv', file);

    try {
      await axios.post('http://localhost:5000/send-email', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      setStatus('Email envoyé avec succès ! ✅');
    } catch (err) {
      console.error(err);
      setStatus("Erreur lors de l'envoi de l'email ❌");
    }
  };

  return (
    <div className="p-6 bg-white rounded shadow-md">
      <h2 className="text-lg font-semibold mb-4">📎 Envoyer un email avec votre CV</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label>Email du destinataire :</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="border p-2 w-full"
            required
          />
        </div>
        <div>
          <label>Message :</label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="border p-2 w-full"
            rows="5"
            placeholder="Votre message..."
          ></textarea>
        </div>
        <div>
          <label>Pièce jointe (CV en PDF) :</label>
          <input type="file" accept="application/pdf" onChange={handleFileChange} />
        </div>
        <button
          type="submit"
          className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
        >
          Envoyer
        </button>
        {status && <p className="mt-2 text-sm text-gray-700">{status}</p>}
      </form>
    </div>
  );
}

export default SendEmailWithAttachment;
