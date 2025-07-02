import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

const normalizeJid = jid => jid?.replace(/[^0-9]/g, '')
const cleanJid = jid => jid?.split(':')[0] || ''

global._msgQueue = global._msgQueue || []
global._processingQueue = global._processingQueue || false
async function _processQueue(conn) {
  if (global._processingQueue) return
  global._processingQueue = true
  while (global._msgQueue.length) {
    const fn = global._msgQueue.shift()
    await fn()
    await delay(400)
  }
  global._processingQueue = false
}

export async function handler(chatUpdate) {
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  1]
  if (!m) return

  if (m.isGroup && global.conns && global.conns.length > 1) {
    let botsEnGrupo = global.conns.filter(c => c.user && c.user.jid && c.ws && c.ws.socket && c.ws.socket.readyState !== 3)
    let elegido = botsEnGrupo[Math.floor(Math.random() * botsEnGrupo.length)]
    if (this.user.jid !== elegido.user.jid) return
  }

  if (global.db.data == null) await global.loadDatabase()

  let user = global.db.data.users[m.sender]
  let isMod = global.owner.some(([n]) => n == m.sender) || (global.mods || []).includes(m.sender)
  let isPrem = user?.premium
  if (!isMod && !isPrem && m.text) {
    global._msgQueue.push(async () => await handleMessage.call(this, chatUpdate))
    _processQueue(this)
    return
  } else {
    await handleMessage.call(this, chatUpdate)
  }
}


