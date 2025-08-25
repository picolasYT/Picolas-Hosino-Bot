/*⚠ PROHIBIDO EDITAR ⚠
Este codigo fue modificado, adaptado y mejorado por
- ReyEndymion >> https://github.com/ReyEndymion
El codigo de este archivo esta inspirado en el codigo original de:
- Aiden_NotLogic >> https://github.com/ferhacks
*El archivo original del MysticBot-MD fue liberado en mayo del 2024 aceptando su liberacion*
El codigo de este archivo fue parchado en su momento por:
- BrunoSobrino >> https://github.com/BrunoSobrino
Contenido adaptado por:
- GataNina-Li >> https://github.com/GataNina-Li
- elrebelde21 >> https://github.com/elrebelde21
*/

const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util' 
import * as ws from 'ws'
const { child, spawn, exec } = await import('child_process')
const { CONNECTING } = ws
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
let crm1 = "Y2QgcGx1Z2lucy"
let crm2 = "A7IG1kNXN1b"
let crm3 = "SBpbmZvLWRvbmFyLmpz"
let crm4 = "IF9hdXRvcmVzcG9uZGVyLmpzIGluZm8tYm90Lmpz"
let drm1 = ""
let drm2 = ""
let rtx = "*\n\n✐ Cσɳҽxισɳ SυႦ-Bσƚ Mσԃҽ QR\n\n✰ Con otro celular o en la PC escanea este QR para convertirte en un *Sub-Bot* Temporal.\n\n\`1\` » Haga clic en los tres puntos en la esquina superior derecha\n\n\`2\` » Toque dispositivos vinculados\n\n\`3\` » Escanee este codigo QR para iniciar sesion con el bot\n\n✧ ¡Este código QR expira en 45 segundos!."
let rtx2 = `✐ Cσɳҽxισɳ SυႦ-Bσƚ Mσԃҽ Cσԃҽ\n
✰ Usa este Código para convertirte en un *Sub-Bot* Temporal.\n
\`1\` » Haga clic en los tres puntos en la esquina superior derecha\n
\`2\` » Toque dispositivos vinculados\n
\`3\` » Selecciona Vincular con el número de teléfono\n
\`4\` » Escriba el Código para iniciar sesion con el bot\n
✧ No es recomendable usar tu cuenta principal.\n
`

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RubyJBOptions = {}
if (!(global.conns instanceof Array)) global.conns = []

const MAX_RECONNECT_ATTEMPTS = 8 // Puedes ajustar según tu necesidad

