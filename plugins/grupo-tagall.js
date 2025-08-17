/* - tagall By TuNombreAqui
- Mención minimalista para todos los miembros.
- [Puedes agregar tu canal o red social aquí]
*/
const handler = async (m, { isOwner, isAdmin, conn, text, participants, args, command, usedPrefix }) => {
  // Evita la ejecución con prefijos accidentales
  if (usedPrefix == 'a' || usedPrefix == 'A') return;

  // --- Personalización ---
  const emoji = '🩵'; // Tu nuevo emoji para la lista
  const botname = global.botname || 'TuBot'; // Asegura que haya un nombre de bot
  
  // Reacciona al mensaje para confirmar que el comando fue recibido
  m.react('✅');

  // Verifica si el usuario es admin o el dueño del bot
  if (!(isAdmin || isOwner)) {
    global.dfail('admin', m, conn);
    throw false;
  }

  // Une los argumentos para formar el mensaje. Si no hay mensaje, pone uno por defecto.
  const mensaje = args.join` ` || 'Atención a todos';

  // --- Construcción del Mensaje Decorado ---
  
  // Título del mensaje
  const titulo = `*─ᐅ「 𝗔𝗩𝗜𝗦𝗢 𝗚𝗘𝗡𝗘𝗥𝗔𝗟 」」*`;

  // Inicializa el texto con el título y el mensaje del admin en formato monospace
  let texto = `${titulo}\n\n`;
  texto += `*Mensaje:* \`${mensaje}\`\n\n`;

  // Encabezado de la lista de menciones
  texto += `╭─「 *Invocando al grupo* 」\n`;

  // Bucle para añadir a cada participante a la lista
  for (const member of participants) {
    texto += `│ ${emoji} @${member.id.split('@')[0]}\n`;
  }

  // Pie de página del mensaje
  texto += `╰─「 Creado por ${botname} 」`;

  // Envía el mensaje final, asegurando que las menciones funcionen
  conn.sendMessage(m.chat, { text: texto, mentions: participants.map((a) => a.id) });
};

// --- Metadatos del Comando ---
handler.help = ['tagall *<mensaje opcional>*'];
handler.tags = ['group'];
handler.command = ['todos', 'invocar', 'tagall']; // Puedes usar los mismos comandos
handler.admin = true;
handler.group = true;

export default handler;