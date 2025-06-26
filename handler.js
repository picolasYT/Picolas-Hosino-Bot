import { smsg } from './lib/simple.js'
import { format } from 'util'
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'

// Normaliza cualquier JID de usuario a @s.whatsapp.net
function normalizeUserJid(jid) {
  if (!jid) return ''
  if (jid.endsWith('@lid')) return jid.replace('@lid', '@s.whatsapp.net')
  if (jid.endsWith('@s.whatsapp.net')) return jid
  return jid
}

function isAdmin(jid, participants) {
  if (!jid || !participants) return false
  jid = normalizeUserJid(jid)
  return !!participants.find(u =>
    normalizeUserJid(u.id) === jid &&
    (u.admin === 'admin' || u.admin === 'superadmin')
  )
}

export async function handler(chatUpdate) {
  this.msgqueque = this.msgqueque || []
  this.uptime = this.uptime || Date.now()
  if (!chatUpdate) return
  this.pushMessage(chatUpdate.messages).catch(console.error)
  let m = chatUpdate.messages[chatUpdate.messages.length - 1]
  if (!m) return
  if (global.db.data == null) await global.loadDatabase()

  try {
    m = smsg(this, m) || m
    if (!m) return
    m.exp = 0
    m.coin = false

    // Normaliza participantes (sender, quoted y mencionados)
    if (m.isGroup) {
      m.metadata = m.metadata || (await this.groupMetadata(m.chat).catch(_ => null)) || {}
      m.metadata.participants = m.metadata.participants || []
    }
    m.participant = m.key?.participant || m.participant || m.sender
    m.participant = normalizeUserJid(m.participant)
    if (m.quoted && m.quoted.sender) m.quoted.sender = normalizeUserJid(m.quoted.sender)
    if (m.mentionedJid && m.mentionedJid.length)
      m.mentionedJid = m.mentionedJid.map(normalizeUserJid)

    let user = global.db.data.users[m.sender]
    if (typeof user !== 'object') global.db.data.users[m.sender] = {}
    // (Aquí pones tu inicialización de propiedades de usuario igual que antes)

    let chat = global.db.data.chats[m.chat]
    if (typeof chat !== 'object') global.db.data.chats[m.chat] = {}
    // (Aquí pones tu inicialización de propiedades de chat igual que antes)

    var settings = global.db.data.settings[this.user.jid]
    if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
    // (Aquí pones tu inicialización de settings igual que antes)
  } catch (e) {
    console.error(e)
  }

  let _user = global.db.data && global.db.data.users && global.db.data.users[m.sender]
  // Normaliza owner/mods/prems
  const isROwner = global.owner.some(([n]) => normalizeUserJid(n + '@s.whatsapp.net') === normalizeUserJid(m.sender))
  const isOwner = isROwner || m.fromMe
  const isMods = isROwner || global.mods.some(n => normalizeUserJid(n + '@s.whatsapp.net') === normalizeUserJid(m.sender))
  const isPrems = isROwner ||
    global.prems.some(n => normalizeUserJid(n + '@s.whatsapp.net') === normalizeUserJid(m.sender)) ||
    _user?.premium === true

  if (m.isBaileys) return
  if (opts['nyimak']) return
  if (!isROwner && opts['self']) return
  if (opts['swonly'] && m.chat !== 'status@broadcast') return
  if (typeof m.text !== 'string') m.text = ''

  if (opts['queque'] && m.text && !(isMods || isPrems)) {
    let queque = this.msgqueque, time = 1000 * 5
    const previousID = queque[queque.length - 1]
    queque.push(m.id || m.key.id)
    setInterval(async function () {
      if (queque.indexOf(previousID) === -1) clearInterval(this)
      await delay(time)
    }, time)
  }

  m.exp += Math.ceil(Math.random() * 10)
  let usedPrefix

  // --- ADMIN DETECTION UNIVERSAL ---
  const groupMetadata = m.isGroup ? (await this.groupMetadata(m.chat).catch(_ => null)) : {}
  const participants = m.isGroup ? groupMetadata?.participants || [] : []
  const userP = m.isGroup ? participants.find(u => normalizeUserJid(u.id) === normalizeUserJid(m.sender)) : {}
  const botJid = normalizeUserJid(this.user.lid || this.user.jid)
  const botP = m.isGroup ? participants.find(u => normalizeUserJid(u.id) === botJid) : {}
  const isRAdmin = userP?.admin === 'superadmin' || false
  const isAdmin = isRAdmin || userP?.admin === 'admin' || false
  const isBotAdmin = isAdmin(botJid, participants)

  const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')
  for (let name in global.plugins) {
    let plugin = global.plugins[name]
    if (!plugin) continue
    if (plugin.disabled) continue
    const __filename = join(___dirname, name)
    if (typeof plugin.all === 'function') {
      try { await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename }) }
      catch (e) { console.error(e) }
    }
    const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
    let _prefix = plugin.customPrefix ? plugin.customPrefix : this.prefix ? this.prefix : global.prefix
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
        match, conn: this, participants, groupMetadata, user: userP, bot: botP,
        isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems,
        chatUpdate, __dirname: ___dirname, __filename
      })) continue
    }
    if (typeof plugin !== 'function') continue
    if ((usedPrefix = (match[0] || '')[0])) {
      let noPrefix = m.text.replace(usedPrefix, '')
      let [command, ...args] = noPrefix.trim().split` `.filter(v => v)
      args = args || []
      let _args = noPrefix.trim().split` `.slice(1)
      let text = _args.join` `
      command = (command || '').toLowerCase()
      let fail = plugin.fail || global.dfail
      let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
        Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
          typeof plugin.command === 'string' ? plugin.command === command : false
      global.comando = command
      if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return
      if (!isAccept) continue
      m.plugin = name
      // ... [tu lógica adicional, bans, etc. aquí igual que antes] ...
      let adminMode = global.db.data.chats[m.chat]?.modoadmin
      let mini = `${plugin.botAdmin || plugin.admin || plugin.group || plugin || noPrefix || usedPrefix || m.text.slice(0, 1) == usedPrefix || plugin.command}`
      if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) return
      if (plugin.rowner && plugin.owner && !(isROwner || isOwner)) { fail('owner', m, this); continue }
      if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
      if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
      if (plugin.mods && !isMods) { fail('mods', m, this); continue }
      if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
      if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
      else if (plugin.botAdmin && !isBotAdmin) { fail('botAdmin', m, this); continue }
      else if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
      if (plugin.private && m.isGroup) { fail('private', m, this); continue }
      if (plugin.register == true && _user.registered == false) { fail('unreg', m, this); continue }
      m.isCommand = true
      let xp = 'exp' in plugin ? parseInt(plugin.exp) : 10
      m.exp += xp
      if (!isPrems && plugin.coin && global.db.data.users[m.sender].coin < plugin.coin * 1) {
        this.reply(m.chat, `❮✦❯ Se agotaron tus monedas.`, m)
        continue
      }
      if (plugin.level > _user.level) {
        this.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n• Tu nivel actual: *${_user.level}*`, m)
        continue
      }
      let extra = {
        match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata,
        user: userP, bot: botP, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename
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
          try { await plugin.after.call(this, m, extra) }
          catch (e) { console.error(e) }
        }
        if (m.coin)
          this.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} monedas.`, m)
      }
      break
    }
  }
}

global.dfail = (type, m, conn) => {
  let msg = {
    rowner: 'Solo mi creador puede usar esto.',
    owner: 'Solo el owner puede usar esto.',
    mods: 'Solo los mods pueden usar esto.',
    premium: 'Esto es solo para usuarios premium.',
    group: 'Este comando solo funciona en grupos.',
    private: 'Este comando solo funciona en privado.',
    admin: 'Solo los admins pueden usar esto.',
    botAdmin: 'Necesito ser admin para hacer eso.',
    unreg: 'Debes registrarte para usar esto.',
    restrict: 'Esta función está restringida.'
  }[type]
  if (msg) return conn.reply(m.chat, msg, m)
}

const file = global.__filename(import.meta.url, true)
watchFile(file, async () => {
  unwatchFile(file)
  console.log(chalk.green('Actualizando handler.js'))
})