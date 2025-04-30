// src/pages/ManualSend.jsx
import React, { useState } from 'react';
import axios from 'axios';

function ManualSend() {
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    company: '',
    email: '',
    senderEmail: '',
    senderPassword: '',
    subject: '',
    message: ''
  });

  const [cv, setCv] = useState(null);
  const [other, setOther] = useState(null);

  const generateMessage = () => {
    return `Dear ${form.firstName} ${form.lastName},\n\nI hope this message finds you well. I am currently looking for new opportunities and I would be thrilled to contribute to ${form.company}.\n\nPlease find attached my resume.\nBest regards,`;
  };

  const handleSend = async () => {
    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('company', form.company);
    formData.append('emails', JSON.stringify([form.email]));
    formData.append('subject', form.subject);
    formData.append('message', form.message || generateMessage());
    formData.append('senderEmail', form.senderEmail);
    formData.append('senderPassword', form.senderPassword);
    if (cv) formData.append('cv', cv);
    if (other) formData.append('otherFile', other);

    await axios.post('https://my-prospecting-backend.onrender.com/send-email', formData);
    alert('✅ Email envoyé !');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white shadow rounded-xl mt-6">
      <h2 className="text-3xl font-bold text-blue-700">📤 Envoi manuel</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Prénom" className="border p-2 rounded" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        <input placeholder="Nom" className="border p-2 rounded" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        <input placeholder="Entreprise" className="border p-2 rounded" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
        <input placeholder="Email du contact" className="border p-2 rounded" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
        <input placeholder="Adresse email d'envoi" className="border p-2 rounded" value={form.senderEmail} onChange={e => setForm({ ...form, senderEmail: e.target.value })} />
        <input placeholder="Mot de passe d'application" className="border p-2 rounded" value={form.senderPassword} onChange={e => setForm({ ...form, senderPassword: e.target.value })} />
      </div>
      <input placeholder="Objet du mail" className="border p-2 rounded w-full" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} />
      <textarea rows="8" className="border p-2 rounded w-full text-sm" placeholder="Message (facultatif)" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} />
      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">📎 CV</label>
          <input type="file" onChange={e => setCv(e.target.files[0])} />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-sm font-medium text-gray-600">📎 Autre document</label>
          <input type="file" onChange={e => setOther(e.target.files[0])} />
        </div>
      </div>
      <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded w-full mt-4">Envoyer le mail</button>
    </div>
  );
}

export default ManualSend;
