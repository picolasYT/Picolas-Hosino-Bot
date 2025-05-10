import { ogmp3 } from '../lib/youtubedl.js'
import yts from 'yt-search'

const handler = async (m, { conn, text, args, command }) => {
  if (!text) return m.reply('🔎 Ingresa un nombre de video o un link de YouTube.')

  try {
    const isYT = ogmp3.isUrl(text)
    let video, result

    if (isYT) {
      // Si es URL
      const search = await yts({ videoId: ogmp3.youtube(text) })
      video = search
    } else {
      // Si es búsqueda
      const busqueda = await yts(text)
      if (!busqueda || !busqueda.videos.length) return m.reply('❌ No se encontró ningún resultado.')
      video = busqueda.videos[0]
    }

    // Descargar video (por defecto a 720p)
    result = await ogmp3.download(video.url, '720', 'video')
    if (!result.status) return m.reply(`❌ Error: ${result.error}`)

    const { title, download, thumbnail, quality } = result.result
    const info = `🎬 *Título:* ${video.title}
👤 *Autor:* ${video.author.name}
⏱️ *Duración:* ${video.timestamp}
📆 *Publicado:* ${video.ago}
📹 *Calidad:* ${quality}p
🔗 *Link:* ${video.url}`

    // Enviar miniatura + información
    await conn.sendMessage(m.chat, {
      image: { url: thumbnail },
      caption: info,
      contextInfo: {
        externalAdReply: {
          title: title,
          body: 'Descarga MP4',
          thumbnailUrl: thumbnail,
          mediaType: 1,
          mediaUrl: video.url,
          sourceUrl: video.url
        }
      }
    })

    // Enviar el video
    await conn.sendMessage(m.chat, {
      video: { url: download },
      mimetype: 'video/mp4',
      fileName: `${title}.mp4`
    }, { quoted: m })

  } catch (e) {
    console.error(e)
    m.reply(`⚠️ Ocurrió un error: ${e.message}`)
  }
}

handler.command = ['play2']
handler.help = ['play2 <texto o link>']
handler.tags = ['descargas']

export default handler
