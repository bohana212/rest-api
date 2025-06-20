import axios from 'axios';

function formatNumber(integer) {
  let numb = parseInt(integer);
  return Number(numb).toLocaleString().replace(/,/g, '.');
}

function formatDate(n, locale = 'id') {
  let d = new Date(n * 1000);
  return d.toLocaleDateString(locale, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: 'numeric',
    minute: 'numeric',
    second: 'numeric'
  });
}

export default async function handler(req, res) {
  const { url } = req.query;
  if (!url) return res.status(400).json({ status: false, message: 'Parameter "url" diperlukan.' });

  try {
    const response = await axios.post('https://www.tikwm.com/api/', {}, {
      headers: {
        'Accept': 'application/json, text/javascript, */*; q=0.01',
        'Accept-Language': 'id-ID,id;q=0.9,en-US;q=0.8,en;q=0.7',
        'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
        'Origin': 'https://www.tikwm.com',
        'Referer': 'https://www.tikwm.com/',
        'User-Agent': 'Mozilla/5.0 (Linux; Android 10; K) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Mobile Safari/537.36',
        'X-Requested-With': 'XMLHttpRequest'
      },
      params: {
        url: url,
        hd: 1
      }
    });

    const resData = response.data.data;
    let data = [];

    if (resData && !resData.size && !resData.wm_size && !resData.hd_size) {
      resData.images.map(v => data.push({ type: 'photo', url: v }));
    } else {
      if (resData.wmplay) data.push({ type: 'watermark', url: resData.wmplay });
      if (resData.play) data.push({ type: 'nowatermark', url: resData.play });
      if (resData.hdplay) data.push({ type: 'nowatermark_hd', url: resData.hdplay });
    }

    res.status(200).json({
      status: true,
      title: resData.title,
      taken_at: formatDate(resData.create_time).replace('1970', ''),
      region: resData.region,
      id: resData.id,
      durations: resData.duration,
      duration: resData.duration + ' Seconds',
      cover: resData.cover,
      size_wm: resData.wm_size,
      size_nowm: resData.size,
      size_nowm_hd: resData.hd_size,
      data: data,
      music_info: {
        id: resData.music_info.id,
        title: resData.music_info.title,
        author: resData.music_info.author,
        album: resData.music_info.album || null,
        url: resData.music || resData.music_info.play
      },
      stats: {
        views: formatNumber(resData.play_count),
        likes: formatNumber(resData.digg_count),
        comment: formatNumber(resData.comment_count),
        share: formatNumber(resData.share_count),
        download: formatNumber(resData.download_count)
      },
      author: {
        id: resData.author.id,
        fullname: resData.author.unique_id,
        nickname: resData.author.nickname,
        avatar: resData.author.avatar
      }
    });
  } catch (err) {
    res.status(500).json({ status: false, message: 'Gagal ambil data.', error: err.message });
  }
}
