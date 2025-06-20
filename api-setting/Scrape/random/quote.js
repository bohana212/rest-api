// File: scraper-quotes-galau.js
const axios = require('axios');
const cheerio = require('cheerio');

async function getQuotesGalau() {
  try {
    const { data } = await axios.get('https://katabijak.co.id/kategori/kata-kata-galau');
    const $ = cheerio.load(data);

    const hasil = [];

    $('.isi-kutipan').each((i, el) => {
      const quote = $(el).text().trim();
      if (quote) hasil.push(quote);
    });

    console.log('Total:', hasil.length);
    console.log(hasil.slice(0, 10)); // tampilkan 10 dulu
  } catch (err) {
    console.error('Gagal mengambil quotes:', err.message);
  }
}

getQuotesGalau();
