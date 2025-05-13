
import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';
import { useUser } from '../context/UserContext';

function Home() {
  const { userData, setUserData } = useUser();
  const [contacts, setContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [cvFile, setCvFile] = useState(userData.cvFile || null);
  const [otherFile, setOtherFile] = useState(userData.otherFile || null);

  const handleUserChange = (field, value) => {
    setUserData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const ext = file.name.split('.').pop().toLowerCase();

    if (ext === 'csv') {
      Papa.parse(file, {
        header: true,
        complete: results => parseContacts(results.data)
      });
    } else if (['xlsx', 'xls'].includes(ext)) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const workbook = XLSX.read(e.target.result, { type: 'binary' });
        const sheet = workbook.Sheets[workbook.SheetNames[0]];
        const data = XLSX.utils.sheet_to_json(sheet);
        parseContacts(data);
      };
      reader.readAsBinaryString(file);
    }
  };

  const generateEmails = (firstName, lastName, company) => {
    const f = firstName.toLowerCase();
    const l = lastName.toLowerCase();
    const domain = company.replace(/\s+/g, '').toLowerCase();

    const patterns = [
      `${f[0]}.${l}`,
      `${f}.${l}`,
      `${f}-${l}`,
      `${f[0]}.${l[0]}`,
      `${l}`,
      `${f}_${l}`,
      `${f}`,
      `${l}.${f}`,
      `${f}${l}`,
      `${f}${l[0]}`,
      `${f[0]}${l}`,
      `${l}_${f}`,
      `${f[0]}_${l}`
    ];

    const suffixes = ['.com', '.fr', '.io', '.org', '.co', '.dev'];

    return patterns.flatMap(p => suffixes.map(s => `${p}@${domain}${s}`));
  };

  const parseContacts = (rows) => {
    const parsed = rows.map(row => {
      const nameRaw = (row['C'] || '').replace(/LinkedIn\s*·\s*/gi, '').trim();
      const [firstName = '', ...lastNameParts] = nameRaw.split(' ');
      const lastName = lastNameParts.join(' ');
      const company = (row['I'] || 'Entreprise inconnue').trim();
      if (!firstName || !lastName || !company) return null;

      const emails = generateEmails(firstName, lastName, company);
      return { name: `${firstName} ${lastName}`, firstName, lastName, company, emails };
    }).filter(Boolean);

    setContacts(parsed);
  };

  const generateMessage = (contact) => {
    const { name, status, goal, startDate, experience, value, language } = userData;

    if (language === 'en') {
      return `Dear ${contact.name},\n\nI am currently ${status} and I am seeking ${goal} starting from ${startDate}.\nAfter gaining experience at ${experience}, I would be thrilled to join ${contact.company} to ${value}.\n\nPlease find attached my resume.\nBest regards,\n${name}`;
    } else {
      return `Bonjour ${contact.name},\n\nJe suis actuellement ${status} et je recherche ${goal} à partir de ${startDate}.\nAprès une expérience chez ${experience}, je serais ravie d'intégrer ${contact.company} pour ${value}.\n\nVous trouverez ci-joint mon CV.\nBien cordialement,\n${name}`;
    }
  };

  const handleSendEmail = async () => {
    const contact = contacts[currentIndex];
    const message = generateMessage(contact);

    const formData = new FormData();
    formData.append('message', message);
    formData.append('emails', JSON.stringify(contact.emails));
    formData.append('firstName', contact.firstName);
    formData.append('lastName', contact.lastName);
    formData.append('company', contact.company);
    formData.append('senderEmail', userData.senderEmail);
    formData.append('senderPassword', userData.senderPassword);
    if (cvFile) formData.append('cv', cvFile);
    if (otherFile) formData.append('otherFile', otherFile);

    await axios.post('https://my-prospecting-backend.onrender.com/send-email', formData);
    alert(`✅ Mail envoyé à ${contact.name}`);
    setCurrentIndex(i => Math.min(i + 1, contacts.length - 1));
  };

  const currentContact = contacts[currentIndex] || {};
  const message = currentContact.name ? generateMessage(currentContact) : '';

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6 bg-white shadow rounded-xl mt-6">
      <h2 className="text-3xl font-bold text-blue-700">📬 Prospection automatique</h2>

      <div className="grid grid-cols-2 gap-4">
        <input className="border p-2 rounded" placeholder="Votre nom" value={userData.name} onChange={e => handleUserChange('name', e.target.value)} />
        <select className="border p-2 rounded" value={userData.language} onChange={e => handleUserChange('language', e.target.value)}>
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <input className="border p-2 rounded" placeholder="Statut" value={userData.status} onChange={e => handleUserChange('status', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Objectif" value={userData.goal} onChange={e => handleUserChange('goal', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Date de début" value={userData.startDate} onChange={e => handleUserChange('startDate', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Expérience" value={userData.experience} onChange={e => handleUserChange('experience', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Valeur ajoutée" value={userData.value} onChange={e => handleUserChange('value', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Votre email d'envoi" value={userData.senderEmail} onChange={e => handleUserChange('senderEmail', e.target.value)} />
        <input className="border p-2 rounded" placeholder="Mot de passe d'application" value={userData.senderPassword} onChange={e => handleUserChange('senderPassword', e.target.value)} />
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="flex flex-col gap-1">
          <label className="text-sm">📎 CV</label>
          <input type="file" onChange={e => setCvFile(e.target.files[0])} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">📎 Fichier Excel/CSV</label>
          <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-sm">📎 Autre document</label>
          <input type="file" onChange={e => setOtherFile(e.target.files[0])} />
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded border">
        <h4 className="text-md font-semibold text-gray-700 mb-2">Prévisualisation du mail</h4>
        <pre className="whitespace-pre-wrap text-sm text-gray-800">{message}</pre>
      </div>

      {contacts.length > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-gray-600 text-sm">Contact {currentIndex + 1} sur {contacts.length}</p>
          <div className="flex gap-2">
            <button onClick={() => setCurrentIndex(i => Math.max(i - 1, 0))} className="bg-gray-300 px-4 py-2 rounded">⬅️ Précédent</button>
            <button onClick={handleSendEmail} className="bg-blue-600 text-white px-4 py-2 rounded">✉️ Envoyer</button>
            <button onClick={() => setCurrentIndex(i => Math.min(i + 1, contacts.length - 1))} className="bg-gray-300 px-4 py-2 rounded">Suivant ➡️</button>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;

