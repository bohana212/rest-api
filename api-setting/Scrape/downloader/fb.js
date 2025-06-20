const express = require('express');
const puppeteer = require('puppeteer');

const router = express.Router();

router.get('/downloader/facebookdl', async (req, res) => {
  const { url } = req.query;

  if (!url || !url.includes('facebook.com')) {
    return res.status(400).json({
      status: false,
      message: 'Masukkan parameter url Facebook yang valid',
    });
  }

  try {
    const browser = await puppeteer.launch({
      headless: 'new',
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'networkidle2', timeout: 0 });

    const result = await page.evaluate(() => {
      const video = document.querySelector('video');
      const source = video?.src || null;

      return {
        video: source,
      };
    });

    await browser.close();

    if (result.video) {
      res.json({
        status: true,
        creator: 'Hann - Ind',
        result: {
          url: result.video
        }
      });
    } else {
      res.status(404).json({
        status: false,
        message: 'Gagal menemukan video. Pastikan URL valid dan publik.'
      });
    }

  } catch (err) {
    res.status(500).json({
      status: false,
      message: 'Terjadi kesalahan saat memproses permintaan',
      error: err.message
    });
  }
});

module.exports = router;