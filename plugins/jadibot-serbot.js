/*⚠ PROHIBIDO EDITAR ⚠
Este codigo fue adaptado y mejorado por Dioneibi-rip
Basado en MysticBot-MD y GataNina-Li
*/

import { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } from "@whiskeysockets/baileys"
import qrcode from "qrcode"
import NodeCache from "node-cache"
import fs from "fs"
import path from "path"
import pino from 'pino'
import chalk from 'chalk'
import util from 'util'
import * as ws from 'ws'
import { makeWASocket } from '../lib/simple.js'
import { fileURLToPath } from 'url'
const { exec } = await import('child_process')

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const RubyJBOptions = {}
if (!Array.isArray(global.conns)) global.conns = []
let emoji = '🕒', emoji2 = '❌'

let handler = async (m, { conn, args, usedPrefix, command }) => {
  // Limpia sub-bots que estén muertos antes de crear uno nuevo
  global.conns = global.conns.filter(conn =>
    conn.user &&
    conn.ws &&
    conn.ws.socket &&
    conn.ws.socket.readyState === ws.OPEN
  )

  // Límite de sub-bots
  if (global.conns.length >= 90) {
    await conn.reply(m.chat, `${emoji2} No hay espacios para más Sub-Bots.`, m)
    return
  }

  // Cooldown para evitar spam
  let user = global.db.data.users[m.sender]
  let now = new Date() * 1
  if (user.Subs && now - user.Subs < 120_000) {
    let wait = msToTime(user.Subs + 120_000 - now)
    return conn.reply(m.chat, `${emoji} Debes esperar ${wait} para volver a vincular un *Sub-Bot*`, m)
  }

  // Prepara ruta de sesión
  let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender
  let id = `${who.split('@')[0]}`
  let pathRubyJadiBot = path.join('./jadibot/', id)
  if (!fs.existsSync(pathRubyJadiBot)) fs.mkdirSync(pathRubyJadiBot, { recursive: true })

  RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot
  RubyJBOptions.m = m
  RubyJBOptions.conn = conn
  RubyJBOptions.args = args
  RubyJBOptions.usedPrefix = usedPrefix
  RubyJBOptions.command = command
  RubyJBOptions.fromCommand = true

  await conn.reply(m.chat, '⏳ Conectando sub-bot, por favor espera...', m)
  try {
    await RubyJadiBot(RubyJBOptions)
    await conn.reply(m.chat, '✅ Sub-bot conectado y listo para recibir comandos.', m)
    user.Subs = now
  } catch (e) {
    await conn.reply(m.chat, `❌ Error al conectar el sub-bot: ${e.message}`, m)
  }
}
handler.help = ['qr', 'code']
handler.tags = ['serbot']
handler.command = ['qr', 'code']
export default handler

