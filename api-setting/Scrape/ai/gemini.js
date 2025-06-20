const axios = require('axios');

module.exports = async (req, res) => {
  const { q } = req.query;

  if (!q) {
    return res.status(400).json({
      status: false,
      message: 'Query parameter "q" diperlukan. Contoh: ?q=apa itu AI'
    });
  }

  const teks = encodeURIComponent(q);
  const urls = [
    'https://bk9.fun/ai/gemini?q=',
    'https://bk9.fun/ai/jeeves-chat?q=',
    'https://bk9.fun/ai/jeeves-chat2?q=',
    'https://bk9.fun/ai/mendable?q=',
    'https://bk9.fun/ai/Aoyo?q='
  ];

  for (let url of urls) {
    try {
      const { data } = await axios.get(url + teks);
      return res.json({
        status: true,
        creator: 'Hann',
        source: url,
        result: data
      });
    } catch (e) {
      // Lanjut ke URL berikutnya jika gagal
    }
  }

  return res.status(500).json({
    status: false,
    message: 'Semua server AI gagal merespon.'
  });
};