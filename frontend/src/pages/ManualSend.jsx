// src/pages/ManualSend.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../context/UserContext';

function ManualSend() {
  const { userData } = useUser();
  const [form, setForm] = useState({ firstName: '', lastName: '', company: '' });
  const [emails, setEmails] = useState([]);
  const [customMessage, setCustomMessage] = useState('');

  useEffect(() => {
    if (form.firstName && form.lastName && form.company && userData.name) {
      const f = form.firstName.toLowerCase();
      const l = form.lastName.toLowerCase();
      const d = form.company.replace(/\s+/g, '').toLowerCase();
      const suffixes = ['.com', '.fr'];
      const bases = [
        `${f}.${l}`, `${f[0]}.${l}`, `${f[0]}${l}`, `${f}${l[0]}`, `${l}.${f}`,
        `${l}${f}`, `${f}_${l}`, `${f}${l}`, `${l}_${f}`, `${f}-${l}`
      ];
      const generated = bases.flatMap(base => suffixes.map(s => `${base}@${d}${s}`));
      setEmails(generated);

      const auto = userData.language === 'en'
        ? `Dear ${form.firstName} ${form.lastName},\n\nI am currently ${userData.status} and looking for ${userData.goal} starting from ${userData.startDate}.\nAfter gaining experience at ${userData.experience}, I would love to join ${form.company} to ${userData.value}.\n\nPlease find attached my resume.\n\nBest regards,\n${userData.name}`
        : `Bonjour ${form.firstName} ${form.lastName},\n\nJe suis actuellement ${userData.status} et je recherche ${userData.goal} à partir de ${userData.startDate}.\nAprès une expérience chez ${userData.experience}, je serais ravie d'intégrer ${form.company} pour ${userData.value}.\n\nVous trouverez ci-joint mon CV.\n\nBien cordialement,\n${userData.name}`;

      setCustomMessage(auto);
    }
  }, [form, userData]);

  const handleSend = async () => {
    const formData = new FormData();
    formData.append('firstName', form.firstName);
    formData.append('lastName', form.lastName);
    formData.append('company', form.company);
    formData.append('emails', JSON.stringify(emails));
    formData.append('subject', userData.language === 'en' ? 'Application - Internship Opportunity' : 'Candidature - Opportunité de stage');
    formData.append('message', customMessage);
    formData.append('senderEmail', userData.senderEmail);
    formData.append('senderPassword', userData.senderPassword);
    if (userData.cvFile) formData.append('cv', userData.cvFile);
    if (userData.otherFile) formData.append('otherFile', userData.otherFile);

    await axios.post('https://my-prospecting-backend.onrender.com/send-email', formData);
    alert('✅ Email envoyé !');
  };

  return (
    <div className="p-6 max-w-4xl mx-auto space-y-6 bg-white shadow rounded-xl mt-6">
      <h2 className="text-3xl font-bold text-blue-700">✍️ Envoi manuel</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <input placeholder="Prénom" className="border p-2 rounded" value={form.firstName} onChange={e => setForm({ ...form, firstName: e.target.value })} />
        <input placeholder="Nom" className="border p-2 rounded" value={form.lastName} onChange={e => setForm({ ...form, lastName: e.target.value })} />
        <input placeholder="Entreprise" className="border p-2 rounded col-span-2" value={form.company} onChange={e => setForm({ ...form, company: e.target.value })} />
      </div>
      <textarea rows="10" className="border p-3 rounded w-full text-sm" value={customMessage} onChange={e => setCustomMessage(e.target.value)} />
      <button onClick={handleSend} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded w-full mt-2">📤 Envoyer le mail</button>
    </div>
  );
}

export default ManualSend;

