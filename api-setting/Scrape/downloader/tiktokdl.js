const axios = require('axios');

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: 'Parameter ?url= diperlukan' });

  try {
    const headers = {
      'accept': '*/*',
      'content-type': 'application/json',
      'origin': 'https://snapany.com',
      'referer': 'https://snapany.com/',
      'user-agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 16_6 like Mac OS X)...',
    };

    const response = await axios.post('https://api.snapany.com/v1/extract', { link: url }, { headers });

    const data = response.data.data;

    res.status(200).json({
      title: data.title,
      thumbnail: data.cover,
      video_no_wm: data.videoUrl,
      music: data.music,
      duration: data.duration,
      play_count: data.play_count,
      digg_count: data.digg_count,
      caption: data.title,
      tags: data.hashtags || []
    });
  } catch (err) {
    res.status(500).json({ error: 'Gagal fetch data', message: err.message });
  }
}