import { smsg } from './lib/simple.js'
import { format } from 'util'
import * as ws from 'ws';
import { fileURLToPath } from 'url'
import path, { join } from 'path'
import { unwatchFile, watchFile } from 'fs'
import chalk from 'chalk'
import failureHandler from './lib/respuesta.js';
import fetch from 'node-fetch'

const { proto } = (await import('@whiskeysockets/baileys')).default
const isNumber = x => typeof x === 'number' && !isNaN(x)
const delay = ms => isNumber(ms) && new Promise(resolve => setTimeout(resolve, ms))

const normalizeJid = jid => jid?.replace(/[^0-9]/g, '')
const cleanJid = jid => jid?.split(':')[0] || ''

const defaultUser = {
    exp: 0,
    coin: 10,
    joincount: 1,
    diamond: 3,
    lastadventure: 0,
    health: 100,
    lastclaim: 0,
    lastcofre: 0,
    lastdiamantes: 0,
    lastcode: 0,
    lastduel: 0,
    lastpago: 0,
    lastmining: 0,
    lastcodereg: 0,
    muto: false,
    registered: false,
    genre: '',
    birth: '',
    marry: '',
    description: '',
    packstickers: null,
    name: '',
    age: -1,
    regTime: -1,
    afk: -1,
    afkReason: '',
    banned: false,
    bannedReason: '',
    useDocument: false,
    bank: 0,
    level: 0,
    role: 'Nuv',
    premium: false,
    premiumTime: 0,
    spam: 0,
    antispam: 0,
    antispam2: false
};

