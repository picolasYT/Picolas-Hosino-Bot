import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const normalizeJid = jid => jid?.replace(/[^0-9]/g, '')
const cleanJid = jid => jid?.split(':')[0] || ''

// Plugin command index for fast lookup
function buildCommandIndex(plugins) {
  const commandMap = {}
  for (let name in plugins) {
    let plugin = plugins[name]
    if (!plugin || plugin.disabled) continue
    let cmds = Array.isArray(plugin.command) ? plugin.command : [plugin.command]
    for (let cmd of cmds) {
      if (typeof cmd === 'string') commandMap[cmd] = plugin
    }
  }
  return commandMap
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  // Mantener lógica de bot al azar
  if (m.isGroup && global.conns && global.conns.length > 1) {
    let botsEnGrupo = global.conns.filter(c => c.user && c.user.jid && c.ws && c.ws.socket && c.ws.socket.readyState !== 3)
    let elegido = botsEnGrupo[Math.floor(Math.random() * botsEnGrupo.length)]
    if (this.user.jid !== elegido.user.jid) return
  }

  // Cargar base de datos solo si es necesario
  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.coin = false

    // Inicialización de usuarios y chats solo si es necesario
    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') global.db.data.users[m.sender] = user = {}
    if (user.exp == null) user.exp = 0
    if (user.coin == null) user.coin = 10
    if (user.joincount == null) user.joincount = 1
    if (user.diamond == null) user.diamond = 3
    if (user.lastadventure == null) user.lastadventure = 0
    if (user.lastclaim == null) user.lastclaim = 0
    if (user.health == null) user.health = 100
    if (user.crime == null) user.crime = 0
    if (user.lastcofre == null) user.lastcofre = 0
    if (user.lastdiamantes == null) user.lastdiamantes = 0
    if (user.lastpago == null) user.lastpago = 0
    if (user.lastcode == null) user.lastcode = 0
    if (user.lastcodereg == null) user.lastcodereg = 0
    if (user.lastduel == null) user.lastduel = 0
    if (user.lastmining == null) user.lastmining = 0
    if (user.muto == null) user.muto = false
    if (user.premium == null) user.premium = false
    if (!user.premium) user.premiumTime = 0
    if (user.registered == null) user.registered = false
    if (user.genre == null) user.genre = ''
    if (user.birth == null) user.birth = ''
    if (user.marry == null) user.marry = ''
    if (user.description == null) user.description = ''
    if (user.packstickers == null) user.packstickers = null
    if (!user.registered) {
      if (user.name == null) user.name = m.name
      if (user.age == null) user.age = -1
      if (user.regTime == null) user.regTime = -1
    }
    if (user.afk == null) user.afk = -1
    if (user.afkReason == null) user.afkReason = ''
    if (user.role == null) user.role = 'Nuv'
    if (user.banned == null) user.banned = false
    if (user.useDocument == null) user.useDocument = false
    if (user.level == null) user.level = 0
    if (user.bank == null) user.bank = 0
    if (user.warn == null) user.warn = 0
    if (user.spam == null) user.spam = 0 // para anti-spam

    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = chat = {}
    if (chat.isBanned == null) chat.isBanned = false
    if (chat.sAutoresponder == null) chat.sAutoresponder = ''
    if (chat.welcome == null) chat.welcome = true
    if (chat.autolevelup == null) chat.autolevelup = false
    if (chat.autoAceptar == null) chat.autoAceptar = false
    if (chat.autosticker == null) chat.autosticker = false
    if (chat.autoRechazar == null) chat.autoRechazar = false
    if (chat.autoresponder == null) chat.autoresponder = false
    if (chat.detect == null) chat.detect = true
    if (chat.antiBot == null) chat.antiBot = false
    if (chat.antiBot2 == null) chat.antiBot2 = false
    if (chat.modoadmin == null) chat.modoadmin = false
    if (chat.antiLink == null) chat.antiLink = true
    if (chat.antiImg == null) chat.antiImg = false
    if (chat.reaction == null) chat.reaction = false
    if (chat.nsfw == null) chat.nsfw = false
    if (chat.antifake == null) chat.antifake = false
    if (chat.delete == null) chat.delete = false
    if (chat.expired == null) chat.expired = 0
    if (chat.antiLag == null) chat.antiLag = false
    if (chat.per == null) chat.per = []

    let settings = global.db.data.settings[this.user.jid]
    if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = settings = {}
    if (settings.self == null) settings.self = false
    if (settings.restrict == null) settings.restrict = true
    if (settings.jadibotmd == null) settings.jadibotmd = true
    if (settings.antiPrivate == null) settings.antiPrivate = false
    if (settings.autoread == null) settings.autoread = false
    if (settings.status == null) settings.status = 0

  } catch (e) {
    console.error(e)
  }

  // ---- Contextos y permisos ----
  const mainBot = global.conn.user.jid
  const chat = global.db.data.chats[m.chat] || {}
  const isSubbs = chat.antiLag === true
  const allowedBots = chat.per || []
  if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
  const isAllowed = allowedBots.includes(this.user.jid)
  if (isSubbs && !isAllowed) return

  if (opts['nyimak']) return
  if (!m.fromMe && opts['self']) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]

  // ---- Metadatos de grupo (caché si posible) ----
  const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
  const participants = (m.isGroup ? groupMetadata.participants : []) || []

  const senderNum = normalizeJid(m.sender)
  const botNums = [this.user.jid, this.user.lid].map(j => normalizeJid(cleanJid(j)))
  const user = m.isGroup
    ? participants.find(u => normalizeJid(u.id) === senderNum)
    : {}
  const bot = m.isGroup
    ? participants.find(u => botNums.includes(normalizeJid(u.id)))
    : {}
  const isRAdmin = user?.admin === 'superadmin' || false
  const isAdmin = isRAdmin || user?.admin === 'admin' || false
  const isBotAdmin = !!bot?.admin

  const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
    .map(v => v.replace(/[^0-9]/g, ''))
    .includes(senderNum)
  const isOwner = isROwner || m.fromMe
  const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum)
  const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || _user.premium == true

  // ---- Cola de mensajes (mejora: procesamiento secuencial por chat si es necesario) ----
  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    let queque = this.msgqueque, time = 1000 * 5
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setTimeout(() => {
      const idx = queque.indexOf(previousID)
      if (idx !== -1) queque.splice(idx, 1)
    }, time)
  }

  if (m.isBaileys) return

  m.exp += Math.ceil(Math.random() * 10)

  // ---- Índice de plugins por comando ----
  // Puede moverse fuera del handler si no recargas plugins dinámicamente
  const commandMap = buildCommandIndex(global.plugins)

  let usedPrefix
  let ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

  let match, command, noPrefix, args = [], _args = [], text = '', plugin = null
  // Detecta el prefijo y comando
  for (let name in global.plugins) {
    let plug = global.plugins[name]
    if (!plug || plug.disabled) continue
    let _prefix = plug.customPrefix ? plug.customPrefix : conn.prefix ? conn.prefix : global.prefix
    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let matches = (_prefix instanceof RegExp ?
      [[_prefix.exec(m.text), _prefix]] :
      Array.isArray(_prefix) ?
        _prefix.map(p => {
          let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
          return [re.exec(m.text), re]
        }) :
        typeof _prefix === 'string' ?
          [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] :
          [[[], new RegExp]]
    ).find(p => p[1])

    if (matches && matches[0]) {
      usedPrefix = (matches[0] || '')[0]
      noPrefix = m.text.replace(usedPrefix, '')
      [command, ...args] = noPrefix.trim().split(/\s+/)
      _args = noPrefix.trim().split(/\s+/).slice(1)
      text = _args.join(' ')
      command = (command || '').toLowerCase()
      plugin = plug
      match = matches
      break
    }
  }

  // Si no se detectó comando, termina aquí
  if (!plugin || !command) return

  // ---- Checks de permisos y contexto ----
  if (plugin.disabled) return
  if (plugin.tags && plugin.tags.includes('admin') && !isAdmin) return
  if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) return

  if (typeof plugin.before === 'function') {
    if (await plugin.before.call(this, m, {
      match, conn: this, participants, groupMetadata, user, bot,
      isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
      chatUpdate, __dirname: ___dirname, __filename: join(___dirname, plugin.name)
    })) return
  }

  if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return

  let fail = plugin.fail || global.dfail
  let isAccept = plugin.command instanceof RegExp ?
    plugin.command.test(command) :
    Array.isArray(plugin.command) ?
      plugin.command.some(cmd => cmd instanceof RegExp ?
        cmd.test(command) : cmd === command) :
      typeof plugin.command === 'string' ?
        plugin.command === command : false

  global.comando = command

  if (!isAccept) return

  if (m.chat in global.db.data.chats || m.sender in global.db.data.users) {
    let chat = global.db.data.chats[m.chat]
    let user = global.db.data.users[m.sender]
    if (!['grupo-unbanchat.js'].includes(plugin.name) && chat && chat.isBanned && !isROwner) return
    if (plugin.name != 'grupo-unbanchat.js' && plugin.name != 'owner-exec.js' && plugin.name != 'owner-exec2.js' && plugin.name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return
    if (user.antispam > 2) return
    if (m.text && user.banned && !isROwner) {
      m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
      user.antispam++
      return
    }
    if (user.antispam2 && isROwner) return
    let time = global.db.data.users[m.sender].spam + 3000
    if (new Date - global.db.data.users[m.sender].spam < 3000) return console.log(`[ SPAM ]`)
    global.db.data.users[m.sender].spam = new Date * 1
    if (plugin.name != 'grupo-unbanchat.js' && chat?.isBanned) return
    if (plugin.name != 'owner-unbanuser.js' && user?.banned) return
  }

  let adminMode = global.db.data.chats[m.chat].modoadmin
  let mini = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || usedPrefix || m.text.slice(0, 1) == usedPrefix || plugin.command}`
  if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return
  if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); return }
  if (plugin.rowner && !isROwner) { fail('rowner', m, this); return }
  if (plugin.owner && !isOwner) { fail('owner', m, this); return }
  if (plugin.mods && !isMods) { fail('mods', m, this); return }
  if (plugin.premium && !isPrems) { fail('premium', m, this); return }
  if (plugin.admin && !isAdmin) { fail('admin', m, this); return }
  if (plugin.private && m.isGroup) { fail('private', m, this); return }
  if (plugin.group && !m.isGroup) { fail('group', m, this); return }
  if (plugin.register == true && _user.registered == false) { fail('unreg', m, this); return }

  m.isCommand = true
  let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
  if (xp > 200) m.reply('chirrido -_-')
  else m.exp += xp
  if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
    conn.reply(m.chat, `❮✦❯ Se agotaron tus monedas`, m)
    return
  }
  if (plugin.level > _user.level) {
    conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
    return
  }

  let extra = {
    match,
    usedPrefix,
    noPrefix,
    _args,
    args,
    command,
    text,
    conn: this,
    participants,
    groupMetadata,
    user,
    bot,
    isROwner,
    isOwner,
    isRAdmin,
    isAdmin,
    isBotAdmin,
    isPrems,
    chatUpdate,
    __dirname: ___dirname,
    __filename: join(___dirname, plugin.name)
  }
  try {
    await plugin.call(this, m, extra)
    if (!isPrems) m.coin = m.coin || plugin.coin || false
  } catch (e) {
    m.error = e
    console.error(e)
    if (e) {
      let text = format(e)
      for (let key of Object.values(global.APIKeys))
        text = text.replace(new RegExp(key, 'g'), 'Administrador')
      m.reply(text)
    }
  } finally {
    if (typeof plugin.after === 'function') {
      try { await plugin.after.call(this, m, extra) } catch (e) { console.error(e) }
    }
    if (m.coin) conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} monedas`, m)
  }

  // ---- Finalización ----
  if (opts['queque'] && m.text) {
    const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
    if (quequeIndex !== -1)
      this.msgqueque.splice(quequeIndex, 1)
  }

  // Actualización de experiencia, monedas, y estadísticas
  if (m) {
    let utente = global.db.data.users[m.sender]
    if (utente.muto == true) {
      let bang = m.key.id
      let cancellazzione = m.key.participant
      await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione } })
    }
    if (m.sender && (user = global.db.data.users[m.sender])) {
      user.exp += m.exp
      user.coin -= m.coin * 1
    }
    let stats = global.db.data.stats
    if (m.plugin) {
      let now = +new Date
      let stat = stats[m.plugin] || (stats[m.plugin] = {
        total: 0, success: 0, last: 0, lastSuccess: 0
      })
      stat.total += 1
      stat.last = now
      if (m.error == null) {
        stat.success += 1
        stat.lastSuccess = now
      }
    }
  }

  // Print/log
  try {
    if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
  } catch (e) {
    console.log(m, m.quoted, e)
  }

  // Auto-read si está activado
  let settingsREAD = global.db.data.settings[this.user.jid] || {}
  if (opts['autoread']) await this.readMessages([m.key])

  // Reacción automática si está activado
  if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
    let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
    if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key } })
  }

  function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }
}

