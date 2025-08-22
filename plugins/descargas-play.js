import fetch from "node-fetch"
import yts from "yt-search"

const youtubeRegexID = /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/

const handler = async (m, { conn, text, command }) => {
  try {
    if (!text.trim()) {
      return conn.reply(m.chat, `✧ 𝙃𝙚𝙮! Debes escribir *el nombre o link* del video/audio para descargar.`, m)
    }

    await conn.sendMessage(m.chat, { react: { text: "⏳", key: m.key }})

    let videoIdToFind = text.match(youtubeRegexID) || null
    let ytplay2 = await yts(videoIdToFind ? "https://youtu.be/" + videoIdToFind[1] : text)

    if (videoIdToFind) {
      const videoId = videoIdToFind[1]
      ytplay2 = ytplay2.all.find(item => item.videoId === videoId) || ytplay2.videos.find(item => item.videoId === videoId)
    }

    ytplay2 = ytplay2.all?.[0] || ytplay2.videos?.[0] || ytplay2
    if (!ytplay2) {
      await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
      return m.reply("⚠︎ No encontré resultados, intenta con otro nombre o link.")
    }

    let { title, thumbnail, timestamp, views, ago, url, author } = ytplay2
    const vistas = formatViews(views)
    const canal = author?.name || "Desconocido"

    const infoMessage = `
ㅤ۫ ㅤ  🦭 ୧   ˚ \`𝒅𝒆𝒔𝒄𝒂𝒓𝒈𝒂 𝒆𝒏 𝒄𝒂𝒎𝒊𝒏𝒐\` !  ୨ 𖹭  ִֶָ  

᮫ؙܹ  ᳘︵᮫ּܹ࡛〫ࣥܳ⌒ؙ۫ ᮫ּ۪֯⏝ֺ࣯࠭۟ ᮫ּ〪࣭︶᮫ܹ᳟〫࠭߳፝֟᷼⏜᮫᮫ּ〪࣭࠭〬︵᮫ּ᳝̼࣪ 🍚⃘ᩚּ̟߲ ּ〪࣪︵᮫࣭࣪࠭ᰯּ〪࣪࠭⏜ְ࣮〫߳ ᮫ּׅ࣪۟︶᮫ܹׅ࠭〬 ᮫ּּ࣭᷼⏝ᩥ᮫〪ܹ۟࠭۟۟ ᮫ּؙ⌒᮫ܹ۫︵ᩝּּ۟࠭ ࣭۪۟

> 🧊✿⃘࣪◌ ֪ `𝗧𝗶́𝘁𝘂𝗹𝗼` » *${title}*  
> 🧊✿⃘࣪◌ ֪ `𝗖𝗮𝗻𝗮𝗹` » *${canal}*  
> 🧊✿⃘࣪◌ ֪ `𝗗𝘂𝗿𝗮𝗰𝗶𝗼́𝗻` » *${timestamp}*  
> 🧊✿⃘࣪◌ ֪ `𝗩𝗶𝘀𝘁𝗮𝘀` » *${vistas}*  
> 🧊✿⃘࣪◌ ֪ `𝗣𝘂𝗯𝗹𝗶𝗰𝗮𝗱𝗼` » *${ago}*  
> 🧊✿⃘࣪◌ ֪ `𝗟𝗶𝗻𝗸` » ${url}  

ᓭ݄︢݃ୄᰰ𐨎 𝐢︩۪𝆬͡ꗜ፝֟͜͡ꗜ︪۪𝆬͡ 𝐢   ᅟᨳᩘ🧁ଓ   ᅟ 𝐢︩۪𝆬͡ꗜ፝֟͜͡ꗜ︪۪𝆬͡ 𝐢ୄᰰ𐨎ᓯ︢

> 𐙚 🪵 ｡ Preparando tu descarga... ˙𐙚
    `.trim()

    const thumb = (await conn.getFile(thumbnail))?.data
    await conn.reply(m.chat, infoMessage, m, {
      contextInfo: {
        externalAdReply: {
          title: botname,
          body: dev,
          mediaType: 1,
          thumbnail: thumb,
          renderLargerThumbnail: true,
          mediaUrl: url,
          sourceUrl: url
        }
      }
    })

    if (["play", "yta", "ytmp3", "playaudio"].includes(command)) {
      const audioApis = [
        async () => {
          const r = await (await fetch(`https://api.vreden.my.id/api/ytmp3?url=${url}`)).json()
          return r?.result?.download?.url ? { link: r.result.download.url, title: r.result.metadata?.title } : null
        },
        async () => {
          const r = await (await fetch(`https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${url}`)).json()
          return r?.status && r?.download ? { link: r.download, title: r.title } : null
        },
        async () => {
          const r = await (await fetch(`https://api.stellarwa.xyz/dow/ytmp3?url=${url}&apikey=stellar-bFA8UWSA`)).json()
          return r?.status && r?.data?.dl ? { link: r.data.dl, title: r.data.title } : null
        }
      ]

      let audioData = null
      for (const api of audioApis) {
        try { audioData = await api(); if (audioData) break } catch { }
      }

      if (!audioData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ Ninguna API respondió para el audio. Intenta más tarde.", m)
      }

      await conn.sendMessage(m.chat, {
        audio: { url: audioData.link },
        fileName: `${audioData.title || "music"}.mp3`,
        mimetype: "audio/mpeg",
        ptt: true
      }, { quoted: m })

      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
    }

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
        try { videoData = await api(); if (videoData) break } catch { }
      }

      if (!videoData) {
        await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
        return conn.reply(m.chat, "✦ Ninguna API respondió para el video. Intenta más tarde.", m)
      }

      await conn.sendFile(m.chat, videoData.link, (videoData.title || "video") + ".mp4", `✧ 𝗧𝗶́𝘁𝘂𝗹𝗼 » ${title}`, m)
      await conn.sendMessage(m.chat, { react: { text: "✅", key: m.key }})
    }

    else {
      return conn.reply(m.chat, "✧︎ Comando no válido, revisa el menú.", m)
    }

  } catch (error) {
    await conn.sendMessage(m.chat, { react: { text: "❌", key: m.key }})
    return m.reply(`⚠︎ Error inesperado:\n\n${error}`)
  }
}

handler.command = handler.help = ["play", "yta", "ytmp3", "play2", "ytv", "ytmp4", "playaudio", "mp4"]
handler.tags = ["descargas"]
handler.group = true

export default handler

function formatViews(views) {
  if (!views) return "No disponible"
  if (views >= 1_000_000_000) return `${(views / 1_000_000_000).toFixed(1)}B`
  if (views >= 1_000_000) return `${(views / 1_000_000).toFixed(1)}M`
  if (views >= 1_000) return `${(views / 1_000).toFixed(1)}k`
  return views.toString()
}