const defaultChat = {
    isBanned: false,
    sAutoresponder: '',
    welcome: true,
    autolevelup: false,
    autoAceptar: false,
    autosticker: false,
    autoRechazar: false,
    autoresponder: false,
    detect: true,
    antiBot: false,
    antiBot2: false,
    modoadmin: false,
    antiLink: true,
    antiImg: false,
    reaction: false,
    antiArabe: false,
    nsfw: false,
    antifake: false,
    delete: false,
    expired: 0,
    antiLag: false,
    per: [],
};

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

        // --- OPTIMIZACIÓN 2: Lógica de inicialización de datos más eficiente ---
        try {
            let user = global.db.data.users[m.sender]
            if (typeof user !== 'object') {
                global.db.data.users[m.sender] = { ...defaultUser, name: m.name }
            } else {
                global.db.data.users[m.sender] = { ...defaultUser, ...user, name: m.name }
            }

            let chat = global.db.data.chats[m.chat]
            if (typeof chat !== 'object') {
                global.db.data.chats[m.chat] = { ...defaultChat }
            } else {
                global.db.data.chats[m.chat] = { ...defaultChat, ...chat }
            }

            var settings = global.db.data.settings[this.user.jid]
            if (typeof settings !== 'object') global.db.data.settings[this.user.jid] = {}
            if (settings) {
                if (!('self' in settings)) settings.self = false
                if (!('restrict' in settings)) settings.restrict = true
                if (!('jadibotmd' in settings)) settings.jadibotmd = true
                if (!('antiPrivate' in settings)) settings.antiPrivate = false
                if (!('autoread' in settings)) settings.autoread = false
            } else {
                global.db.data.settings[this.user.jid] = {
                    self: false,
                    restrict: true,
                    jadibotmd: true,
                    antiPrivate: false,
                    autoread: false,
                    status: 0
                }
            }
        } catch (e) {
            console.error(e)
        }

        // --- Lógica de sub-bots y antiLag ---
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

        const _user = global.db.data.users[m.sender]
        const groupMetadata = (m.isGroup ? ((conn.chats[m.chat] || {}).metadata || await this.groupMetadata(m.chat).catch(_ => null)) : {}) || {}
        const participants = (m.isGroup ? groupMetadata.participants : []) || []

        const senderNum = normalizeJid(m.sender)
        const botNums = [this.user.jid, this.user.lid].map(j => normalizeJid(cleanJid(j)))
        const user = m.isGroup ? participants.find(u => normalizeJid(u.id) === senderNum) : {}
        const bot = m.isGroup ? participants.find(u => botNums.includes(normalizeJid(u.id))) : {}
        const isRAdmin = user?.admin === 'superadmin' || false
        const isAdmin = isRAdmin || user?.admin === 'admin' || false
        const isBotAdmin = !!bot?.admin

        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)]
            .map(v => v.replace(/[^0-9]/g, ''))
            .includes(senderNum)
        const isOwner = isROwner || m.fromMe
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-g]/g, '')).includes(senderNum)
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || _user.premium

        // --- OPTIMIZACIÓN 3: Mover comprobaciones de baneo y spam fuera del bucle de plugins ---
        if (m.text) {
            if (_user.banned && !isROwner) {
                if (_user.antispam > 2) return;
                m.reply(`《✦》Estas baneado/a, no puedes usar comandos en este bot!\n\n${_user.bannedReason ? `✰ *Motivo:* ${_user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`)
                _user.antispam++
                return
            }
            if (new Date - _user.spam < 3000) {
                 console.log(`[ SPAM ]`)
                 return
            }
            _user.spam = new Date * 1
        }
        
        if (opts['queque'] && m.text && !(isMods || isPrems)) {
            let queque = this.msgqueque, time = 1000 * 5
            const previousID = queque[queque.length - 1]
            queque.push(m.id || m.key.id)
            setInterval(async function () {
                if (queque.indexOf(previousID) === -1) clearInterval(this)
                await delay(time)
            }, time)
        }

        if (m.isBaileys) return
        m.exp += Math.ceil(Math.random() * 10)

        let usedPrefix
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins')

        for (let name in global.plugins) {
            let plugin = global.plugins[name]
            if (!plugin || plugin.disabled) continue
            
            const __filename = join(___dirname, name)
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(this, m, { chatUpdate, __dirname: ___dirname, __filename })
                } catch (e) {
                    console.error(e)
                }
            }

            if (!opts['restrict'] && plugin.tags && plugin.tags.includes('admin')) continue
            
            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&')
            let _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix
            let match = (_prefix instanceof RegExp ? [[_prefix.exec(m.text), _prefix]] : Array.isArray(_prefix) ? _prefix.map(p => {
                let re = p instanceof RegExp ? p : new RegExp(str2Regex(p))
                return [re.exec(m.text), re]
            }) : typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(m.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]).find(p => p[1])

            if (typeof plugin.before === 'function') {
                if (await plugin.before.call(this, m, { match, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename })) continue
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
                let isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) : Array.isArray(plugin.command) ? plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) : typeof plugin.command === 'string' ? plugin.command === command : false

                global.comando = command
                if ((m.id.startsWith('NJX-') || (m.id.startsWith('BAE5') && m.id.length === 16) || (m.id.startsWith('B24E') && m.id.length === 20))) return
                if (!isAccept) continue

                m.plugin = name
                if (chat?.isBanned && !isROwner && !['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js', 'grupo-delete.js'].includes(name)) return

                let hl = _prefix
                let adminMode = global.db.data.chats[m.chat].modoadmin
                let mini = `${plugins.botAdmin || plugins.admin || plugins.group || plugins || noPrefix || hl || m.text.slice(0, 1) == hl || plugins.command}`
                if (adminMode && !isOwner && !isROwner && m.isGroup && !isAdmin && mini) continue
                
                if (plugin.rowner && !isROwner) { fail('rowner', m, this); continue }
                if (plugin.owner && !isOwner) { fail('owner', m, this); continue }
                if (plugin.mods && !isMods) { fail('mods', m, this); continue }
                if (plugin.premium && !isPrems) { fail('premium', m, this); continue }
                if (plugin.group && !m.isGroup) { fail('group', m, this); continue }
                if (plugin.admin && !isAdmin) { fail('admin', m, this); continue }
                if (plugin.private && m.isGroup) { fail('private', m, this); continue }
                if (plugin.register && !_user.registered) { fail('unreg', m, this); continue }
                
                m.isCommand = true
                let xp = 'exp' in plugin ? parseInt(plugin.exp) : 17
                if (xp > 200) m.reply('chirrido -_-')
                else m.exp += xp
                if (!isPrems && plugin.coin && _user.coin < plugin.coin * 1) {
                    conn.reply(m.chat, `❮✦❯ Se agotaron tus ${moneda}`, m)
                    continue
                }
                if (plugin.level > _user.level) {
                    conn.reply(m.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${_user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, m)
                    continue
                }

                let extra = { match, usedPrefix, noPrefix, _args, args, command, text, conn: this, participants, groupMetadata, user, bot, isROwner, isOwner, isRAdmin, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname: ___dirname, __filename }
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
                        try {
                            await plugin.after.call(this, m, extra)
                        } catch (e) {
                            console.error(e)
                        }
                    }
                    if (m.coin) conn.reply(m.chat, `❮✦❯ Utilizaste ${+m.coin} ${moneda}`, m)
                }
                break
            }
        }
    } catch (e) {
        console.error(e)
    } finally {
        if (opts['queque'] && m.text) {
            const quequeIndex = this.msgqueque.indexOf(m.id || m.key.id)
            if (quequeIndex !== -1) this.msgqueque.splice(quequeIndex, 1)
        }

        let user, stats = global.db.data.stats
        if (m) {
            let utente = global.db.data.users[m.sender]
            if (utente.muto) {
                let bang = m.key.id
                let cancellazzione = m.key.participant
                await conn.sendMessage(m.chat, { delete: { remoteJid: m.chat, fromMe: false, id: bang, participant: cancellazzione } })
            }
            if (m.sender && (user = global.db.data.users[m.sender])) {
                user.exp += m.exp
                user.coin -= m.coin * 1
            }

            let stat
            if (m.plugin) {
                let now = +new Date
                if (m.plugin in stats) {
                    stat = stats[m.plugin]
                    if (!isNumber(stat.total)) stat.total = 1
                    if (!isNumber(stat.success)) stat.success = m.error != null ? 0 : 1
                    if (!isNumber(stat.last)) stat.last = now
                    if (!isNumber(stat.lastSuccess)) stat.lastSuccess = m.error != null ? 0 : now
                } else {
                    stat = stats[m.plugin] = { total: 1, success: m.error != null ? 0 : 1, last: now, lastSuccess: m.error != null ? 0 : now }
                }
                stat.total += 1
                stat.last = now
                if (m.error == null) {
                    stat.success += 1
                    stat.lastSuccess = now
                }
            }
        }

        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(m, this)
        } catch (e) {
            console.log(m, m.quoted, e)
        }
        
        if (opts['autoread']) await this.readMessages([m.key])
        
        if (db.data.chats[m.chat].reaction && m.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
            let emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"])
            if (!m.fromMe) this.sendMessage(m.chat, { react: { text: emot, key: m.key }})
        }
    }
}

function pickRandom(list) { return list[Math.floor(Math.random() * list.length)] }

global.dfail = (type, m, conn) => {
    failureHandler(type, conn, m);
};

const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.green('Actualizando "handler.js"'));
    if (global.conns && global.conns.length > 0) {
        const users = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])];
        for (const userr of users) {
            userr.subreloadHandler(false)
        }
    }
});