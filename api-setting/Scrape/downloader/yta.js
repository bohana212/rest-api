import ytdl from 'ytdl-core'

export default async function handler(req, res) {
  const { url } = req.query

  if (!url || !ytdl.validateURL(url)) {
    return res.status(400).json({ error: 'URL tidak valid' })
  }

  try {
    const info = await ytdl.getInfo(url)
    const audio = info.formats.find(
      f => f.mimeType?.includes('audio/webm') && f.audioBitrate
    )

    if (!audio) {
      return res.status(404).json({ error: 'Audio tidak ditemukan' })
    }

    const bytes = formatSize(audio.contentLength || '0')
    const result = {
      title: info.videoDetails.title,
      size: bytes,
      url: audio.url,
      thumb: info.videoDetails.thumbnails.pop().url,
      views: info.videoDetails.viewCount,
      channel: info.videoDetails.ownerChannelName,
      uploadDate: info.videoDetails.uploadDate,
      desc: info.videoDetails.description
    }

    res.status(200).json(result)
  } catch (err) {
    res.status(500).json({ error: 'Gagal memproses', detail: err.message })
  }
}

function formatSize(bytes) {
  const kb = bytes / 1024
  const mb = kb / 1024
  if (mb >= 1) return mb.toFixed(2) + ' MB'
  return kb.toFixed(2) + ' KB'
}