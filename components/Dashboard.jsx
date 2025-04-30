import React, { useState } from 'react';
import axios from 'axios';

function Dashboard() {
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [jobTitle, setJobTitle] = useState('');
  const [city, setCity] = useState('');
  const [keyword, setKeyword] = useState('');
  const [situation, setSituation] = useState('');
  const [schoolOrCompany, setSchoolOrCompany] = useState('');
  const [experience, setExperience] = useState('');
  const [personalObjective, setPersonalObjective] = useState('');
  const [startDate, setStartDate] = useState('');
  const [signature, setSignature] = useState('');
  const [language, setLanguage] = useState('fr');
  const [cvFile, setCvFile] = useState(null);
  const [otherFile, setOtherFile] = useState(null);
  const [contacts, setContacts] = useState([]);
  const [customSubject, setCustomSubject] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [sentEmails, setSentEmails] = useState([]);
  const [senderEmail, setSenderEmail] = useState('');
  const [senderPassword, setSenderPassword] = useState('');
  const [sendingProgress, setSendingProgress] = useState(0);

  const openGoogleSearch = () => {
    const query = `site:linkedin.com/in \"${jobTitle}\" \"${city}\" \"${keyword}\"`;
    const url = `https://www.google.com/search?q=${encodeURIComponent(query)}`;
    window.open(url, '_blank');
  };

  const importContacts = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post('http://localhost:3001/upload-csv', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setContacts(prev => [...response.data, ...prev]);
    } catch (error) {
      console.error('Erreur import:', error);
      alert('Erreur lors de l\'importation du fichier.');
    }
  };

  const fetchSentEmails = async () => {
    try {
      const response = await axios.get('http://localhost:3001/sent-emails');
      setSentEmails(response.data);
      setCurrentPage('tracking');
    } catch (error) {
      console.error('Erreur récupération emails envoyés:', error);
      alert('Erreur lors de la récupération des emails envoyés.');
    }
  };

  const generateDefaultSubject = () => {
    return language === 'fr'
      ? 'Candidature spontanée - Stage/CDI'
      : 'Spontaneous Application - Internship/Full-Time';
  };

  const generateDefaultMessage = () => {
    if (language === 'fr') {
      return `Bonjour Prénom Nom,

Je me permets de vous contacter car je suis actuellement ${situation}. Je suis à la recherche d’un ${personalObjective} débutant en ${startDate}.

Après une expérience en ${experience}, je souhaite approfondir mon exposition au M&A au sein d’une équipe dynamique et ambitieuse comme la vôtre chez Entreprise.

Veuillez trouver ci-joint mon CV. Je serais ravie/ravi d’échanger avec vous sur la manière dont je pourrais contribuer à vos projets.

Cordialement,

${signature}`;
    } else {
      return `Dear FirstName LastName,

I hope this message finds you well. I am currently ${situation}, looking for a ${personalObjective} starting in ${startDate}.

After gaining experience in ${experience}, I am eager to deepen my exposure to M&A within a dynamic and ambitious team like yours at Company.

Please find my resume attached. I would be glad to connect and discuss how I could contribute to your team.

Best regards,

${signature}`;
    }
  };

  const personalizeMessage = (template, contact) => {
    return template
      .replace(/FirstName/g, contact.firstName)
      .replace(/LastName/g, contact.lastName)
      .replace(/Prénom/g, contact.firstName)
      .replace(/Nom/g, contact.lastName)
      .replace(/Entreprise/g, contact.company)
      .replace(/Company/g, contact.company);
  };

  const handleSendEmail = async (contact) => {
    if (!cvFile || !senderEmail || !senderPassword) {
      alert('Merci de remplir ton email, mot de passe d\'application et de téléverser ton CV avant l\'envoi.');
      return;
    }

    const templateMessage = customMessage || generateDefaultMessage();
    const personalizedMessage = personalizeMessage(templateMessage, contact);
    const subjectToSend = customSubject || generateDefaultSubject();

    const formData = new FormData();
    formData.append('firstName', contact.firstName);
    formData.append('lastName', contact.lastName);
    formData.append('company', contact.company);
    formData.append('emails', JSON.stringify(contact.emails));
    formData.append('message', personalizedMessage);
    formData.append('subject', subjectToSend);
    formData.append('language', language);
    formData.append('cv', cvFile);
    formData.append('otherFile', otherFile);
    formData.append('senderEmail', senderEmail);
    formData.append('senderPassword', senderPassword);

    try {
      await axios.post('http://localhost:3001/send-email', formData);
      alert(`Email envoyé à ${contact.firstName} ${contact.lastName}`);
      setContacts(prev => prev.filter(c => !(c.firstName === contact.firstName && c.lastName === contact.lastName && c.company === contact.company)));
      setSendingProgress(prev => prev + 1);
      fetchSentEmails();
    } catch (error) {
      console.error('Erreur envoi email:', error);
      alert('Erreur lors de l\'envoi.');
    }
  };

  const markAsAnswered = async (email) => {
    try {
      await axios.post('http://localhost:3001/mark-answered', {
        firstName: email.firstName,
        lastName: email.lastName,
        company: email.company
      });
      fetchSentEmails();
    } catch (error) {
      console.error('Erreur marquage répondu:', error);
      alert('Erreur lors du marquage.');
    }
  };

  const deleteContact = async (email) => {
    try {
      await axios.post('http://localhost:3001/delete-contact', {
        firstName: email.firstName,
        lastName: email.lastName,
        company: email.company
      });
      fetchSentEmails();
    } catch (error) {
      console.error('Erreur suppression:', error);
      alert('Erreur lors de la suppression.');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex gap-4 mb-6">
        <button onClick={() => setCurrentPage('dashboard')} className="bg-blue-500 text-white p-2 rounded">
          Prospection
        </button>
        <button onClick={fetchSentEmails} className="bg-green-500 text-white p-2 rounded">
          Suivi des Envois
        </button>
      </div>

      {currentPage === 'dashboard' && (
        <div>
          <h1 className="text-3xl font-bold">Dashboard de Prospection</h1>

          {/* Informations utilisateur */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <input type="email" placeholder="Votre email expéditeur" value={senderEmail} onChange={(e) => setSenderEmail(e.target.value)} className="border p-2 rounded" />
            <input type="password" placeholder="Mot de passe d'application" value={senderPassword} onChange={(e) => setSenderPassword(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Situation actuelle" value={situation} onChange={(e) => setSituation(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="École ou entreprise actuelle" value={schoolOrCompany} onChange={(e) => setSchoolOrCompany(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Expérience principale" value={experience} onChange={(e) => setExperience(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Objectif personnel" value={personalObjective} onChange={(e) => setPersonalObjective(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Date de début souhaitée" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="border p-2 rounded" />
            <input type="text" placeholder="Signature" value={signature} onChange={(e) => setSignature(e.target.value)} className="border p-2 rounded" />
          </div>

          <div className="flex gap-4 items-center mt-4">
            <select value={language} onChange={(e) => setLanguage(e.target.value)} className="border p-2 rounded">
              <option value="fr">Français</option>
              <option value="en">Anglais</option>
            </select>
            <button onClick={openGoogleSearch} className="bg-blue-600 text-white p-2 rounded">Recherche Google</button>
            <input type="file" accept=".csv, .xlsx" onChange={importContacts} className="border p-2" />
            <input type="file" onChange={(e) => setCvFile(e.target.files[0])} className="border p-2" />
            <input type="file" onChange={(e) => setOtherFile(e.target.files[0])} className="border p-2" />
          </div>

          <h2 className="text-2xl font-semibold">Progression : {sendingProgress} emails envoyés</h2>

          <h2 className="text-2xl font-semibold">Email Générique</h2>
          <input type="text" className="w-full border p-2 rounded" placeholder="Objet" value={customSubject || generateDefaultSubject()} onChange={(e) => setCustomSubject(e.target.value)} />
          <textarea rows="10" className="w-full border p-2 rounded" placeholder="Message" value={customMessage || generateDefaultMessage()} onChange={(e) => setCustomMessage(e.target.value)} />

          <h2 className="text-2xl font-semibold">Contacts Importés</h2>
          <div className="grid gap-4">
            {contacts.map((contact, index) => (
              <div key={index} className="border p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <p><strong>{contact.firstName} {contact.lastName}</strong> - {contact.company}</p>
                <button onClick={() => handleSendEmail(contact)} className="bg-green-600 text-white p-2 rounded">
                  Envoyer Email
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {currentPage === 'tracking' && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Suivi des Envois</h2>
          <div className="grid gap-4">
            {sentEmails.map((email, index) => (
              <div key={index} className="border p-4 rounded flex flex-col md:flex-row md:justify-between md:items-center gap-2">
                <p><strong>{email.firstName} {email.lastName}</strong> - {email.company}</p>
                <div className="flex gap-2 items-center">
                  <input type="checkbox" checked={email.answered} onChange={() => markAsAnswered(email)} />
                  <button onClick={() => deleteContact(email)} className="bg-red-500 text-white p-2 rounded">Supprimer</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
