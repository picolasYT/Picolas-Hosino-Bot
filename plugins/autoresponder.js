import JavaScriptObfuscator from 'javascript-obfuscator';

var handler = async (m, { conn, text }) => {
  const loadings = [
    '《██▒▒▒▒▒▒▒▒▒▒▒》10%',
    '《████▒▒▒▒▒▒▒▒▒》30%',
    '《███████▒▒▒▒▒▒》50%',
    '《██████████▒▒▒》70%',
    '《█████████████》100%',
    '𝙻𝙾𝙰𝙳𝙸𝙽𝙶 𝙲𝙾𝙼𝙿𝙻𝙴𝚃𝙴𝙳...'
  ];

  let { key } = await conn.sendMessage(m.chat, { text: '_Loading_' });
  if (!text) return m.reply('*`🌹 INGRESA EL CÓDIGO QUE VAS A OFUSCAR`*');

  try {
    // Opciones avanzadas para máxima ofuscación
    const options = {
      compact: true,
      controlFlowFlattening: true,
      controlFlowFlatteningThreshold: 1,
      deadCodeInjection: true,
      deadCodeInjectionThreshold: 1,
      debugProtection: true,
      debugProtectionInterval: true,
      disableConsoleOutput: true,
      identifierNamesGenerator: 'hexadecimal',
      log: false,
      numbersToExpressions: true,
      renameGlobals: true,
      selfDefending: true,
      simplify: true,
      splitStrings: true,
      splitStringsChunkLength: 3,
      stringArray: true,
      stringArrayEncoding: ['rc4'],
      stringArrayIndexShift: true,
      stringArrayRotate: true,
      stringArrayShuffle: true,
      stringArrayWrappersCount: 5,
      stringArrayWrappersChainedCalls: true,
      stringArrayWrappersType: 'function',
      stringArrayThreshold: 1,
      transformObjectKeys: true,
      unicodeEscapeSequence: true
    };

    // Animación de carga
    for (let i = 0; i < loadings.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 350));
      await conn.sendMessage(m.chat, { text: loadings[i] }, { quoted: m });
    }

    // Ofuscar el código
    let obfuscatedCode = JavaScriptObfuscator.obfuscate(text, options).getObfuscatedCode();
    if (obfuscatedCode.length > 4000) {
      // Si es muy largo, lo envía como archivo
      await conn.sendMessage(
        m.chat,
        { document: Buffer.from(obfuscatedCode), mimetype: 'text/javascript', fileName: 'ofuscado.js' },
        { quoted: m }
      );
    } else {
      await conn.sendMessage(m.chat, { text: '```js\n' + obfuscatedCode + '\n```' }, { quoted: m });
    }
  } catch (e) {
    m.reply('*Error al ofuscar el código:*\n' + e.message);
  }
};

handler.command = /^(ofuscar|ofuscador)$/i;
export default handler;