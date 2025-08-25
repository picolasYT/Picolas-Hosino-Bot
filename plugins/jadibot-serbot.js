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

import fs from "fs";
import path from "path";
import pino from "pino";
import chalk from "chalk";
import util from "util";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import * as ws from "ws";
const { useMultiFileAuthState, DisconnectReason, makeCacheableSignalKeyStore, fetchLatestBaileysVersion } = (await import("@whiskeysockets/baileys"));
const { child, spawn, exec } = await import('child_process');
import { makeWASocket } from "../lib/simple.js";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const RubyJBOptions = {};
if (!(global.conns instanceof Array)) global.conns = [];
if (!global.db) global.db = { data: { users: {}, settings: {} } };

const MAX_SUBBOTS = 90;
const HEARTBEAT_INTERVAL = 30000; // 30s

function msToTime(duration) {
    var milliseconds = parseInt((duration % 1000) / 100),
        seconds = Math.floor((duration / 1000) % 60),
        minutes = Math.floor((duration / (1000 * 60)) % 60),
        hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
    hours = (hours < 10) ? '0' + hours : hours;
    minutes = (minutes < 10) ? '0' + minutes : minutes;
    seconds = (seconds < 10) ? '0' + seconds : seconds;
    return minutes + ' m y ' + seconds + ' s ';
}
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

function cleanListeners(sock) {
    if (sock && typeof sock.ev?.removeAllListeners === 'function') sock.ev.removeAllListeners();
}

function removeSessionData(pathRubyJadiBot) {
    try { fs.rmdirSync(pathRubyJadiBot, { recursive: true }); } catch (e) {}
}

function heartbeatSubBots() {
    global.conns = global.conns.filter(sock => {
        if (!sock || !sock.ws || sock.ws.readyState !== ws.OPEN) {
            try { sock.ws.close(); } catch {}
            cleanListeners(sock);
            return false;
        }
        return true;
    });
}

// Heartbeat para limpiar sub bots caídos cada 30s
setInterval(heartbeatSubBots, HEARTBEAT_INTERVAL);

// RECONEXIÓN ROBUSTA
async function autoReconnect(sock, connectionOptions, maxRetries = 10) {
    let retries = 0;
    while (retries < maxRetries) {
        try {
            await creloadHandler(sock, connectionOptions, true);
            return true;
        } catch (err) {
            retries++;
            console.error(`[SubBot] Intento de reconexión #${retries} fallido. Retentando en ${retries * 5}s...`);
            await delay(retries * 5000);
        }
    }
    console.error('[SubBot] No se pudo reconectar después de varios intentos.');
    return false;
}

// HANDLER PRINCIPAL: Estructura clara y reconocimiento de comando
let handler = async (m, { conn, args, usedPrefix, command }) => {
    let time = global.db.data.users[m.sender]?.Subs + 120000;
    if (new Date - (global.db.data.users[m.sender]?.Subs || 0) < 120000) 
        return conn.reply(m.chat, `Debes esperar ${msToTime(time - new Date())} para volver a vincular un *Sub-Bot.*`, m);

    const subBotsCount = global.conns.length;
    if (subBotsCount >= MAX_SUBBOTS) {
        return conn.reply(m.chat, `No hay espacios disponibles para Sub-Bots.`, m);
    }
    
    let who = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : m.fromMe ? conn.user.jid : m.sender;
    let id = `${who.split`@`[0]}`;
    let pathRubyJadiBot = path.join(`./jadisessions/`, id);
    if (!fs.existsSync(pathRubyJadiBot)) fs.mkdirSync(pathRubyJadiBot, { recursive: true });

    RubyJBOptions.pathRubyJadiBot = pathRubyJadiBot;
    RubyJBOptions.m = m;
    RubyJBOptions.conn = conn;
    RubyJBOptions.args = args;
    RubyJBOptions.usedPrefix = usedPrefix;
    RubyJBOptions.command = command;
    RubyJBOptions.fromCommand = true;

    await RubyJadiBot(RubyJBOptions);
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
    global.db.data.users[m.sender].Subs = new Date * 1;
};

