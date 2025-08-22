import fetch from "node-fetch"
import yts from "yt-search"
import axios from "axios"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, usedPrefix, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `❀ Por favor, ingresa el nombre de la música a descargar.`, m)
    }

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind === null ? text : "https://youtu.be/" + videoIdToFind[1])

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2

    if (!ytplay2 || ytplay2.length == 0) {
      return m.reply("✧ No se encontraron resultados para tu búsqueda.")
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    title = title || "no encontrado"
    thumbnail = thumbnail || "no encontrado"
    timestamp = timestamp || "no encontrado"
    views = views || "no encontrado"
    ago = ago || "no encontrado"
    url = url || "no encontrado"
    author = author || "no encontrado"

    const vistas = formatViews(views)
    const canal = author.name ? author.name : "Desconocido"
    const infoMessage = `「✦」Descargando *<${title}>*\n\n> ✧ Canal » *${canal}*\n> ✰ Vistas » *${vistas}*\n> ⴵ Duración » *${timestamp}*\n> ✐ Publicado » *${ago}*\n> 🜸 Link » ${url}`
    const thumb = (await conn.getFile(thumbnail))?.data

    const JT = {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          previewType: 0,
          mediaUrl: url,
          sourceUrl: url,
          thumbnail: thumb,
          renderLargerThumbnail: true,
        },
      },
    }

    await conn.reply(m.chat, infoMessage, m, JT)

    // --- Descarga de Audio ---
    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      const audioApis = [
        async () => {
          const r = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json()
          return r?.result?.download?.url ? { link: r.result.download.url, title: r.result.metadata?.title || "audio" } : null
        },
        async () => {
          const r = await (await fetch(`https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${url}`)).json()
          return r?.status && r?.download ? { link: r.download, title: r.title || "audio" } : null
        },
        async () => {
          const r = await (await fetch(`https://api.stellarwa.xyz/dow/ytmp3?url=${url}&apikey=stellar-bFA8UWSA`)).json()
          return r?.status && r?.data?.dl ? { link: r.data.dl, title: r.data.title || "audio" } : null
        }
      ]

      let audioData = null
      for (const api of audioApis) {
        try {
          audioData = await api()
          if (audioData) break
        } catch { }
      }

      if (!audioData) return conn.reply(m.chat, "⚠︎ No se pudo obtener el audio de ninguna API.", m)

      await conn.sendMessage(m.chat, {
        audio: { url: audioData.link },
        fileName: audioData.title + ".mp3",
        mimetype: "audio/mpeg",
        ptt: true
      }, { quoted: m })
    }

    // --- Descarga de Video ---
    else if (["play2", "ytv", "ytmp4", "mp4"].includes(command)) {
      const videoApis = [
        async () => {
          const r = await (await fetch(`https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(url)}&apikey=sylph-30fc019324`)).json()
          return r?.status && r?.res?.url ? { link: r.res.url, title: r.res.title } : null
        },
        async () => {
          const r = await (await fetch(`https://gokublack.xyz/download/ytmp4?url=${encodeURIComponent(url)}`)).json()
          return r?.status && r?.data?.downloadURL ? { link: r.data.downloadURL, title: r.data.title } : null
        },
        async () => {
          const r = await (await fetch(`https://api.stellarwa.xyz/dow/ytmp4?url=${url}&apikey=stellar-bFA8UWSA`)).json()
          return r?.status && r?.data?.dl ? { link: r.data.dl, title: r.data.title } : null
        },
        async () => {
          const r = await (await fetch(`https://dark-core-api.vercel.app/api/download/ytmp4/v2?key=api&url=${url}`)).json()
          return r?.download ? { link: r.download, title: r.title } : null
        },
        async () => {
          const r = await (await fetch(`https://api.vreden.my.id/api/ytmp4?url=${url}`)).json()
          return r?.result?.download?.url ? { link: r.result.download.url, title: r.result.metadata?.title } : null
        }
      ]

      let videoData = null
      for (const api of videoApis) {
        try {
          videoData = await api()
          if (videoData) break
        } catch { }
      }

      if (!videoData) return conn.reply(m.chat, "⚠︎ No se pudo obtener el video de ninguna API.", m)

      await conn.sendFile(m.chat, videoData.link, videoData.title + ".mp4", title, m)
    }

    else {
      return conn.reply(m.chat, "✧︎ Comando no reconocido.", m)
    }

  } catch (error) {
    return m.reply(`⚠︎ Ocurrió un error: ${error}`)
  }
}

handler.command = handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"]
handler.tags = ["descargas"]
handler.group = true

export default handler

function formatViews(views) {
  if (views === undefined) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B (${views.toLocaleString()})`
  else if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M (${views.toLocaleString()})`
  else if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k (${views.toLocaleString()})`
  return views.toString()
}
