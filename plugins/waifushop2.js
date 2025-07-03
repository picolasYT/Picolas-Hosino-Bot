import fs from 'fs';

let handler = async (m, { conn, args }) => {
  let ventas = [];
  try {
    ventas = JSON.parse(fs.readFileSync('./src/database/waifusVenta.json', 'utf-8'));
  } catch (e) {
    return m.reply('✘ No se pudo leer el archivo de waifus en venta.');
  }

  if (!ventas || ventas.length === 0) {
    return m.reply('✿ Actualmente no hay waifus en venta.');
  }

  // Paginación
  const page = args[0] ? parseInt(args[0]) : 1;
  const pageSize = 10;
  const totalPages = Math.ceil(ventas.length / pageSize);
  if (page < 1 || page > totalPages) {
    return m.reply(`✧ Página inválida. Solo hay *${totalPages}* página(s).`);
  }

  const inicio = (page - 1) * pageSize;
  const waifusPagina = ventas.slice(inicio, inicio + pageSize);

  let texto = `◢✿ *Waifus en venta* ✿◤\n\n`;
  for (let i = 0; i < waifusPagina.length; i++) {
    let { name, precio, vendedor } = waifusPagina[i];
    let username = await conn.getName(vendedor).catch(() => `@${vendedor.split('@')[0]}`);
    texto += `✰ ${inicio + i + 1} » *${name}*\n`;
    texto += `  🛒 Precio: *¥${precio.toLocaleString()} ᴅᴀʀᴋᴏs*\n`;
    texto += `  👤 Vendedor: @${vendedor.split('@')[0]}\n\n`;
  }

  texto += `> Página *${page}* de *${totalPages}*\n`;
  texto += `> Usa *#waifusventa ${page + 1}* para ver la siguiente.`;

  conn.sendMessage(m.chat, {
    text: texto,
    mentions: waifusPagina.map(w => w.vendedor)
  }, { quoted: m });
};

handler.help = ['waifusventa [página]'];
handler.tags = ['waifus'];
handler.command = ['waifusventa', 'waifusenventa'];
handler.group = true;
handler.register = true;

export default handler;