async function handleMessage(chatUpdate) {
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return

  let db = global.db
  let users = db.data.users, chats = db.data.chats, settings = db.data.settings
  if (!users[m.sender]) users[m.sender] = {}
  if (!chats[m.chat]) chats[m.chat] = {}
  if (!settings[this.user.jid]) settings[this.user.jid] = {}

  let user = users[m.sender]
  let chat = chats[m.chat]
  let setting = settings[this.user.jid]

  Object.assign(user, {
    exp: user.exp ?? 0,
    coin: user.coin ?? 10,
    joincount: user.joincount ?? 1,
    diamond: user.diamond ?? 3,
    lastadventure: user.lastadventure ?? 0,
    health: user.health ?? 100,
    lastclaim: user.lastclaim ?? 0,
    lastcofre: user.lastcofre ?? 0,
    lastdiamantes: user.lastdiamantes ?? 0,
    lastpago: user.lastpago ?? 0,
    lastcode: user.lastcode ?? 0,
    lastcodereg: user.lastcodereg ?? 0,
    lastduel: user.lastduel ?? 0,
    lastmining: user.lastmining ?? 0,
    muto: user.muto ?? false,
    premium: user.premium ?? false,
    premiumTime: user.premiumTime ?? 0,
    registered: user.registered ?? false,
    genre: user.genre ?? '',
    birth: user.birth ?? '',
    marry: user.marry ?? '',
    description: user.description ?? '',
    packstickers: user.packstickers ?? null,
    name: user.name ?? m.name,
    age: user.age ?? -1,
    regTime: user.regTime ?? -1,
    afk: user.afk ?? -1,
    afkReason: user.afkReason ?? '',
    role: user.role ?? 'Nuv',
    banned: user.banned ?? false,
    useDocument: user.useDocument ?? false,
    bank: user.bank ?? 0,
    level: user.level ?? 0,
    warn: user.warn ?? 0,
    antispam: user.antispam ?? 0,
    antispam2: user.antispam2 ?? 0,
    spam: user.spam ?? 0
  })

  Object.assign(chat, {
    isBanned: chat.isBanned ?? false,
    sAutoresponder: chat.sAutoresponder ?? '',
    welcome: chat.welcome ?? true,
    autolevelup: chat.autolevelup ?? false,
    autoAceptar: chat.autoAceptar ?? false,
    autosticker: chat.autosticker ?? false,
    autoRechazar: chat.autoRechazar ?? false,
    autoresponder: chat.autoresponder ?? false,
    detect: chat.detect ?? true,
    antiBot: chat.antiBot ?? false,
    antiBot2: chat.antiBot2 ?? false,
    modoadmin: chat.modoadmin ?? false,
    antiLink: chat.antiLink ?? true,
    antiImg: chat.antiImg ?? false,
    reaction: chat.reaction ?? false,
    nsfw: chat.nsfw ?? false,
    antifake: chat.antifake ?? false,
    delete: chat.delete ?? false,
    expired: chat.expired ?? 0,
    antiLag: chat.antiLag ?? false,
    per: chat.per ?? []
  })

  Object.assign(setting, {
    self: setting.self ?? false,
    restrict: setting.restrict ?? true,
    jadibotmd: setting.jadibotmd ?? true,
    antiPrivate: setting.antiPrivate ?? false,
    autoread: setting.autoread ?? false,
    status: setting.status ?? 0
  })

  m = smsg(this, m) || m
  m.exp = 0
  m.coin = false

  const mainBot = global.conn.user.jid
  const allowedBots = chat.per || []
  if (!allowedBots.includes(mainBot)) allowedBots.push(mainBot)
  const isAllowed = allowedBots.includes(this.user.jid)
  if (chat.antiLag && !isAllowed) return

  if (opts['nyimak']) return
  if (!m.fromMe && opts['self']) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  let _user = users[m.sender]

  const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
  const participants = (m.isGroup ? groupMetadata.participants : []) || []

  const senderNum = normalizeJid(m.sender)
  const botNums = [this.user.jid, this.user.lid].map(j => normalizeJid(cleanJid(j)))
  const userP = m.isGroup ? participants.find(u => normalizeJid(u.id) === senderNum) : {}
  const bot = m.isGroup ? participants.find(u => botNums.includes(normalizeJid(u.id))) : {}
  const isRAdmin = userP?.admin === 'superadmin' || false
  const isAdmin = isRAdmin || userP?.admin === 'admin' || false
  const isBotAdmin = !!bot?.admin

  const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
   Owner = isROwner || m.fromMe
  const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum)
  const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || _user.premium == true


  if (m.isBaileys) return
  m.exp += Math.ceil(Math.random() * 10)

  let usedPrefix

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin) continue
    if (plugin.disabled) continue
    const __filename = join(___dirname, name)
    if (typeof plugin.all === 'function') {
      try {
        await plugin.all.call(this, m, {
          chatUpdate,
          __dirname: ___dirname,
          __filename
        })
      } catch (e) { console.error(e) }
    }
    if (!opts['restrict'])
      if (plugin.tags && plugin.tags.includes('admin')) continue
    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
    let match = (_prefix instanceof RegExp ?
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
    if (typeof plugin.before === 'function') {
      if (await plugin.before.call(this, m, {
        match,
        conn: this,
        participants,
        groupMetadata,
        user: userP,
        bot,
        isROwner,
        isOwner,
        isRAdmin,
        isAdmin,
        isBotAdmin,
        isPrems,
        chatUpdate,
        __dirname: ___dirname,
        __filename
      })) continue
    }
    if (typeof plugin !== 'function')
      continue
    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
      args = args || []
      let _args = noPrefix.trim().split` `.slice(1)
      let text = _args.join` `
      command = (command || '').toLowerCase()
      let fail = plugin.fail || global.dfail
      let isAccept = plugin.command instanceof RegExp ?
        plugin.command.test(command) :
        Array.isArray(plugin.command) ?
          plugin.command.some(cmd => cmd instanceof RegExp ?
            cmd.test(command) :
            cmd === command) :
          typeof plugin.command === 'string' ?
            plugin.command === command :
            false

      global.comando = command

      if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return

      if (!isAccept) {
        continue
      }
      m.plugin = name
      if (m.chat in chats || m.sender in users) {
        let chat = chats[m.chat]
        let user = users[m.sender]
        if (!['grupo-unbanchat.js'].includes(name) && chat && chat.isBanned && !isROwner) return
        if (name != 'grupo-unbanchat.js' && name != 'owner-exec.js' && name != 'owner-exec2.js' && name != 'grupo-delete.js' && chat?.isBanned && !isROwner) return
        if (user.antispam > 2) return
        if (m.text && user.banned && !isROwner) {
          m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
          user.antispam++
          return
        }
        if (user.antispam2 && isROwner) return
        let time = users[m.sender].spam + 3000
        if (new Date - users[m.sender].spam < 3000) return console.log(`[ SPAM ]`)
        users[m.sender].spam = new Date * 1

        if (m.chat in chats || m.sender in users) {
          let chat = chats[m.chat]
          let user = users[m.sender]
          let setting = settings[this.user.jid]
          if (name != 'grupo-unbanchat.js' && chat?.isBanned) return
          if (name != 'owner-unbanuser.js' && user?.banned) return
        }
      }
      let hl = _prefix
      let adminMode = chats[m.chat].modoadmin
      let mini = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || hl || m.text.slice(0, 1) == hl || plugin.command}`
      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return
      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) {
        fail('owner', m, this)
        continue
      }
      if (plugin.rowner && !isROwner) {
        fail('rowner', m, this)
        continue
      }
      if (plugin.owner && !isOwner) {
        fail('owner', m, this)
        continue
      }
      if (plugin.mods && !isMods) {
        fail('mods', m, this)
        continue
      }
      if (plugin.premium && !isPrems) {
        fail('premium', m, this)
        continue
      }
      if (plugin.admin && !isAdmin) {
        fail('admin', m, this)
        continue
      }
      if (plugin.private && m.isGroup) {
        fail('private', m, this)
        continue
      }
      if (plugin.group && !m.isGroup) {
        fail('group', m, this)
        continue
      }
      if (plugin.register == true && _user.registered == false) {
        fail('unreg', m, this)
        continue
      }
      m.isCommand = true
      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
      if (xp > 200)
        m.reply('chirrido -_-')
      else
        m.exp += xp
      if (!isPrems && plugin.coin && users[m.sender].coin < plugin.coin * 1) {
        conn.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
        continue
      }
      if (plugin.level > _user.level) {
        conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
        continue
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
        user: userP,
        bot,
        isROwner,
        isOwner,
        isRAdmin,
        isAdmin,
        isBotAdmin,
        isPrems,
        chatUpdate,
        __dirname: ___dirname,
        __filename
      }
      try {
        await plugin.call(this, m, extra)
        if (!isPrems)
          m.coin = m.coin || plugin.coin || false
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
        if (m.coin)
          conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
      }
      break
    }
  }

  // ======= FINAL DE MANEJO DE PLUGINS =======
  // Post-proceso, stats, reacciones, autoread y demás...
  try {
    if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
  } catch (e) { console.log(m, m.quoted, e) }
  let settingsREAD = settings[this.user.jid] || {}
  if (opts['autoread']) await this.readMessages([m.key])

  if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
    let emot = pickRandom([
      "🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"
    ])
    if (!m.fromMe) return this.sendMessage(m.chat, { react: { text: emot, key: m.key } })
  }
  function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }
}

// ====== Dfail y reload handler igual que tu código ======
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
  }[type]
  if (msg) return conn.reply(m.chat, msg, m, rcanal).then(_ => m.react('✖️'))
}
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