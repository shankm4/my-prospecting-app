// test-serper.js

const axios = require('axios');
require('dotenv').config();

async function testSerper() {
  const apiKey = process.env.SERPER_API_KEY;

  if (!apiKey) {
    console.error("❌ La clé SERPER_API_KEY n'est pas chargée. Vérifie ton fichier .env !");
    return;
  }

  try {
    const response = await axios.post('https://google.serper.dev/search', {
      q: "finance site:linkedin.com/in"
    }, {
      headers: {
        'X-API-KEY': apiKey,
        'Content-Type': 'application/json'
      }
    });

    console.log("✅ Succès ! Réponse de Serper.dev :", response.data);
  } catch (error) {
    console.error("❌ Erreur avec Serper.dev :", error.response?.data || error.message);
  }
}

testSerper();
