import React, { useState } from 'react';
import axios from 'axios';
import * as XLSX from 'xlsx';
import Papa from 'papaparse';

export default function Dashboard() {
  const [contacts, setContacts] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [sentEmails, setSentEmails] = useState([]);
  const [language, setLanguage] = useState('fr');
  const [cvFile, setCvFile] = useState(null);

  const [userData, setUserData] = useState({
    name: '',
    status: '',
    goal: '',
    startDate: '',
    experience: '',
    value: ''
  });

  const generateEmails = (firstName, lastName, company) => {
    const base = company.replace(/ /g, '').toLowerCase();
    return [
      `${firstName}.${lastName}@${base}.com`,
      `${firstName[0]}${lastName}@${base}.com`,
      `${firstName}@${base}.com`,
      `${lastName}@${base}.com`,
      `${firstName}${lastName}@${base}.com`,
      `${firstName}-${lastName}@${base}.com`,
      `${lastName}.${firstName}@${base}.com`,
      `${firstName[0]}.${lastName}@${base}.com`,
      `${firstName}${lastName[0]}@${base}.com`,
      `${firstName}.${lastName}@${base}.fr`
    ].map(e => e.toLowerCase());
  };

  const parseContacts = (rows) => {
    const parsed = rows.map(row => {
      const nameRaw = (row['C'] || '').replace(/LinkedIn\s*\·\s*/gi, '').trim();
      const [firstName = '', ...lastNameParts] = nameRaw.split(' ');
      const lastName = lastNameParts.join(' ');
      const company = (row['I'] || 'Entreprise inconnue').trim();
      if (!firstName || !lastName || !company) return null;
      return {
        name: `${firstName} ${lastName}`,
        firstName,
        lastName,
        company,
        emails: generateEmails(firstName.toLowerCase(), lastName.toLowerCase(), company)
      };
    }).filter(Boolean);
    setContacts(parsed);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    const ext = file.name.split('.').pop();
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
    } else {
      alert('Fichier non supporté');
    }
  };

  const generateMessage = (contact) => {
    const { name, company } = contact;
    const { status, goal, startDate, experience, value } = userData;
    if (language === 'fr') {
      return `Bonjour ${name},\n\nJe suis actuellement ${status} et je recherche ${goal} à partir de ${startDate}.\nAprès une expérience chez ${experience}, je serais ravie d'intégrer ${company} pour ${value}.\n\nVous trouverez ci-joint mon CV.\nBien cordialement,\n${userData.name}`;
    } else {
      return `Dear ${name},\n\nI am currently ${status} and I am seeking ${goal} starting from ${startDate}.\nAfter gaining experience at ${experience}, I would be thrilled to join ${company} to ${value}.\n\nPlease find attached my resume.\nBest regards,\n${userData.name}`;
    }
  };

  const handleSendEmail = async () => {
    const contact = contacts[currentIndex];
    const message = generateMessage(contact);
    const formData = new FormData();
    formData.append('message', message);
    formData.append('emails', JSON.stringify(contact.emails));
    if (cvFile) formData.append('cv', cvFile);

    try {
      await axios.post('http://localhost:3001/send-email', formData);
      const newSent = {
        name: contact.name,
        company: contact.company,
        email: contact.emails.join(', '),
        date: new Date().toISOString().split('T')[0],
        answered: false
      };
      setSentEmails(prev => [...prev, newSent]);
      setCurrentIndex(i => Math.min(i + 1, contacts.length - 1));
    } catch (err) {
      console.error('Erreur envoi :', err);
    }
  };

  const toggleAnswered = (idx) => {
    const updated = [...sentEmails];
    updated[idx].answered = !updated[idx].answered;
    setSentEmails(updated);
  };

  const currentContact = contacts[currentIndex] || { name: '', company: '', emails: [] };
  const message = currentContact.name ? generateMessage(currentContact) : '';

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-bold">Prospection</h2>

      <div className="grid grid-cols-2 gap-4">
        <input placeholder="Votre nom" className="border p-2" value={userData.name} onChange={e => setUserData({ ...userData, name: e.target.value })} />
        <select value={language} onChange={e => setLanguage(e.target.value)} className="border p-2">
          <option value="fr">Français</option>
          <option value="en">English</option>
        </select>
        <input placeholder="Statut" className="border p-2" value={userData.status} onChange={e => setUserData({ ...userData, status: e.target.value })} />
        <input placeholder="Objectif" className="border p-2" value={userData.goal} onChange={e => setUserData({ ...userData, goal: e.target.value })} />
        <input placeholder="Date de début" className="border p-2" value={userData.startDate} onChange={e => setUserData({ ...userData, startDate: e.target.value })} />
        <input placeholder="Expérience" className="border p-2" value={userData.experience} onChange={e => setUserData({ ...userData, experience: e.target.value })} />
        <input placeholder="Valeur ajoutée" className="border p-2" value={userData.value} onChange={e => setUserData({ ...userData, value: e.target.value })} />
        <input type="file" accept=".pdf" onChange={e => setCvFile(e.target.files[0])} className="border p-2" />
        <input type="file" accept=".csv,.xlsx,.xls" onChange={handleFileUpload} className="border p-2" />
      </div>

      {contacts.length > 0 && (
        <div className="border p-4 rounded shadow">
          <h4 className="text-lg font-bold mb-2">Message pour {currentContact.name} ({currentContact.company})</h4>
          <pre className="bg-gray-100 p-2 text-sm whitespace-pre-wrap mb-4">{message}</pre>
          <div className="flex gap-2 mb-3">
            <button onClick={handleSendEmail} className="bg-blue-600 text-white px-4 py-2 rounded">Envoyer</button>
            <button onClick={() => setCurrentIndex(i => Math.max(0, i - 1))} className="bg-gray-300 px-4 py-2 rounded">Précédent</button>
            <button onClick={() => setCurrentIndex(i => Math.min(contacts.length - 1, i + 1))} className="bg-gray-300 px-4 py-2 rounded">Suivant</button>
          </div>
        </div>
      )}

      <div>
        <h3 className="text-xl font-bold mb-2">Suivi des emails envoyés</h3>
        <table className="table-auto w-full text-sm">
          <thead className="bg-gray-100">
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
              <tr key={idx}>
                <td className="border px-2 py-1">{item.name}</td>
                <td className="border px-2 py-1">{item.company}</td>
                <td className="border px-2 py-1">{item.email}</td>
                <td className="border px-2 py-1">{item.date}</td>
                <td className="border px-2 py-1 text-center">
                  <input type="checkbox" checked={item.answered} onChange={() => toggleAnswered(idx)} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
