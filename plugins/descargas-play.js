import yts from "yt-search";
import fetch from "node-fetch";

const limit = 100;

const handler = async (m, { conn, text, command }) => {
  const name = await conn.getName(m.sender);

  if (!text) {
    return m.reply(`🌸 *Konnichiwa ${name}-chan~!* Necesito que me digas el nombre de un video o me pegues el link de YouTube 💕\n\n✨ *Ejemplos:*\n${command} Shinzou wo Sasageyo\n${command} https://youtu.be/xxx`);
  }

  await m.react("💖");

  let res = await yts(text);
  if (!res?.all?.length) return m.reply("💔 No se encontraron resultados para tu búsqueda.");

  const video = res.all[0];

  const cap = `
╭── ❍⃟💛 𝙍𝙪𝙗𝙮 - 𝙋𝙡𝙖𝙮 💛 ❍⃟──
│ 💮 *Título:* ${video.title}
│ 💮 *Duración:* ${video.duration?.timestamp || 'Desconocida'}
│ 💮 *Vistas:* ${video.views.toLocaleString()}
│ 💮 *Autor:* ${video.author.name}
│ 💮 *URL:* ${video.url}
╰───────────────💗
`;

  try {
    const thumbRes = await fetch(video.thumbnail);
    const thumbBuffer = Buffer.from(await thumbRes.arrayBuffer());
    await conn.sendFile(m.chat, thumbBuffer, "thumb.jpg", cap, m);
  } catch (e) {
    await m.reply("⚠️ No se pudo cargar la miniatura.");
  }

  if (command === "play") {
    try {
      const api = await fetch(`https://dark-core-api.vercel.app/api/download/YTMP3?key=api&url=${encodeURIComponent(video.url)}`).then(res => res.json());
      if (!api.status || !api.download) throw new Error("La API no devolvió un audio válido.");

      await conn.sendFile(m.chat, api.download, `${api.title || video.title}.mp3`, "", m);
      await m.react("✨");
    } catch (error) {
      await m.react("❌");
      return m.reply("❌ Error descargando audio:\n" + error.message);
    }
  } else if (command === "play2" || command === "playvid") {
    try {
      const api = await fetch(`https://api.stellarwa.xyz/dow/ytmp4?url=${video.url}&apikey=stellar-o7UYR5SC`).then(res => res.json());
      if (!api.status || !api.data?.dl) throw new Error("La API no devolvió un video válido.");

      const dl = api.data.dl;
      const head = await fetch(dl, { method: "HEAD" });
      const size = parseInt(head.headers.get("content-length") || "0");
      const isLarge = size / (1024 * 1024) >= limit;

      await conn.sendFile(m.chat, dl, `${video.title}.mp4`, "", m, null, {
        asDocument: isLarge,
        mimetype: "video/mp4",
      });

      await m.react("✨");
    } catch (error) {
      await m.react("❌");
      return m.reply("❌ Error descargando video:\n" + error.message);
    }
  }
};

handler.help = ["play", "play2"];
handler.tags = ["downloader"];
handler.command = ["play", "play2", "playvid"];

export default handler;
