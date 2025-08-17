import fetch from "node-fetch";
import crypto from "crypto";
import { FormData, Blob } from "formdata-node";
import { fileTypeFromBuffer } from "file-type";

const handler = async (m, { conn }) => {
  let q = m.quoted ? m.quoted : m;
  let mime = (q.msg || q).mimetype || '';

  if (!mime || !/image\/(png|jpe?g)/.test(mime)) {
    return conn.reply(m.chat, `❌ Por favor, responde a una *imagen válida* (jpg o png).`, m);
  }

  await m.react("⏳");
  let processingMsg = await conn.reply(m.chat, `✨ Procesando tu imagen...\n\nEsto puede tardar unos segundos ⏱️`, m);

  try {
    let media = await q.download();

    let link = await catbox(media);

    let apiUrl = `https://api.siputzx.my.id/api/iloveimg/upscale?image=${encodeURIComponent(link)}&scale=2`;
    let res = await fetch(apiUrl, { method: "GET" });
    let result = await res.json();

    if (!result.status) {
      await m.react("❌");
      return conn.reply(m.chat, `❌ Error al mejorar la imagen:\n\n📋 ${JSON.stringify(result, null, 2)}`, m);
    }

    let upscaleUrl = result.result || result.url || null;
    if (!upscaleUrl) {
      await m.react("❌");
      return conn.reply(m.chat, `❌ La API no devolvió un enlace válido.`, m);
    }

    await m.react("✅");
    await conn.sendMessage(m.chat, {
      image: { url: upscaleUrl },
      caption: `✨ Aquí tienes tu imagen mejorada en HD 🖼️\n\n✅ Proceso completado con éxito.`
    }, { quoted: m });

    await conn.sendMessage(m.chat, { delete: processingMsg.key });

  } catch (e) {
    console.error(e);
    await m.react("❌");
    conn.reply(m.chat, `❌ Error inesperado al procesar la imagen:\n\`\`\`${e.message}\`\`\``, m);
  }
};

handler.help = ["hd", "mejorarimg"];
handler.tags = ["tools", "ai"];
handler.command = ["remini", "hd", "enhance"];
handler.limit = true;
handler.register = true;

export default handler;

async function catbox(content) {
  const { ext, mime } = (await fileTypeFromBuffer(content)) || {};
  const blob = new Blob([content.toArrayBuffer()], { type: mime });
  const formData = new FormData();
  const randomBytes = crypto.randomBytes(5).toString("hex");
  formData.append("reqtype", "fileupload");
  formData.append("fileToUpload", blob, randomBytes + "." + ext);

  const response = await fetch("https://catbox.moe/user/api.php", {
    method: "POST",
    body: formData,
    headers: {
      "User-Agent":
        "Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/44.0.2403.157 Safari/537.36",
    },
  });

  return await response.text();
}