handler.help = ['qr', 'code', 'jadibot', 'subbot'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code', 'jadibot', 'subbot'];
export default handler;

// FUNCION PRINCIPAL DEL SUBBOT
export async function RubyJadiBot(options) {
    let { pathRubyJadiBot, m, conn, args, usedPrefix, command } = options;

    // Reconocimiento de comandos
    let cmd = (typeof command === "string" ? command : "");
    let isCode = /code/.test(cmd) || args.some(a => /code/.test(a));
    
    const pathCreds = path.join(pathRubyJadiBot, "creds.json");
    if (!fs.existsSync(pathRubyJadiBot)) fs.mkdirSync(pathRubyJadiBot, { recursive: true });
    if (args[0] && args[0] !== undefined) {
        try {
            fs.writeFileSync(pathCreds, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
        } catch {
            conn.reply(m.chat, `Use correctamente el comando » ${usedPrefix + command} code`, m);
            return;
        }
    }

    let { version } = await fetchLatestBaileysVersion();
    const msgRetry = (MessageRetryMap) => {};
    const msgRetryCache = new NodeCache();
    const { state, saveState, saveCreds } = await useMultiFileAuthState(pathRubyJadiBot);
    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        msgRetry,
        msgRetryCache,
        browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino (Sub Bot)', 'Chrome','2.0.0'],
        version: version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);
    sock.isInit = false;
    let isInit = true;

    // Handler de reconexión y eventos
    async function connectionUpdate(update) {
        const { connection, lastDisconnect, isNewLogin, qr } = update;
        if (isNewLogin) sock.isInit = false;

        // Modo QR
        if (qr && !isCode) {
            let txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: "Escanea el QR para vincularte como Sub-Bot.\nEste código expira en 45 segundos." }, { quoted: m });
            if (txtQR?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000);
            return;
        }

        // Modo código
        if (qr && isCode) {
            let secret = await sock.requestPairingCode((m.sender.split`@`[0]));
            secret = secret.match(/.{1,4}/g)?.join("-");
            let txtCode = await conn.sendMessage(m.chat, { text: `Usa este código para vincularte como Sub-Bot:\n${secret}` }, { quoted: m });
            if (txtCode?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000);
            return;
        }

        // Handle desconexiones
        const reason = lastDisconnect?.error?.output?.statusCode || lastDisconnect?.error?.output?.payload?.statusCode;
        if (connection === 'close') {
            cleanListeners(sock);
            let reconectado = await autoReconnect(sock, connectionOptions);
            if (!reconectado) {
                removeSessionData(pathRubyJadiBot);
                m?.chat && await conn.sendMessage(m.chat, {text: 'No se pudo reconectar el sub bot, por favor intenta vincular de nuevo.'}, { quoted: m });
            }
            return;
        }

        if (connection === 'open') {
            sock.isInit = true;
            global.conns.push(sock);
            m?.chat && await conn.sendMessage(m.chat, {text: '¡Sub bot conectado exitosamente!'}, { quoted: m });
        }
    }

    // Carga dinámica del handler
    let handlerModule = await import('../handler.js');
    let creloadHandler = async function(sock, connectionOptions, restatConn) {
        try {
            handlerModule = await import(`../handler.js?update=${Date.now()}`).catch(console.error);
        } catch (e) {
            console.error('Error recargando handler:', e);
        }
        if (restatConn) {
            cleanListeners(sock);
            sock = makeWASocket(connectionOptions);
            isInit = true;
        }
        if (!isInit) {
            sock.ev.off("messages.upsert", sock.handler);
            sock.ev.off("connection.update", sock.connectionUpdate);
            sock.ev.off("creds.update", sock.credsUpdate);
        }
        sock.handler = handlerModule.handler.bind(sock);
        sock.connectionUpdate = connectionUpdate.bind(sock);
        sock.credsUpdate = saveCreds.bind(sock, true);
        sock.ev.on("messages.upsert", sock.handler);
        sock.ev.on("connection.update", sock.connectionUpdate);
        sock.ev.on("creds.update", sock.credsUpdate);
        isInit = false;
        return true;
    };
    await creloadHandler(sock, connectionOptions, false);
}