let handler = async (m, { conn }) => {
  const texto = `
⊹💞️ 𝐂𝐨𝐦𝐚𝐧𝐝𝐨𝐬 𝐠𝐚𝐜𝐡𝐚 𝐩𝐚𝐫𝐚 𝐜𝐨𝐥𝐞𝐜𝐜𝐢𝐨𝐧𝐚𝐫 𝐭𝐮𝐬 𝐩𝐞𝐫𝐬𝐨𝐧𝐚𝐣𝐞𝐬 𝐟𝐚𝐯𝐨𝐫𝐢𝐭𝐨𝐬 💞️⊹

ㅤۚ𑁯ׂᰍ  ☕ ᳴   ׅ  ׄʚ   ̶ *#rw • #rollwaifu*
> ✦ Invoca a un personaje aleatorio.

ㅤۚ𑁯ׂᰍ  ☕ ᳴   ׅ  ׄʚ   ̶ *#c • #claim*
> ✦ Reclama a tu personaje invocado.

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#vote*
> ✦ Sube el valor de tu personaje favorito. 

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#addrw*
> ✦ Has una peticion para que añadan el personaje que quieras.

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#harem*
> ✦ Verifica cuantos personajes reclamaste, y cuales tienes en tu harem.

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#wimage • #charimage*
> ✦ Ve una foto aleatoria de algun personaje.

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#topwaifus*
> ✦ Tabla de personajes que tienen alto valor.

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#winfo*
> ✦ Ve informacion sobre algun personaje. 

ㅤۚ𑁯ׂᰍ ☕ ᳴ ׅ ׄʚ ̶ *#regalar • #givewaifu
> ✦ Regala un personaje de tu harem a otro usuario.

╰──── ੈ₊˚༅༴╰────︶.︶ ⸙ ͛ ͎ ͛ ︶.︶ ੈ₊˚༅
  `.trim();

  conn.sendFile(m.chat, 'https://files.catbox.moe/tfxlnk.png', texto, m, false, {
    contextInfo: {
      mentionedJid: [m.sender],
      externalAdReply: {
        title: '🍭 Comandos gacha para reclamar tus personajes favoritos',
        body: 'Reclama, regala y sube de nivel tus personajes preferidos',
        thumbnailUrl: 'https://files.catbox.moe/3pw7bx.jpg',
        mediaType: 1,
        renderLargerThumbnail: false,
        showAdAttribution: true,
        mediaUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        sourceUrl: 'https://whatsapp.com/channel/0029VakLbM76mYPPFL0IFI3P',
        newsletterJid: '120363335626706839@newsletter',
        newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 𝙍𝙪𝙗𝙮 𝙃𝙤𝙨𝙝𝙞𝙣𝙤 𝘽𝙤𝙩 』࿐⟡'
      }
    }
  });
};

handler.command = ['menugacha', 'gachamenu', 'gacha'];
export default handler;