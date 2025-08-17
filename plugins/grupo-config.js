let handler = async (m, { conn, args, command }) => {
  let isClose = {
    'open': 'not_announcement',
    'abrir': 'not_announcement',
    'close': 'announcement',
    'cerrar': 'announcement',
  }[command];

  if (!isClose) return; // Si no coincide con ningún comando, no hace nada

  await conn.groupSettingUpdate(m.chat, isClose);
};

handler.help = ['open', 'close', 'abrir', 'cerrar'];
handler.tags = ['grupo'];
handler.command = ['open', 'close', 'abrir', 'cerrar', 'group', 'grupo'];
handler.admin = true;
handler.botAdmin = true;

export default handler;
