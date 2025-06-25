import JavaScriptObfuscator from 'javascript-obfuscator';

const handler = async (m, { conn, text, command }) => {
  if (!text) {
    return m.reply('🌹 Ingresa el código JavaScript que quieres ofuscar.\nEjemplo:\n.ofuscar console.log("Hola mundo")');
  }

  // Opciones muy agresivas de ofuscación
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
    splitStringsChunkLength: 2,
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

  // Proceso de ofuscación
  try {
    const obfuscated = JavaScriptObfuscator.obfuscate(text, options).getObfuscatedCode();

    // Si es muy largo, lo manda como archivo .js
    if (obfuscated.length > 4000) {
      await conn.sendMessage(
        m.chat,
        {
          document: Buffer.from(obfuscated),
          mimetype: 'text/javascript',
          fileName: 'codigo_ofuscado.js'
        },
        { quoted: m }
      );
      return m.reply('✅ Código ofuscado y enviado como archivo.');
    }
    // Si es corto, lo manda como mensaje de texto
    await conn.sendMessage(
      m.chat,
      {
        text: '```js\n' + obfuscated + '\n```'
      },
      { quoted: m }
    );
  } catch (e) {
    m.reply('❌ Error al ofuscar el código:\n' + (e && e.message ? e.message : e));
  }
};

// Comando: .ofuscar  o .obfuscate
handler.command = /^(ofuscar|obfuscate)$/i;
export default handler;