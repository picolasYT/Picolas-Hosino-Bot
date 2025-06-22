import { promises as fs } from 'fs'

// Rutas
const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// Cooldown por usuario
const cooldowns = {}

async function loadCharacters() {
  try {
    const data = await fs.readFile(charactersFilePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    throw new Error('⚠️ 𝙴𝚛𝚛𝚘𝚛: 𝚗𝚘 𝚙𝚞𝚍𝚎 𝚌𝚊𝚛𝚐𝚊𝚛 𝚕𝚘𝚜 𝚌𝚑𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚜.')
  }
}

async function saveCharacters(characters) {
  try {
    await fs.writeFile(charactersFilePath, JSON.stringify(characters, null, 2), 'utf-8')
  } catch {
    throw new Error('⚠️ 𝙴𝚛𝚛𝚘𝚛: 𝚗𝚘 𝚙𝚞𝚍𝚎 𝚐𝚞𝚊𝚛𝚍𝚊𝚛 𝚌𝚑𝚊𝚛𝚊𝚌𝚝𝚎𝚛𝚜.')
  }
}

async function loadHarem() {
  try {
    const data = await fs.readFile(haremFilePath, 'utf-8')
    return JSON.parse(data)
  } catch {
    return []
  }
}

async function saveHarem(harem) {
  try {
    await fs.writeFile(haremFilePath, JSON.stringify(harem, null, 2), 'utf-8')
  } catch {
    throw new Error('⚠️ 𝙴𝚛𝚛𝚘𝚛: 𝚗𝚘 𝚙𝚞𝚍𝚎 𝚐𝚞𝚊𝚛𝚍𝚊𝚛 𝚑𝚊𝚛𝚎𝚖.')
  }
}

let handler = async (m, { conn }) => {
  const userId = m.sender
  const now = Date.now()

  // ⏳ Cooldown
  if (cooldowns[userId] && now < cooldowns[userId]) {
    const remaining = Math.ceil((cooldowns[userId] - now) / 1000)
    const mins = Math.floor(remaining / 60)
    const secs = remaining % 60

    return conn.reply(m.chat, 
      `❌ 𝚄𝚜𝚘 𝚛𝚎𝚜𝚝𝚛𝚒𝚗𝚐𝚒𝚍𝚘\n⏱️ 𝙴𝚜𝚙𝚎𝚛𝚊 *${mins}m ${secs}s* 𝚊𝚗𝚝𝚎𝚜 𝚍𝚎 𝚞𝚜𝚊𝚛 𝚗𝚞𝚎𝚟𝚊𝚖𝚎𝚗𝚝𝚎.`,
      m
    )
  }

  try {
    const characters = await loadCharacters()
    const character = characters[Math.floor(Math.random() * characters.length)]
    const image = character.img[Math.floor(Math.random() * character.img.length)]

    const harem = await loadHarem()
    const userEntry = harem.find(e => e.characterId === character.id)

    const status = character.user
      ? `🔐 𝚁𝚎𝚌𝚕𝚊𝚖𝚊𝚍𝚘 𝚙𝚘𝚛 @${character.user.split('@')[0]}`
      : '✨ 𝙻𝚒𝚋𝚛𝚎 𝚢 𝚍𝚒𝚜𝚙𝚘𝚗𝚒𝚋𝚕𝚎'

    const message = `
╔◡╍┅•.⊹︵ࣾ᷼ ׁ𖥓┅╲۪ ⦙᷼͝🧸᷼͝⦙ ׅ╱ׅ╍𖥓 ︵ࣾ᷼︵ׄׄ᷼⊹┅╍◡╗
┋  ⣿̶ֻ〪ׅ⃕݊⃧🐚⃚̶̸͝ᤢ֠◌ִ̲ 𝑪𝑯𝑨𝑹𝑨𝑪𝑻𝑬𝑹 𝑹𝑨𝑵𝑫𝑶𝑴 🐸ꨪ̸⃙ׅᮬֺ๋֢᳟  ┋
╚◠┅┅˙•⊹.⁀𖥓 ׅ╍╲۪ ⦙᷼͝🎠᷼͝⦙ ׅ╱ׅ╍𖥓 ◠˙⁀۪ׄ⊹˙╍┅◠╝

꥓໋╭࣭۬═ֽ̥࣪━᜔๋݈═𑂺ׄ︵ິּ֙᷼⌒݈᳹᪾̯⌢ּ໋᩿࣭ׄ⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔꥓໋┉꥓ׂ᷼━᜔࣭֙ ⋮꥓ּ࣭ׄ🌹〪ິ᜔ּ໋࣭ׄ⋮ ꥓࣭֙━᜔ׂ᷼┉𑂺᜔꥓໋━࣭̺ׄ═࣭ׄᮣໍׅ⌒ּ໋᩿࣭ׄ⌢݈᳹᪾̯⌒ּׄ᷼︵𑂺ິ᜔֙═ֽ࣪━๋݈═̥࣭۬╮𞄳
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🌵᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙉𝘖𝘔𝘉𝘙𝘌: *${character.name}*
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🍭᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:  𝙂𝘌𝘕𝘌𝘙𝘖: *${character.gender}*
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ💰᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙑𝘈𝘓𝘖𝘙: *${character.value}*
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🪄᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙀𝘚𝘛𝘈𝘋𝘖: ${status}
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ📚᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙁𝘜𝘌𝘕𝘛𝘌: *${character.source}*
> ᠙᳞✿̶᮫᮫ְְׅ᳝ׅ᳝᳞᳞࣪᪲࣪֘⣷ׅ᳝࣪ ࣪࣪𖡻ְְׅ᳝ׅׅ࣪࣪֘ᰰ🆔᮫ְׅ᳝࣪᪲⃞̶𝝸𝕝᮫ְ᳝᳝⃨۪۪۪ׅ᳝࣪࣪っְְׅ᳝۪⃨۪۪۪࣪:   𝙄𝘿: *${character.id}*
꥓໋╰ׅ۬═ֽ̥࣪━᜔๋݈═𑂺ׄ︵ິּ֙᷼⌒݈᳹᪾̯⌢ּ໋᩿࣭ׄ⌒ໍּ֣ׄ═ᮣໍ࣭ׄ━𑂺᜔꥓໋┉꥓ׂ᷼━᜔࣭֙ ⋮꥓ּ࣭ׄ👒〪ິ᜔ּ໋࣭ׄ⋮ ꥓࣭֙━᜔ׂ᷼┉𑂺᜔꥓໋━࣭̺ׄ═࣭ׄᮣໍׅ⌒ּ໋᩿࣭ׄ⌢݈᳹᪾̯⌒ּׄ᷼︵𑂺ິ᜔֙═ֽ࣪━๋݈═̥࣭۬╯𞄳
`.trim()

    const mentions = userEntry ? [userEntry.userId] : []

    // 📨 Simula reenvío desde canal
    const contextInfo = {
      mentionedJid: mentions,
      isForwarded: true,
      forwardingScore: 999,
      forwardedNewsletterMessageInfo: {
        newsletterJid: '120363335626706839@newsletter',
        newsletterName: '『 𝙲𝙷𝙰𝚁𝙰𝙲𝚃𝙴𝚁 𝙱𝙰𝙽𝙺 📚』',
        serverMessageId: -1
      }
    }

    await conn.sendFile(
      m.chat,
      image,
      `${character.name}.jpg`,
      message,
      m,
      {
        mentions,
        contextInfo
      }
    )

    if (!character.user) {
      await saveCharacters(characters)
    }

    cooldowns[userId] = now + 15 * 60 * 1000

  } catch (err) {
    await conn.reply(m.chat, `⚠️ 𝙴𝚛𝚛𝚘𝚛 𝚍𝚎 𝚜𝚒𝚜𝚝𝚎𝚖𝚊:\n${err.message}`, m)
  }
}

handler.help = ['ver', 'rw', 'rollwaifu']
handler.tags = ['gacha']
handler.command = ['ver', 'rw', 'rollwaifu']
handler.group = true

export default handler