export async function RubyJadiBot(options) {
  let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options
  if (command === 'code') {
    command = 'qr'
    args.unshift('code')
  }
  const mcode = args[0] && /(--code|code)/.test(args[0].trim()) ? true : args[1] && /(--code|code)/.test(args[1]?.trim() || "") ? true : false

  if (!fs.existsSync(pathRubyJadiBot)) fs.mkdirSync(pathRubyJadiBot, { recursive: true })
  const pathCreds = path.join(pathRubyJadiBot, "creds.json")
  try {
    if (args[0] && args[0] !== undefined && args[0] !== 'code') {
      fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'))
    }
  } catch {
    conn.reply(m.chat, `${emoji} Usa correctamente el comando » ${usedPrefix + command} code`, m)
    return
  }

  let { version } = await fetchLatestBaileysVersion()
  const msgRetry = (MessageRetryMap) => { }
  const msgRetryCache = new NodeCache()
  const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot)

  const connectionOptions = {
    logger: pino({ level: "fatal" }),
    printQRInTerminal: false,
    auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({ level: 'silent' })) },
    msgRetry,
    msgRetryCache,
    browser: mcode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino (Sub Bot)', 'Chrome', '2.0.0'],
    version: version,
    generateHighQualityLinkPreview: true
  }

  // Antes de crear el socket, limpia listeners viejos si los hay
  let sock = makeWASocket(connectionOptions)
  sock.isInit = false
  let isInit = true

  // Control de listeners únicos
  if (sock.handler) sock.ev.off("messages.upsert", sock.handler)
  if (sock.connectionUpdate) sock.ev.off("connection.update", sock.connectionUpdate)
  if (sock.credsUpdate) sock.ev.off("creds.update", sock.credsUpdate)

  // LISTENERS PRINCIPALES
  sock.handler = handlerModule.handler.bind(sock)
  sock.connectionUpdate = connectionUpdate.bind(sock)
  sock.credsUpdate = saveCreds.bind(sock, true)
  sock.ev.on("messages.upsert", sock.handler)
  sock.ev.on("connection.update", sock.connectionUpdate)
  sock.ev.on("creds.update", sock.credsUpdate)

  // Feedback QR/Code (acelera la conexión)
  async function connectionUpdate(update) {
    const { connection, lastDisconnect, isNewLogin, qr } = update
    if (isNewLogin) sock.isInit = false

    if (qr && !mcode) {
      if (m?.chat) {
        let qrImage = await qrcode.toBuffer(qr, { scale: 8 })
        let txtQR = await conn.sendMessage(m.chat, { image: qrImage, caption: 'Escanea este QR para vincular tu sub-bot.' }, { quoted: m })
        if (txtQR?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtQR.key }), 30000)
      }
      return
    }
    if (qr && mcode) {
      let secret = await sock.requestPairingCode(m.sender.split`@`[0])
      secret = secret.match(/.{1,4}/g)?.join("-")
      let txtCode = await conn.sendMessage(m.chat, { text: 'Código de vinculación generado para sub-bot.' }, { quoted: m })
      let codeBot = await m.reply(secret)
      if (txtCode?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: txtCode.key }), 30000)
      if (codeBot?.key) setTimeout(() => conn.sendMessage(m.sender, { delete: codeBot.key }), 30000)
    }

    // Manejo de desconexión limpia
    const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode
    if (connection === 'close') {
      cleanSocket(sock)
    }
    if (connection === 'open') {
      if (!global.db.data?.users) loadDatabase()
      let userName = sock.authState.creds.me.name || 'Anónimo'
      let userJid = sock.authState.creds.me.jid || `${path.basename(pathRubyJadiBot)}@s.whatsapp.net`
      console.log(chalk.bold.cyanBright(`\n❒【• SUB-BOT •】\n│ 🟢 ${userName} (+${path.basename(pathRubyJadiBot)}) conectado exitosamente.\n❒【• CONECTADO •】`))
      sock.isInit = true
      global.conns.push(sock)
      await joinChannels(sock)
      m?.chat && await conn.sendMessage(m.chat, { text: `@${m.sender.split('@')[0]}, ¡Sub-Bot conectado!`, mentions: [m.sender] }, { quoted: m })
    }
  }

  // Limpieza automática cada 2 minutos
  setInterval(() => {
    global.conns = global.conns.filter(conn =>
      conn.user &&
      conn.ws &&
      conn.ws.socket &&
      conn.ws.socket.readyState === ws.OPEN
    )
  }, 120000)
}

// Función para limpiar sockets muertos
function cleanSocket(sock) {
  try { sock.ws.close() } catch { }
  try { sock.ev.removeAllListeners() } catch { }
  let i = global.conns.indexOf(sock)
  if (i >= 0) global.conns.splice(i, 1)
}

// Utilidades
function msToTime(duration) {
  var milliseconds = parseInt((duration % 1000) / 100),
    seconds = Math.floor((duration / 1000) % 60),
    minutes = Math.floor((duration / (1000 * 60)) % 60)
  minutes = (minutes < 10) ? '0' + minutes : minutes
  seconds = (seconds < 10) ? '0' + seconds : seconds
  return minutes + ' m y ' + seconds + ' s '
}

async function joinChannels(conn) {
  if (!global.ch) return
  for (const channelId of Object.values(global.ch)) {
    await conn.newsletterFollow(channelId).catch(() => { })
  }
}

// Asegúrate de tener handlerModule definido correctamente
import * as handlerModule from '../handler.js'