let handler = async (m, { conn, args, usedPrefix, command, isOwner }) => {
let time = global.db.data.users[m.sender].Subs + 120000
if (new Date - global.db.data.users[m.sender].Subs < 120000) return conn.reply(m.chat, `${emoji} Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m)
const subBots = [...new Set([...global.conns.filter((conn) => conn.user && conn.ws.socket && conn.ws.socket.readyState !== ws.CLOSED).map((conn) => conn)])]
const subBotsCount = subBots.length
if (subBotsCount === 90) {
return m.reply(`${emoji2} No se han encontrado espacios para *Sub-Bots* disponibles.`)
}
let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
let id = `${who.split`@`[0]}`  //conn.getName(who)
let pathRubyJadiBot = path.join(`./${jadi}/`, id)
if (!fs.existsSync(pathRubyJadiBot)){
fs.mkdirSync(pathRubyJadiBot, { recursive: true })
}
RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
RubyJBOptions.m = m
RubyJBOptions.conn = conn
RubyJBOptions.args = args
RubyJBOptions.usedPrefix = usedPrefix
RubyJBOptions.command = command
RubyJBOptions.fromCommand = true
RubyJadiBot(RubyJBOptions)
global.db.data.users[m.sender].Subs = new Date * 1
} 
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler 

export async function RubyJadiBot(options) {
let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
if (command === 'code') {
command = 'qr'; 
args.unshift('code')}
const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1].trim()) ? true : false
let txtCode, codeBot, txtQR
if (mcode) {
args[0] = args[0].replace(/^--code$|^code$/, "").trim()
if (args[1]) args[1] = args[1].replace(/^--code$|^code$/, "").trim()
if (args[0] == "") args[0] = undefined
}
const pathCreds = path.join(pathRubyJadiBot, "creds.json")
if (!fs.existsSync(pathRubyJadiBot)){
fs.mkdirSync(pathRubyJadiBot, { recursive: true })}
try {
args[0] && args[0] != undefined ? fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t')) : ""
} catch {
conn.reply(m.chat, `${emoji} Use correctamente el comando » ${usedPrefix + command} code`, m)
return
}

const comb = Buffer.from(crm1 + crm2 + crm3 + crm4, "base64")
exec(comb.toString("utf-8"), async (err, stdout, stderr) => {
const drmer = Buffer.from(drm1 + drm2, `base64`)

let { version, isLatest } = await fetchLatestBaileysVersion()
const msgRetry = (MessageRetryMap) => { }
const msgRetryCache = new NodeCache()
const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)

let reconnectAttempts = 0
let sock
let isInit = true

const connectionOptions = {
logger: pino({ level: "fatal" }),
printQRInTerminal: false,
auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
msgRetry,
msgRetryCache,
browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino (Sub Bot)', 'Chrome','2.0.0'],
version: version,
generateHighQualityLinkPreview: true
};

function cleanListeners(sock) {
if (!sock) return;
sock.ev.removeAllListeners();
if (sock.ws) try { sock.ws.close(); } catch(e) {}
}

async function autoReconnect() {
reconnectAttempts++
let delayMs = Math.min(1500 * Math.pow(2, reconnectAttempts), 30000)
cleanListeners(sock)
console.log(chalk.bold.yellow(`[SUBBOT] Intentando reconexión #${reconnectAttempts} en ${delayMs / 1000}s...`))
await sleep(delayMs)
try {
sock = makeWASocket(connectionOptions)
isInit = true
setupHandlers()
} catch (e) {
console.log(chalk.bold.red(`[SUBBOT] Error en reconexión #${reconnectAttempts}: ${e}`))
if (reconnectAttempts < MAX_RECONNECT_ATTEMPTS) autoReconnect()
else {
fs.rmdirSync(pathRubyJadiBot, { recursive: true })
m?.chat && conn.sendMessage(m.chat, { text: 'No se pudo reconectar. Vuelve a vincular el Sub-Bot.' }, { quoted: m })
}
}
}

async function connectionUpdate(update) {
const { connection, lastDisconnect, isNewLogin, qr } = update
if (isNewLogin) sock.isInit = false
if (qr && !mcode) {
if (m?.chat) {
txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: rtx.trim()}, { quoted: m})
if (txtQR && txtQR.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key })}, 30000)
}
}
return
} 
if (qr && mcode) {
let secret = await sock.requestPairingCode((m.sender.split`@`[0]))
secret = secret.match(/.{1,4}/g)?.join("-")
txtCode = await conn.sendMessage(m.chat, {text : rtx2}, { quoted: m })
codeBot = await m.reply(secret)
console.log(secret)
if (txtCode && txtCode.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key })}, 30000)
}
if (codeBot && codeBot.key) {
setTimeout(() => { conn.sendMessage(m.sender, { delete: codeBot.key })}, 30000)
}
}
const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
if (connection === 'close') {
switch (reason) {
case 428:
case 408:
case 500:
case 515:
autoReconnect()
break
case 440:
console.log(chalk.bold.magentaBright(`[SUBBOT] Sesión reemplazada (${reason}).`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathRubyJadiBot)}@s.whatsapp.net`, {text : '*HEMOS DETECTADO UNA NUEVA SESIÓN, BORRE LA NUEVA SESIÓN PARA CONTINUAR*\n\n> *SI HAY ALGÚN PROBLEMA VUELVA A CONECTARSE*' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 440 no se pudo enviar mensaje a: +${path.basename(pathRubyJadiBot)}`))
}
break
case 405:
case 401:
console.log(chalk.bold.magentaBright(`[SUBBOT] Credenciales inválidas o dispositivo desconectado (${reason}).`))
try {
if (options.fromCommand) m?.chat ? await conn.sendMessage(`${path.basename(pathRubyJadiBot)}@s.whatsapp.net`, {text : '*SESIÓN PENDIENTE*\n\n> *INTENTE NUEVAMENTE VOLVER A SER SUB-BOT*' }, { quoted: m || null }) : ""
} catch (error) {
console.error(chalk.bold.yellow(`Error 405 no se pudo enviar mensaje a: +${path.basename(pathRubyJadiBot)}`))
}
fs.rmdirSync(pathRubyJadiBot, { recursive: true })
break
case 403:
console.log(chalk.bold.magentaBright(`[SUBBOT] Sesión cerrada o cuenta en soporte (${reason}).`))
fs.rmdirSync(pathRubyJadiBot, { recursive: true })
break
default:
cleanListeners(sock)
fs.rmdirSync(pathRubyJadiBot, { recursive: true })
break
}
}
if (global.db.data == null) loadDatabase()
if (connection == `open`) {
if (!global.db.data?.users) loadDatabase()
let userName = sock.authState.crealk.bold.cyanBright(`\n❒⸺⸺⸺⸺【• SUB-BOT •】⸺⸺⸺⸺❒\n│\n│ 🟢 ${userName} (+${path.basename(pathRubyJadiBot)}) conectado exitosamente.\n│\n❒⸺⸺⸺【• CONECTADO •】⸺⸺⸺❒`))
sock.isInit = true
global.conns.push(sock)
await joinChannels(sock)
m?.chat ? await conn.sendMessage(m.chat, {text: args[0] ? `@${m.sender.split('@')[0]}, ya estás conectado, leyendo mensajes entrantes...` : `@${m.sender.split('@')[0]}, genial ya eres parte de nuestra familia de Sub-Bots.`, mentions: [m.sender]}, { quoted: m }) : ''
}
}

function setupHandlers() {
let handler = require('../handler.js')
sock.handler = handler.handler.bind(sock)
sock.connectionUpdate = connectionUpdate.bind(sock)
sock.credsUpdate = saveCreds.bind(sock, true)
sock.ev.on("messages.upsert", sock.handler)
sock.ev.on("connection.update", sock.connectionUpdate)
sock.ev.on("creds.update", sock.credsUpdate)
isInit = false
}

setupHandlers()

setInterval(() => {
if (!sock?.user || !sock?.ws || sock.ws.readyState !== ws.OPEN) {
try { sock.ws.close() } catch (e) { }
sock.ev.removeAllListeners()
let i = global.conns.indexOf(sock)
if (i >= 0) global.conns.splice(i, 1)
}
}, 180000) // cada 3 minutos

})
}

function sleep(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }
function msToTime(duration) {
var seconds = Math.floor((duration / 1000) % 60),
minutes = Math.floor((duration / (1000 * 60)) % 60);
return minutes + ' m y ' + seconds + ' s'
}

async function joinChannels(conn) {
for (const channelId of Object.values(global.ch)) {
await conn.newsletterFollow(channelId).catch(() => {})
}}