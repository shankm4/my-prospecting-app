const express = require('express');
const multer = require('multer');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const xlsx = require('xlsx');
const nodemailer = require('nodemailer');
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const app = express();
const cors = require('cors');

const allowedOrigins = [
  'https://my-prospecting-app.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

app.use(express.json());

const upload = multer({ dest: 'uploads/' });

// Connexion MongoDB
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ Connexion MongoDB réussie"))
  .catch(err => console.error("❌ Connexion MongoDB échouée :", err));

// Modèle Email
const emailSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  company: String,
  emails: [String],
  dateSent: Date,
  answered: { type: Boolean, default: false }
});

const Email = mongoose.model('Email', emailSchema);

// Fonction pour générer les emails
const generateEmails = (firstName, lastName, domain) => {
  const f = firstName.toLowerCase();
  const l = lastName.toLowerCase();
  const d = domain.replace(/\s+/g, '').toLowerCase() || 'gmail';

  const bases = [
    `${f}.${l}`, `${f}_${l}`, `${f}${l}`,
    `${f[0]}${l}`, `${f}${l[0]}`,
    `${l}.${f}`, `${l}${f}`,
    `${f[0]}.${l}`, `${l}.${f[0]}`,
    `${l}_${f}`, `${l}${f[0]}`,
    `${f}`, `${l}`, `${f}-${l}`, `${l}-${f}`,
    `${f[0]}${l[0]}`
  ];

  const suffixes = ['.com', '.fr'];

  const emails = [];
  for (const base of bases) {
    for (const suffix of suffixes) {
      emails.push(`${base}@${d}${suffix}`);
    }
  }
  return emails;
};

// Route Import CSV/Excel
app.post('/upload-csv', upload.single('file'), async (req, res) => {
  try {
    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rawData = xlsx.utils.sheet_to_json(sheet, { header: 1 });

    const contacts = [];

    for (let i = 1; i < rawData.length; i++) {
      const row = rawData[i];
      const nameCell = row[2] || '';
      const companyCell = row[8] || '';

      if (!nameCell) continue;

      let fullName = nameCell.replace('LinkedIn', '').replace('·', '').trim();
      const nameParts = fullName.split(' ').filter(Boolean);
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';

      let company = companyCell.trim();
      if (!company || company.toLowerCase().includes('linkedin') || company.toLowerCase().includes('unknown')) {
        company = '';
      }

      const emails = generateEmails(firstName, lastName, company);

      contacts.push({ firstName, lastName, company, emails });
    }

    fs.unlinkSync(req.file.path);
    res.send(contacts);
  } catch (error) {
    console.error('❌ Erreur parsing fichier:', error);
    res.status(500).send({ error: 'Erreur lecture du fichier.' });
  }
});

// Route Envoi Email
app.post('/send-email', upload.fields([{ name: 'cv' }, { name: 'otherFile' }]), async (req, res) => {
  try {
    const { firstName, lastName, company, emails, message, subject, senderEmail, senderPassword } = req.body;
    const emailList = JSON.parse(emails);

    const cvPath = req.files?.cv?.[0]?.path || null;
    const otherPath = req.files?.otherFile?.[0]?.path || null;

    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 465,
      secure: true,
      auth: {
        user: senderEmail,
        pass: senderPassword
      }
    });

    for (const email of emailList) {
      await transporter.sendMail({
        from: senderEmail,
        to: email,
        subject: subject,
        html: `<p>${message.replace(/\n/g, '<br>')}</p>`,
        attachments: [
          ...(cvPath ? [{ filename: req.files.cv[0].originalname, path: cvPath }] : []),
          ...(otherPath ? [{ filename: req.files.otherFile[0].originalname, path: otherPath }] : [])
        ]
      });

      await Email.updateOne(
        { firstName, lastName, company },
        { $addToSet: { emails: email }, dateSent: new Date(), answered: false },
        { upsert: true }
      );

      console.log(`✅ Email envoyé à ${email}`);
    }

    if (cvPath) fs.unlinkSync(cvPath);
    if (otherPath) fs.unlinkSync(otherPath);

    res.send({ success: true });
  } catch (error) {
    console.error('❌ Erreur envoi email:', error);
    res.status(500).send({ error: 'Erreur lors de l\'envoi de l\'email.' });
  }
});

// Route pour récupérer tous les emails envoyés
app.get('/sent-emails', async (req, res) => {
  try {
    const emails = await Email.find();
    res.send(emails);
  } catch (error) {
    console.error('❌ Erreur récupération emails envoyés:', error);
    res.status(500).send({ error: 'Erreur lors de la récupération.' });
  }
});

// Route pour marquer un email comme répondu
app.post('/mark-answered', async (req, res) => {
  try {
    const { firstName, lastName, company } = req.body;
    await Email.updateOne(
      { firstName, lastName, company },
      { $set: { answered: true } }
    );
    res.send({ success: true });
  } catch (error) {
    console.error('❌ Erreur update answered:', error);
    res.status(500).send({ error: 'Erreur lors de la mise à jour.' });
  }
});

// Route pour supprimer un contact
app.post('/delete-contact', async (req, res) => {
  try {
    const { firstName, lastName, company } = req.body;
    await Email.deleteOne({ firstName, lastName, company });
    res.send({ success: true });
  } catch (error) {
    console.error('❌ Erreur suppression contact:', error);
    res.status(500).send({ error: 'Erreur lors de la suppression.' });
  }
});

const PORT = process.env.PORT || 3001;
app.use((req, res, next) => {
  console.log('🔍 Requête reçue depuis :', req.headers.origin);
  next();
});

app.listen(PORT, () => {
  console.log(`🚀 Serveur backend lancé sur http://localhost:${PORT}`);
});
