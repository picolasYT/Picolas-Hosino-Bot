let handler = async (m, { conn }) => {
  if (!m.isGroup) return m.reply('✳️ Este comando solo puede usarse en grupos.')
  const metadata = await conn.groupMetadata(m.chat)
  // Busca si hay algún participante cuyo JID termina en "@lid"
  const hayLid = metadata.participants.some(p => p.id.endsWith('@lid'))
  if (hayLid) {
    m.reply('✅ Este grupo tiene al menos un usuario con @lid.')
  } else {
    m.reply('✳️ No hay ningún usuario con @lid en este grupo.')
  }
}
handler.help = ['haylid']
handler.tags = ['group']
handler.command = ['haylid', 'tienelid', 'lid']
handler.group = true

export default handler