// Manejo de errores
global.dfail = (type, m, conn) => {
  const msg = {
    rowner: '「🌺」 *Gomenasai~! Esta función solo la puede usar mi creador celestial...* 🌌\n\n> *Dioneibi-sama.*',
    owner: '「🌸」 *¡Nyaa~! Solo mi creador y programadores pueden usar este comando~!* 💾💕',
    mods: '「🌟」 *Uguu~ Esto eso solo lo pueden usar mis desarrolladores mágicos~!* 🔮',
    premium: '「🍡」 *Ehh~? Esta función es exclusiva para usuarios Premium-desu~!* ✨\n\n💫 *¿No eres premium aún? Consíguelo ahora usando:*\n> ✨ *.comprarpremium 2 dias*  (o reemplaza "2 dias" por la cantidad que desees).',
    group: '「🐾」 *¡Onii-chan~! Este comando solo puede usarse en grupos grupales~!* 👥',
    private: '「🎀」 *Shh~ Este comando es solo para ti y para mí, en privado~* 💌',
    admin: '「🧸」 *¡Kyah~! Solo los admin-senpai pueden usar esta habilidad~!* 🛡️',
    botAdmin: '「🔧」 *¡Espera! Necesito ser admin para que este comando funcione correctamente.*\n\n🔧 *Hazme admin y desataré todo mi poder~*',
    unreg: `🍥 𝑶𝒉 𝒏𝒐~! *¡Aún no estás registrado~!* 😿\nNecesito conocerte para que uses mis comandos~ ✨\n\n📝 Por favor regístrate con:\n» */reg nombre.edad*\n\n🎶 Ejemplo encantado:\n» */reg Dioneibi-kun.15*\n\n💖 ¡Así podré reconocerte, nya~!*`,
    restrict: '「📵」 *¡Ouh~! Esta función está dormida por ahora~* 💤'
  }[type];
  if (msg) return conn.reply(m.chat, msg, m).then(_ => m.react('✖️'))
}

// Hot reload
let file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.green('Actualizando "handler.js"'))
  if (global.conns && global.conns.length > 0) {
    const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
    for (const userr of users) {
      userr.subreloadHandler(false)
    }
  }
})