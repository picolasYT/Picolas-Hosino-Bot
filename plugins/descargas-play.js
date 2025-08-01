import yts from "yt-search";
import fetch from "node-fetch";

const SIZE_LIMIT_MB = 100; // Límite de 100 MB para enviar como video, si no, como documento.
const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤‏⃪ً፝͟͞⁡⁎⊡『 Ruby-Hoshino-Channel 』༿⊡';

const API_MP3 = (url) => `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${url}`;
const API_MP4 = (url) => `https://api.stellarwa.xyz/dow/ytmp4?url=${url}&apikey=stellar-bFA8UWSA`;


const handler = async (m, { conn, text, command }) => {
  const name = conn.getName(m.sender);
  
  const contextInfo = {
    mentionedJid: [m.sender],
    isForwarded: true,
    forwardingScore: 999,
    forwardedNewsletterMessageInfo: {
      newsletterJid,
      newsletterName,
      serverMessageId: -1
    },
    externalAdReply: {
      title: packname,
      body: " ദ്ദി ᵔ ᴗ ᵔ ) 𝙍𝙪𝙗𝙮 𝙃𝙤𝙨𝙝𝙞𝙣𝙤 𝙙𝙚𝙨𝙘𝙖𝙧𝙜𝙖𝙨",
      thumbnail: icons,
      sourceUrl: 'https://github.com/Dioneibi-rip/Ruby-Hoshino-Bot',
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!text) {
    return conn.reply(m.chat,
      `🌸 *Konnichiwa ${name}-chan~!* Necesito que me digas el nombre de un video o me pegues el link de YouTube 💕\n\n✨ *Ejemplos:*\n.play Shinzou wo Sasageyo\n.play https://youtu.be/xxx`,
      m, { contextInfo });
  }

  await m.react("🕝"); // Reacción de espera

  const search = await yts(text);
  if (!search?.all || search.all.length === 0) {
    return conn.reply(m.chat, `💦 *Gomen ne, no encontré nada con:* "${text}"`, m, { contextInfo });
  }

  const video = search.all[0];

  const caption = `
> 🍓 *Título:* ${video.title}
> 📏 *Duración:* ${video.duration.timestamp}
> 👁️ *Vistas:* ${video.views.toLocaleString()}
> 🎨 *Autor:* ${video.author.name}
> 📍 *URL:* ${video.url}`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption,
    contextInfo
  }, { quoted: m });

  try {
    if (command === "play") {
      const apiUrl = API_MP3(video.url);
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status) {
        return conn.reply(m.chat, `❌ Error al obtener el audio. La API no respondió correctamente.`, m, { contextInfo });
      }

      await conn.sendMessage(m.chat, {
        audio: { url: json.download },
        mimetype: "audio/mpeg",
        fileName: json.title + ".mp3",
        ptt: true // Enviar como nota de voz
      }, { quoted: m });

      await m.react("🎶");

    } else if (command === "play2" || command === "playvid") {
      const apiUrl = API_MP4(video.url);
      const res = await fetch(apiUrl);
      const json = await res.json();

      if (!json.status || !json.data?.dl) {
        return conn.reply(m.chat, `❌ Error al obtener el video. La API no respondió correctamente.`, m, { contextInfo });
      }
      
      const downloadUrl = json.data.dl;

      const head = await fetch(downloadUrl, { method: "HEAD" });
      const sizeMB = parseInt(head.headers.get("content-length") || "0") / (1024 * 1024);
      
      const asDocument = sizeMB > SIZE_LIMIT_MB;

      await conn.sendMessage(m.chat, {
        video: { url: downloadUrl },
        caption: `🎥 *Listo ${name}-chan!* Aquí está tu video~`,
        fileName: json.data.title + ".mp4",
        mimetype: "video/mp4",
        ...(asDocument ? { asDocument: true } : {})
      }, {
        quoted: m
      });

      await m.react("🎥");
    }
  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `❌ *Ocurrió un error inesperado.*\n\n*Detalles:* \`\`\`${e.message}\`\`\``, m, { contextInfo });
  }
};

handler.help = ["play", "play2", "playvid"];
handler.tags = ["descargas"];
handler.command = ["play", "play2", "playvid"];
handler.register = true;
handler.limit = true;

export default handler;
