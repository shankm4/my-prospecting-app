import React, { useState } from 'react';

const SendMail = () => {
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('to', to);
    formData.append('subject', subject);
    formData.append('text', text);
    formData.append('cv', file);

    try {
      const response = await fetch('http://localhost:3000/send-email', {
        method: 'POST',
        body: formData
      });

      const result = await response.json();
      if (result.success) alert("Email envoyé !");
      else alert("Échec : " + result.error);
    } catch (err) {
      console.error(err);
      alert("Erreur lors de l'envoi");
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 p-4">
      <input type="email" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Destinataire" className="border p-2 w-full" required />
      <input type="text" value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="Objet" className="border p-2 w-full" required />
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Contenu du message" className="border p-2 w-full" required />
      <input type="file" onChange={(e) => setFile(e.target.files[0])} accept=".pdf" className="w-full" />
      <button type="submit" className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
    </form>
  );
};

export default SendMail;


