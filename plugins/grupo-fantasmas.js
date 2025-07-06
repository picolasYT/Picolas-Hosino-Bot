import { areJidsSameUser } from '@whiskeysockets/baileys'

const emoji = '👻'
const emoji2 = '📜'
const emoji3 = '⚰️'
const advertencia = '⚠️'
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

let handler = async (m, { conn, text, participants, command }) => {
  const miembros = participants.map(u => u.id)
  const cantidad = text && !isNaN(text) ? parseInt(text) : miembros.length
  let fantasmas = []

  for (let i = 0; i < cantidad; i++) {
    let id = miembros[i]
    let user = global.db.data.users[id]
    let participante = participants.find(p => areJidsSameUser(p.id, id))

    let esAdmin = participante?.admin === 'admin' || participante?.admin === 'superadmin'

    if ((!user || user.chat === 0) && !esAdmin) {
      if (!user || (user && !user.whitelist)) {
        fantasmas.push(id)
      }
    }
  }

  if (command === 'fantasmas') {
    if (fantasmas.length === 0) {
      return conn.reply(m.chat, `${emoji} *¡Este grupo está lleno de vida!* No se han detectado fantasmas.`, m)
    }

    const texto = `╭━━━〔 𝔻𝔼𝕋𝔼ℂ𝕋𝔸𝔻𝕆ℝ 👻 〕━━⬣
┃  ${emoji2} *Lista de Fantasmas Inactivos:*\n${fantasmas.map(u => '┃  ✦ @' + u.split('@')[0]).join('\n')}
┃  
┃  ${advertencia} *Nota:*
┃  Esta lista puede no ser 100% exacta.
┃  Solo se cuentan usuarios desde que el bot se añadió.
╰━━━━━━━━━━━━━━━━━━━━⬣`

    return conn.reply(m.chat, texto, m, { mentions: fantasmas })
  }

  if (command === 'kickfantasmas') {
    if (fantasmas.length === 0) {
      return conn.reply(m.chat, `${emoji} *No hay fantasmas que eliminar*, el grupo está activo.`, m)
    }

    const advertenciaTexto = `╭──────〔 𝔼𝕃𝕀𝕄𝔸ℂ𝕀Óℕ ⚰️ 〕──────⬣
┃  Se han detectado *${fantasmas.length} fantasmas* 👻
┃  Iniciando purga en *10 segundos...*
┃  
┃  ${emoji2} *Lista:*\n${fantasmas.map(u => '┃  ⊳ @' + u.split('@')[0]).join('\n')}
╰━━━━━━━━━━━━━━━━━━━━⬣`

    await conn.reply(m.chat, advertenciaTexto, m, { mentions: fantasmas })
    await delay(10000)

    let chat = global.db.data.chats[m.chat]
    chat.welcome = false

    try {
      for (let id of fantasmas) {
        const participante = participants.find(p => areJidsSameUser(p.id, id))
        const esAdmin = participante?.admin === 'admin' || participante?.admin === 'superadmin'

        if (!esAdmin && id.endsWith('@s.whatsapp.net')) {
          await conn.groupParticipantsUpdate(m.chat, [id], 'remove')
          await delay(3000) // retraso menor para evitar cuelgues
        }
      }
    } catch (e) {
      console.error('❌ Error expulsando fantasmas:', e)
      await conn.reply(m.chat, '❌ Hubo un error al expulsar a algunos fantasmas.', m)
    } finally {
      chat.welcome = true
    }
  }
}

handler.tags = ['grupo']
handler.command = ['fantasmas', 'kickfantasmas']
handler.group = true
handler.botAdmin = true
handler.admin = true
handler.fail = null

export default handler
