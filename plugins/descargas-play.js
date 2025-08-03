import yts from "yt-search";
import fetch from "node-fetch";

const SIZE_LIMIT_MB = 100;

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤‏⃪ً፝͟͞⁡⁎⊡『 Ruby-Hoshino-Channel 』༿⊡';

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
      body: "🎿 Ruby Hoshino Downloader",
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!text) {
    return conn.reply(m.chat,
      `🌸 *Konnichiwa ${name}-chan~!* Necesito que me digas el nombre de un video o me pegues el link de YouTube 💕\n\n✨ *Ejemplos:*\n.play Shinzou wo Sasageyo\n.play https://youtu.be/xxx`,
      m, { contextInfo });
  }

  let video;
  const isYTLink = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(text);

  if (isYTLink) {
    const id = text.split("v=")[1]?.split("&")[0] || text.split("/").pop();
    video = {
      url: text,
      title: "Video de YouTube",
      duration: { timestamp: "?" },
      views: 0,
      author: { name: "Desconocido" },
      thumbnail: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`
    };
  } else {
    const search = await yts(text);
    if (!search?.all || search.all.length === 0) {
      return conn.reply(m.chat, `💦 *Gomen ne, no encontré nada con:* "${text}"`, m, { contextInfo });
    }
    video = search.all[0];
  }

  const caption = `
> 🍓 *Título:* ${video.title}
> 📏 *Duración:* ${video.duration.timestamp || "?"}
> 👁️ *Vistas:* ${video.views?.toLocaleString?.() || "?"}
> 🎨 *Autor:* ${video.author?.name || "?"}
> 📍 *URL:* ${video.url}`.trim();

  await conn.sendMessage(m.chat, {
    image: { url: video.thumbnail },
    caption,
    contextInfo
  }, { quoted: m });

  try {
    if (command === "play" || command === "playaudio") {
      const api = `https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${video.url}`;
      const res = await fetch(api).then(r => r.json());

      if (!res.status || !res.download) {
        return conn.reply(m.chat, `❌ Error de audio:\n📋 *No se pudo obtener el MP3.*`, m, { contextInfo });
      }

      await conn.sendMessage(m.chat, {
        audio: { url: res.download },
        mimetype: "audio/mpeg",
        fileName: res.title + ".mp3",
        ptt: true
      }, { quoted: m });

      await m.react("🎶");

    } else if (["play2", "playvid", "playvideo"].includes(command)) {
      const api = `https://api.stellarwa.xyz/dow/ytmp4?url=${video.url}&apikey=stellar-bFA8UWSA`;
      const res = await fetch(api).then(r => r.json());

      if (!res.status || !res.data?.dl) {
        return conn.reply(m.chat, `❌ Error de video:\n📋 *No se pudo obtener el MP4.*`, m, { contextInfo });
      }

      let asDocument = false;
      try {
        const head = await fetch(res.data.dl, { method: "HEAD" });
        const sizeMB = parseInt(head.headers.get("content-length") || "0") / (1024 * 1024);
        asDocument = sizeMB > SIZE_LIMIT_MB;
      } catch { }

      await conn.sendMessage(m.chat, {
        video: { url: res.data.dl },
        caption: `🎥 *Listo ${name}-chan!* Aquí está tu video~`,
        fileName: res.data.title + ".mp4",
        mimetype: "video/mp4"
      }, {
        quoted: m,
        ...(asDocument ? { asDocument: true } : {})
      });

      await m.react("🎥");
    }

  } catch (e) {
    console.error(e);
    return conn.reply(m.chat, `❌ Error inesperado:\n\`\`\`${e.message}\`\`\``, m, { contextInfo });
  }
};

handler.help = ["play", "play2", "playvid", "playaudio", "playvideo"];
handler.tags = ["descargas"];
handler.command = ["play", "play2", "playvid", "playaudio", "playvideo"];
handler.register = true;
handler.limit = true;

export default handler;
