import { promises as fs } from 'fs'
import fetch from 'node-fetch'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

const cooldowns = {}

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    throw new Error('❀ No se pudo cargar el archivo characters.json.')
  }
}

async function saveCharacters(characters) {
  try {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
  } catch (error) {
    throw new Error('❀ No se pudo guardar el archivo characters.json.')
  }
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    return JSON.parse(data)
  } catch (error) {
    return []
  }
}

async function saveHarem(harem) {
  try {
    await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
  } catch (error) {
    throw new Error('❀ No se pudo guardar el archivo harem.json.')
  }
}

let handler = async (m, { conn }) => {
  const userId = m.sender
  const now = Date.now()

  if (cooldowns[userId] && now < cooldowns[userId]) {
    const remainingTime = Math.ceil((cooldowns[userId] - now) / 1000)
    const minutes = Math.floor(remainingTime / 60)
    const seconds = remainingTime % 60
    return await conn.reply(m.chat, `《✧》Debes esperar *${minutes} minutos y ${seconds} segundos* para usar *#rw* de nuevo.`, m)
  }

  try {
    const characters = await loadCharacters()
    const randomCharacter = characters[Math.floor(Math.random() * characters.length)]
    const randomImage = randomCharacter.img[Math.floor(Math.random() * randomCharacter.img.length)]

    const harem = await loadHarem()
    const userEntry = harem.find(entry => entry.characterId === randomCharacter.id)
    const statusMessage = randomCharacter.user
      ? `Reclamado por @${randomCharacter.user.split('@')[0]}`
      : 'Libre'

    const message = `╔◡╍┅•.⊹︵ࣾ᷼ ׁ𖥓┅╲۪ ⦙᷼͝🧸᷼͝⦙ ׅ╱ׅ╍𖥓 ︵ࣾ᷼︵ׄׄ᷼⊹┅╍◡╗
┋  ⣿̶ֻ〪ׅ⃕݊⃧🐚⃚̶̸͝ᤢ֠◌ִ̲ 𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑹 𝑹𝑨𝑵𝑫𝑶𝑴 🐸ꨪ̸⃙ׅᮬֺ๋֢᳟  ┋
╚◠┅┅˙•⊹.⁀𖥓 ׅ╍╲۪ ⦙᷼͝🎠᷼͝⦙ ׅ╱ׅ╍𖥓 ◠˙⁀۪ׄ⊹˙╍┅◠╝

🌸 𝙉𝙊𝙈𝘽𝙍𝙀: *${randomCharacter.name}*
🚻 𝙂𝙀𝙉𝙀𝙍𝙊: *${randomCharacter.gender}*
💰 𝙑𝘼𝙇𝙊𝙍: *${randomCharacter.value}*
🪄 𝙀𝙎𝙏𝘼𝘿𝙊: ${statusMessage}
📚 𝙁𝙐𝙀𝙉𝙏𝙀: *${randomCharacter.source}*
🆔 𝙄𝘿: *${randomCharacter.id}*
`.trim()

    const mentions = userEntry ? [userEntry.userId] : []
    const thumbnail = await (await fetch(randomImage)).buffer()

    await conn.sendMessage(m.chat, {
      image: { url: randomImage },
      caption: message,
      contextInfo: {
        mentionedJid: mentions,
        isForwarded: true,
        forwardingScore: 999,
        forwardedNewsletterMessageInfo: {
          newsletterJid: '120363335626706839@newsletter',
          newsletterName: '⏤͟͞ू⃪፝͜⁞⟡『 Ruby-Hoshino Channel 』࿐⟡',
          serverMessageId: -1
        },
        externalAdReply: {
          title: '🌸 Ruby-Hoshino Gacha',
          body: '𝙏𝙪 𝙣𝙪𝙚𝙫𝙖 𝙬𝙖𝙞𝙛𝙪 𝙖𝙥𝙖𝙧𝙚𝙘𝙞ó 💖',
          thumbnail,
          mediaType: 1,
          renderLargerThumbnail: true,
          sourceUrl: 'https://tus-redes-o-tu-canal.com'
        }
      }
    }, { quoted: m })

    if (!randomCharacter.user) {
      await saveCharacters(characters)
    }

    cooldowns[userId] = now + 15 * 60 * 1000

  } catch (error) {
    await conn.reply(m.chat, `✘ Error al cargar el personaje: ${error.message}`, m)
  }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler
