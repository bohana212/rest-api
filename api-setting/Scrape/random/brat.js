
// File: scraper-brat.js
const axios = require('axios');

async function getBrat(text) {
  try {
    const { data } = await axios.get(
      `https://aqul-brat.hf.space/?text=${encodeURIComponent(text)}`
    );

    console.log('Input:', text);
    console.log('Output Brat:', data);
  } catch (err) {
    console.error('Gagal mengambil dari Brat API:', err.message);
  }
}

// contoh panggilan
getBrat('halo');
