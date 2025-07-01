import { promises as fs } from 'fs'

const charactersFilePath = './src/database/characters.json'
const haremFilePath = './src/database/harem.json'

// Si tus cooldowns son Map(), pásalos por import o global aquí
// (ajusta según tu sistema real)
let cooldowns = global.g_cooldowns || new Map()
let voteCooldowns = global.g_voteCooldowns || new Map()

const rollCooldownTime = 15 * 60 * 1000 // 15 min
const claimCooldownTime = 30 * 60 * 1000 // 30 min
const voteCooldownTime = 1 * 60 * 60 * 1000 // 1 hora

function msToTime(ms) {
    if (ms <= 0) return 'Ahora.'
    let h = Math.floor(ms / 1000 / 60 / 60)
    let m = Math.floor((ms / 1000 / 60) % 60)
    let s = Math.floor((ms / 1000) % 60)
    return [h ? `${h} hora${h > 1 ? 's' : ''}` : '', m ? `${m} minuto${m > 1 ? 's' : ''}` : '', s ? `${s} segundo${s > 1 ? 's' : ''}` : '']
        .filter(Boolean).join(' ')
}

let handler = async (m, { conn }) => {
    // Ajusta si usas username personalizado en tu sistema
    const username = m.pushName || (m.name ? m.name : m.sender)
    const userId = m.sender

    const now = Date.now()

    // Cooldown RollWaifu (gacha)
    let rollCd = cooldowns[userId] ? cooldowns[userId] - now : 0
    let rollMsg = msToTime(rollCd)

    // Cooldown Claim
    let harem = []
    try {
        harem = JSON.parse(await fs.readFile(haremFilePath, 'utf-8'))
    } catch { }
    let claimCd = 0
    const userClaim = harem.find(entry => entry.userId === userId)
    if (userClaim && userClaim.voteCooldown) {
        claimCd = userClaim.voteCooldown - now
    }
    let claimMsg = msToTime(claimCd)

    // Cooldown Vote
    let voteCd = voteCooldowns[userId] ? voteCooldowns[userId] - now : 0
    let voteMsg = msToTime(voteCd)

    // Personajes reclamados por el usuario
    let characters = []
    try {
        characters = JSON.parse(await fs.readFile(charactersFilePath, 'utf-8'))
    } catch { }
    const claimed = characters.filter(c => c.user === userId)
    const claimedCount = claimed.length
    const claimedValue = claimed.reduce((a, c) => a + (Number(c.value) || 0), 0)

    // Estadísticas generales
    const totalCharacters = characters.length
    const seriesSet = new Set(characters.map(c => c.source))
    const totalSeries = seriesSet.size

    const msg =
`*❀ Usuario \`<~${username}~>\`*

ⴵ RollWaifu » *${rollMsg}*
ⴵ Claim » *${claimMsg}*
ⴵ Vote » *${voteMsg}*

♡ Personajes reclamados » *${claimedCount}*
✰ Valor total » *${claimedValue}*
❏ Personajes totales » *${totalCharacters}*
❏ Series totales » *${totalSeries}*`

    await conn.reply(m.chat, msg, m)
}

handler.help = ['ginfo']
handler.tags = ['gacha', 'waifu', 'info']
handler.command = ['ginfo', 'ginfowaifu']

export default handler