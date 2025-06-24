import yts from "yt-search";
import fetch from "node-fetch";

const APIKEY = "Sylphiette's";
const SIZE_LIMIT_MB = 100;

const newsletterJid = '120363335626706839@newsletter';
const newsletterName = '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino-Channel 』࿐⟡';

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
      body: "🎧 Ruby Hoshino Downloader",
      thumbnail: icons,
      sourceUrl: redes,
      mediaType: 1,
      renderLargerThumbnail: false
    }
  };

  if (!text) {
    return conn.reply(
      m.chat,
      `🌸 *Konnichiwa ${name}-chan~!* Necesito que me digas el nombre de un video o me pegues el link de YouTube 💕\n\n✨ *Ejemplos:*\n.play Shinzou wo Sasageyo\n.play https://youtu.be/xxx`,
      m,
      { contextInfo }
    );
  }

  await m.react("🕝");

  let search;
  try {
    search = await yts(text);
  } catch (err) {
    return conn.reply(m.chat, `❌ Error al buscar en YouTube: ${err.message}`, m, { contextInfo });
  }

  if (!search?.all || search.all.length === 0) {
    return conn.reply(m.chat, `💦 *Gomen ne, no encontré nada con:* "${text}"`, m, { contextInfo });
  }

  const video = search.all[0];

  const caption = `
╭─🎥『 𝒀𝒐𝒖𝒕𝒖𝒃𝒆 𝑷𝒍𝒂𝒚 』✦
│📌 *Título:* ${video.title}
│👤 *Autor:* ${video.author.name}
│⏱️ *Duración:* ${video.duration.timestamp}
│👁️ *Vistas:* ${video.views.toLocaleString()}
│🔗 *Link:* ${video.url}
╰─────────────────✦
`.trim();

  await conn.sendMessage(
    m.chat,
    {
      image: { url: video.thumbnail },
      caption,
      contextInfo
    },
    { quoted: m }
  );

  const urlAudio = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;
  const urlVideo = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;

  try {
    if (command === "play") {
      const resAudio = await fetch(urlAudio);
      const json = await resAudio.json();

      if (!json?.status || !json?.res?.downloadURL) {
        const cause = json?.message || json?.error || "desconocida";
        return conn.reply(m.chat, `❌ No pude obtener el audio, gomen~\n📛 *Causa:* ${cause}`, m, { contextInfo });
      }

      const audioUrl = json.res.downloadURL;
      const title = json.res.title || "audio.mp3";

      await conn.sendMessage(
        m.chat,
        {
          audio: { url: audioUrl },
          mimetype: "audio/mpeg",
          fileName: title + ".mp3",
          ptt: false
        },
        { quoted: m }
      );
      await m.react("🎶");

    } else if (command === "play2" || command === "playvid") {
      const resVideo = await fetch(urlVideo);
      const json = await resVideo.json();

      if (!json?.status || !json?.res?.url) {
        const cause = json?.message || json?.error || "desconocida";
        return conn.reply(m.chat, `❌ No se pudo obtener el video...\n📛 *Causa:* ${cause}`, m, { contextInfo });
      }

      const videoUrl = json.res.url;
      const title = json.res.title || "video.mp4";

      const head = await fetch(videoUrl, { method: "HEAD" });
      const contentLength = head.headers.get("content-length");
      const fileSizeMB = parseInt(contentLength || "0") / (1024 * 1024);
      const asDocument = fileSizeMB > SIZE_LIMIT_MB;

      await conn.sendMessage(
        m.chat,
        {
          video: { url: videoUrl },
          fileName: title,
          mimetype: "video/mp4",
          caption: `🎞️ *Listo ${name}-chan!* Aquí está tu video!`,
          contextInfo
        },
        {
          quoted: m,
          ...(asDocument ? { asDocument: true } : {})
        }
      );
      await m.react("🎥");
    }
  } catch (e) {
    console.error(e);
    return conn.reply(
      m.chat,
      `❌ *Ocurrió un error inesperado, ${name}-chan...*\n📛 *Causa:* ${e.message}`,
      m,
      { contextInfo }
    );
  }
};

handler.help = ["play", "play2", "playvid"];
handler.tags = ["descargas"];
handler.command = ["play", "play2", "playvid"];
handler.register = true;
handler.limit = true;

export default handler;
