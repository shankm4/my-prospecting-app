// src/pages/Home.jsx
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';

function Home() {
  const [form, setForm] = useState({
    name: '', status: '', goal: '', startDate: '', experience: '', value: '', senderEmail: '', senderPassword: '',
  });
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [language, setLanguage] = useState('fr');
  const [contacts, setContacts] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [contactFile, setContactFile] = useState(null);
  const [extraFile, setExtraFile] = useState(null);

  const parseFile = () => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const workbook = XLSX.read(e.target.result, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const data = XLSX.utils.sheet_to_json(sheet, { header: 1 });
      const parsed = [];

      for (let i = 1; i < data.length; i++) {
        const nameCell = data[i][2] || '';
        const companyCell = data[i][8] || '';
        const parts = nameCell.replace('LinkedIn', '').replace('·', '').trim().split(' ');
        const firstName = parts[0] || '';
        const lastName = parts.slice(1).join(' ') || '';
        const company = companyCell.trim();
        if (!firstName || !lastName || !company) continue;
        parsed.push({ firstName, lastName, company });
      }
      setContacts(parsed);
    };
    if (contactFile) reader.readAsBinaryString(contactFile);
  };

  const generateBody = (contact) => {
    const { firstName, lastName, company } = contact;
    const { name, status, goal, startDate, experience, value } = form;
    if (language === 'fr') {
      return body || `Bonjour ${firstName} ${lastName},\n\nJe suis actuellement ${status} et je recherche ${goal} à partir de ${startDate}.\nAprès une expérience chez ${experience}, je serais ravie d'intégrer ${company} pour ${value}.\n\nVous trouverez ci-joint mon CV.\nBien cordialement,\n${name}`;
    } else {
      return body || `Dear ${firstName} ${lastName},\n\nI am currently ${status} and I am seeking ${goal} starting from ${startDate}.\nAfter gaining experience at ${experience}, I would be thrilled to join ${company} to ${value}.\n\nPlease find attached my resume.\nBest regards,\n${name}`;
    }
  };

  const send = async (contact) => {
    const formData = new FormData();
    formData.append('firstName', contact.firstName);
    formData.append('lastName', contact.lastName);
    formData.append('company', contact.company);
    formData.append('emails', JSON.stringify([]));
    formData.append('subject', subject);
    formData.append('message', generateBody(contact));
    formData.append('senderEmail', form.senderEmail);
    formData.append('senderPassword', form.senderPassword);
    if (cvFile) formData.append('cv', cvFile);
    if (extraFile) formData.append('otherFile', extraFile);
    await axios.post('https://my-prospecting-backend.onrender.com/send-email', formData);
  };

  return (
    <div className="p-4 space-y-6">
      <h2 className="text-2xl font-bold">Prospection</h2>
      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Votre nom" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="border p-2" />
        <select value={language} onChange={e => setLanguage(e.target.value)} className="border p-2">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <input placeholder="Situation actuelle" value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="border p-2" />
        <input placeholder="Objectif (ex: stage M&A)" value={form.goal} onChange={e => setForm({ ...form, goal: e.target.value })} className="border p-2" />
        <input placeholder="Date de début (ex: janvier 2026)" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })} className="border p-2" />
        <input placeholder="Expérience principale" value={form.experience} onChange={e => setForm({ ...form, experience: e.target.value })} className="border p-2" />
        <input placeholder="Ce que je peux apporter" value={form.value} onChange={e => setForm({ ...form, value: e.target.value })} className="border p-2" />
        <input placeholder="Adresse mail (expéditeur)" value={form.senderEmail} onChange={e => setForm({ ...form, senderEmail: e.target.value })} className="border p-2" />
        <input placeholder="Mot de passe d'application" value={form.senderPassword} onChange={e => setForm({ ...form, senderPassword: e.target.value })} className="border p-2" />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div>
          <label>CV (PDF)</label>
          <input type="file" onChange={(e) => setCvFile(e.target.files[0])} className="border p-2" />
        </div>
        <div>
          <label>Fichier de contacts (Excel/CSV)</label>
          <input type="file" onChange={(e) => setContactFile(e.target.files[0])} className="border p-2" />
        </div>
        <div>
          <label>Autre fichier (optionnel)</label>
          <input type="file" onChange={(e) => setExtraFile(e.target.files[0])} className="border p-2" />
        </div>
      </div>
      <button onClick={parseFile} className="bg-blue-500 text-white px-4 py-2 rounded">Importer les contacts</button>

      <div>
        <h3 className="text-lg font-semibold mt-6">Prévisualisation du mail générique</h3>
        <input value={subject} onChange={e => setSubject(e.target.value)} placeholder="Objet du mail" className="border p-2 w-full mb-2" />
        <textarea rows="8" value={body} onChange={e => setBody(e.target.value)} placeholder="Contenu du message..." className="border p-2 w-full" />
      </div>

      <div>
        <h3 className="text-lg font-semibold mt-6">Contacts importés</h3>
        {contacts.map((c, i) => (
          <div key={i} className="border p-2 mb-2 rounded flex justify-between items-center">
            <span>{c.firstName} {c.lastName} - {c.company}</span>
            <button onClick={() => send(c)} className="bg-green-600 text-white px-3 py-1 rounded">Envoyer</button>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Home;
