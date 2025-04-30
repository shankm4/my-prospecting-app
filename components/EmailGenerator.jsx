import React, { useState } from 'react';
import axios from 'axios';

function EmailGenerator({ data, language = 'fr' }) {
  const [experience, setExperience] = useState("EY Luxembourg et ESSEC Capital Investissement");
  const [situation, setSituation] = useState("étudiante en Master en Management à l'ESSEC Business School");
  const [recherche, setRecherche] = useState("un stage de 6 mois en M&A");
  const [date, setDate] = useState("janvier 2026");
  const [apport, setApport] = useState("contribuer à vos projets");
  const [lang, setLang] = useState(language);
  const [emailsEnvoyes, setEmailsEnvoyes] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [file, setFile] = useState(null);
  const [error, setError] = useState(null);

  const sanitizeName = (fullName) => {
    return fullName.replace(/^LinkedIn\s·\s/, '').trim();
  };

  const splitName = (name) => {
    const parts = name.split(' ');
    return {
      firstName: parts[0] || '',
      lastName: parts.slice(1).join(' ') || ''
    };
  };

  const generatePossibleEmails = (first, last, domain) => {
    const base = domain.replace(/\s|&|\.|,/g, '').toLowerCase();
    const emailFormats = [
      `${first}.${last}`,
      `${first}${last}`,
      `${first[0]}${last}`,
      `${last}.${first}`,
      `${last}${first}`,
      `${first}`,
      `${last}`
    ];
    const suffixes = ['.com', '.fr'];
    return emailFormats.flatMap(fmt => suffixes.map(suffix => `${fmt.toLowerCase()}@${base}${suffix}`));
  };

  const generateEmailText = (firstName, lastName, company) => {
    if (lang === 'fr') {
      return `Bonjour ${firstName} ${lastName},\n\nJe suis actuellement ${situation} et je recherche ${recherche} à partir de ${date}.\n\nAprès un stage en ${experience}, je souhaite vivement m'investir dans les opérations de M&A au sein d’une équipe dynamique telle que celle de ${company}.\n\nVous trouverez mon CV en pièce jointe. Je serais ravie d’échanger sur la manière dont je pourrais ${apport}.\n\nBien cordialement,\nShaïna Nkouankam`;
    } else {
      return `Dear ${firstName} ${lastName},\n\nI am currently a ${situation}, looking for ${recherche} starting from ${date}.\n\nAfter gaining experience at ${experience}, I am eager to deepen my exposure to deal-making within a dynamic and ambitious team like yours at ${company}.\n\nPlease find my resume attached. I would be delighted to discuss how I can ${apport}.\n\nBest regards,\nShaïna Nkouankam`;
    }
  };

  const envoyerEmail = async (email, name, entreprise, message) => {
    const formData = new FormData();
    formData.append('to', email);
    formData.append('subject', lang === 'fr' ? `Candidature spontanée – Stage en M&A chez ${entreprise}` : `Spontaneous Application – M&A Internship at ${entreprise}`);
    formData.append('text', message);
    if (file) {
      formData.append('file', file);
    }

    try {
      const response = await axios.post('http://localhost:5000/send', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      console.log(`Email envoyé à ${email}:`, response.data);
      setEmailsEnvoyes(prev => [...prev, { email, name, entreprise, date: new Date().toLocaleString() }]);
      return true; // Indicate success
    } catch (error) {
      console.error(`Erreur d'envoi à ${email}:`, error);
      setError(`Erreur d'envoi à ${email}: ${error.message}`);
      return false; // Indicate failure
    }
  };

  const envoyerTousLesEmails = async () => {
    const promises = emails.map(email => envoyerEmail(email, cleanedName, entreprise, emailBody));
    const results = await Promise.all(promises);
    if (results.every(result => result)) {
      setCurrentIndex(prev => prev + 1);
      setError(null); // Reset error if all emails are sent successfully
    } else {
      alert("Certains emails n'ont pas pu être envoyés.");
    }
  };

  if (!data || data.length === 0) return null;

  const currentContact = data[currentIndex];
  const rawName = currentContact["C"] || "LinkedIn · Inconnu";
  const cleanedName = sanitizeName(rawName);
  const { firstName, lastName } = splitName(cleanedName);
  const entreprise = currentContact["I"] || "votre entreprise";
  const emailBody = generateEmailText(firstName, lastName, entreprise);
  const emails = generatePossibleEmails(firstName, lastName, entreprise);

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold mb-4">📨 Email #{currentIndex + 1} sur {data.length}</h2>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label>Situation actuelle :</label>
          <input value={situation} onChange={(e) => setSituation(e.target.value)} className="border p-1 w-full" />
          <label>Ce que vous cherchez :</label>
          <input value={recherche} onChange={(e) => setRecherche(e.target.value)} className="border p-1 w-full" />
          <label>Date de début :</label>
          <input value={date} onChange={(e) => setDate(e.target.value)} className="border p-1 w-full" />
          <label>Expériences :</label>
          <input value={experience} onChange={(e) => setExperience(e.target.value)} className="border p-1 w-full" />
          <label>Apport :</label>
          <input value={apport} onChange={(e) => setApport(e.target.value)} className="border p-1 w-full" />
        </div>
        <div>
          <label>Langue :</label>
          <select value={lang} onChange={(e) => setLang(e.target.value)} className="border p-1 w-full">
            <option value="fr">Français</option>
            <option value="en">English</option>
          </select>
          <label className="block mt-4">Ajouter votre CV (PDF) :</label>
          <input type="file" accept=".pdf" onChange={(e) => setFile(e.target.files[0])} className="border p-1 w-full" />
        </div>
      </div>

      <div className="mb-6 border rounded p-4 shadow bg-white">
        <h3 className="font-semibold mb-2">À : {cleanedName} ({entreprise})</h3>
        <p className="text-sm mb-2 italic">
          Objet : {lang === 'fr' ? `Candidature spontanée – Stage en M&A chez ${entreprise}` : `Spontaneous Application – M&A Internship at ${entreprise}`}
        </p>
        <pre className="whitespace-pre-wrap text-sm bg-gray-100 p-2 mb-2">{emailBody}</pre>

        <button
          onClick={envoyerTousLesEmails}
          className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
        >
          ✅ Envoyer tous les emails et passer au suivant
        </button>

        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>

      <div className="flex justify-between mt-4">
        <button
          disabled={currentIndex === 0}
          onClick={() => setCurrentIndex(prev => Math.max(prev - 1, 0))}
          className="bg-gray-300 text-black px-4 py-2 rounded hover:bg-gray-400 disabled:opacity-50"
        >
          ⬅ Précédent
        </button>

        <button
          onClick={() => setCurrentIndex(prev => Math.min(prev + 1, data.length - 1))}
          className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
        >
          Suivant ➡
        </button>
      </div>

      {emailsEnvoyes.length > 0 && (
        <div className="mt-8">
          <h3 className="text-lg font-semibold mb-2">📊 Emails envoyés</h3>
          <table className="table-auto w-full text-sm border">
            <thead className="bg-gray-100">
              <tr>
                <th className="border p-1">Nom</th>
                <th className="border p-1">Entreprise</th>
                <th className="border p-1">Email</th>
                <th className="border p-1">Date</th>
              </tr>
            </thead>
            <tbody>
              {emailsEnvoyes.map((e, i) => (
                <tr key={i}>
                  <td className="border p-1">{e.name}</td>
                  <td className="border p-1">{e.entreprise}</td>
                  <td className="border p-1">{e.email}</td>
                  <td className="border p-1">{e.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export default EmailGenerator;
