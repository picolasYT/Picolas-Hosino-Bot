import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100; // Tamaño máximo en MB para enviar como video
const APIKEY = "Sylphiette's";

const newsletterJid = "120363335626706839@newsletter";
const newsletterName = "🌸 Ruby Hoshino Channel 🌸";

const handler = async (m, { conn, text, command }) => {
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
      title: package,
      body: "༻𝐵𝑈́𝑆𝑄𝑈𝐸𝐷𝐴𝑆 𝐷𝐸𝑆𝐷𝐸 𝑌𝑂𝑈𝑇𝑈𝐵𝐸༺",
      thumbnail: await (await fetch("https://i.imgur.com/4Kk2bNy.jpg")).buffer(),
      sourceUrl: "https://youtube.com",
      mediaType: 1,
      renderLargerThumbnail: true
    }
  };

  if (!text) return m.reply("🌱 *Ingresa el nombre de un video o una URL de YouTube~*", m, { contextInfo });
  await m.react("🔍");

  const res = await yts(text);
  if (!res || !res.all || res.all.length === 0) {
    await m.react("❌");
    return m.reply("😿 *No se encontraron resultados, gomen...*", m, { contextInfo });
  }

  const video = res.all[0];
  const urlAudio = `https://api.sylphy.xyz/download/ytmp3?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;
  const urlVideo = `https://api.sylphy.xyz/download/ytmp4?url=${encodeURIComponent(video.url)}&apikey=${APIKEY}`;

  const caption = `
─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
 𝆡𑘴⃞ֵ݄݁ׄ🫖ׄׄ ⃨֟፝★̫᤺.݁ׄ⋆⃨݁ 𝐏𝕝𝕒𝕪 𝕗𝕠𝕣 𝕪𝕠𝕦, 𝐨𝕟𝕚𝕚-𝕔𝕙𝕒𝕟~🌸
     ╰─ꨪᰰ━۪  ࣪  ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ ࣪🍵᮫໋⃨𝆬 ࣪ ׅ⏜ׄ᷼⌒╼࡙֟፝͝ ╾  
╭─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾ 
> 𑁯᧙  🍓 *Título:* ${video.title}
> 𑁯᧙  📏 *Duración:* ${video.duration.timestamp
> 𑁯᧙  👁️ *Vistas:*   ${video.views.toLocaleString()}
> 𑁯᧙  🎨 *Autor:* ${video.author.name}
> 𑁯᧙  📝 *vídeo url:* ${video.url}
╰─ꨪᰰ━۪  ࣪ ꨶ ╼ׄ ╼࡙֟፝͝⌒࣪᷼⏜ׅ 🍵᮫໋⃨𝆬 ࣪ ⏜ׄ᷼⌒╼࡙֟፝͝ ╾
💌 Arigatou por usarme, siempre estaré aquí para ti~ ✨
`.trim();

  await conn.sendFile(m.chat, video.thumbnail, "thumb.jpg", caption, m, null, {
    contextInfo
  });

  try {
    if (command === "play") {
      const resApi = await fetch(urlAudio);
      const json = await resApi.json();
      if (!json.status) throw new Error("No se pudo obtener el audio.");

      const audioUrl = json.res.downloadURL;
      const title = json.res.title || "audio";

      await conn.sendFile(m.chat, audioUrl, `${title}.mp3`, "", m, null, {
        mimetype: "audio/mpeg",
        contextInfo
      });
      await m.react("🎶");

    } else if (command === "play2" || command === "playvid") {
      const resApi = await fetch(urlVideo);
      const json = await resApi.json();
      if (!json.status) throw new Error("No se pudo obtener el video.");

      const videoUrl = json.res.url;
      const title = json.res.title || "video";

      const head = await fetch(videoUrl, { method: "HEAD" });
      const size = parseInt(head.headers.get("content-length") || "0");
      const sizeMB = size / (1024 * 1024);
      const asDocument = sizeMB >= limit;

      const expl = asDocument
        ? `📦 El video es muy pesado (${Math.ceil(sizeMB)} MB), así que lo envié como *documento*. Puedes descargarlo desde ahí 💾`
        : "";

      await conn.sendFile(m.chat, videoUrl, `${title}.mp4`, expl, m, null, {
        asDocument,
        mimetype: "video/mp4",
        contextInfo
      });
      await m.react("🎥");
    }
  } catch (e) {
    console.error(e);
    await m.react("❌");
    await m.reply(`⚠️ *Ocurrió un error:* ${e.message}`, m, { contextInfo });
  }
};

handler.help = ["play", "playvid", "play2"];
handler.tags = ["descargas"];
handler.command = ["play", "playvid", "play2"];

export default handler;