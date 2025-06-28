import fs from 'fs';
import path from 'path';

let handler = async (m, { conn, args, usedPrefix, command }) => {
  if (!args[0]) {
    return m.reply(`✐ Debes especificar el nombre del archivo (sin .js)\n\nEjemplo:\n${usedPrefix + command} main-menu`);
  }
  let fileName = args[0].replace(/\.js$/i, '') + '.js';
  let filePath = path.join('plugins', fileName);

  if (!fs.existsSync(filePath)) {
    return m.reply(`✐ No existe el archivo plugins/${fileName}`);
  }

  try {
    // IMPORTACIÓN DINÁMICA para detectar errores de sintaxis ESM *sin ejecutar el handler*
    await import(path.resolve(filePath) + '?' + Date.now());
    m.reply(`✅ El archivo plugins/${fileName} **NO tiene errores de sintaxis.**`);
  } catch (error) {
    m.reply(`❌ Error de sintaxis en plugins/${fileName}:\n\n${error.message}\n\n${error.stack || ''}`);
  }
};
handler.help = ['sintaxis <archivo>'];
handler.tags = ['tools'];
handler.command = ['sintaxis'];
handler.register = true;
handler.rowner = true;

export default handler;