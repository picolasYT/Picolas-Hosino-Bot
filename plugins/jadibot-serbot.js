import fs from "fs";
import path from "path";
import pino from "pino";
import qrcode from "qrcode";
import NodeCache from "node-cache";
import * as ws from "ws";
import chalk from "chalk";
import { makeWASocket } from "../lib/simple.js";
import { useMultiFileAuthState, fetchLatestBaileysVersion, makeCacheableSignalKeyStore } from "@whiskeysockets/baileys";

const MAX_SUBBOTS = 90;
const HEARTBEAT_INTERVAL = 30000;
if (!(global.conns instanceof Array)) global.conns = [];

let handler = async (m, { conn, args, usedPrefix, command }) => {
    let cooldown = global.db.data.users[m.sender]?.Subs + 120000;
    if (new Date - (global.db.data.users[m.sender]?.Subs || 0) < 120000) 
        return conn.reply(m.chat, `Debes esperar para volver a vincular un Sub-Bot.`, m);

    if (global.conns.length >= MAX_SUBBOTS) {
        return conn.reply(m.chat, `No hay espacios disponibles para Sub-Bots.`, m);
    }
    
    let id = `${m.sender.split`@`[0]}`;
    let sessionPath = path.join("./jadisessions/", id);
    if (!fs.existsSync(sessionPath)) fs.mkdirSync(sessionPath, { recursive: true });

    await RubyJadiBot({ sessionPath, m, conn, args, usedPrefix, command });
    if (!global.db.data.users[m.sender]) global.db.data.users[m.sender] = {};
    global.db.data.users[m.sender].Subs = new Date * 1;
};

handler.help = ['qr', 'code', 'jadibot', 'subbot'];
handler.tags = ['serbot'];
handler.command = ['qr', 'code', 'jadibot', 'subbot'];
export default handler;

async function RubyJadiBot({ sessionPath, m, conn, args, usedPrefix, command }) {
    let isCode = /code/.test(command) || args.some(a => /code/.test(a));
    let credsFile = path.join(sessionPath, "creds.json");
    if (args[0]) {
        try {
            fs.writeFileSync(credsFile, JSON.stringify(JSON.parse(Buffer.from(args[0], "base64").toString("utf-8")), null, '\t'));
        } catch {
            conn.reply(m.chat, `Usa correctamente el comando » ${usedPrefix + command} code`, m);
            return;
        }
    }

    let { version } = await fetchLatestBaileysVersion();
    const msgRetry = (MessageRetryMap) => {};
    const msgRetryCache = new NodeCache();
    const { state, saveCreds } = await useMultiFileAuthState(sessionPath);

    const connectionOptions = {
        logger: pino({ level: "fatal" }),
        printQRInTerminal: false,
        auth: { creds: state.creds, keys: makeCacheableSignalKeyStore(state.keys, pino({level: 'silent'})) },
        msgRetry,
        msgRetryCache,
        browser: isCode ? ['Ubuntu', 'Chrome', '110.0.5585.95'] : ['Ruby Hoshino (Sub Bot)', 'Chrome','2.0.0'],
        version,
        generateHighQualityLinkPreview: true
    };

    let sock = makeWASocket(connectionOptions);

    async function connectionUpdate(update) {
        const { connection, qr } = update;

        // Modo QR
        if (qr && !isCode) {
            let txtQR = await conn.sendMessage(m.chat, { image: await qrcode.toBuffer(qr, { scale: 8 }), caption: "Escanea el QR para vincularte como Sub-Bot.\nEste código expira en 45 segundos." }, { quoted: m });
            if (txtQR?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: txtQR.key }) }, 30000);
            return;
        }

        // Modo código (pairing code) - SOLO UNA VEZ y separado del texto
        if (qr && isCode) {
            let secret = await sock.requestPairingCode((m.sender.split`@`[0]));
            secret = secret.match(/.{1,4}/g)?.join("-");
            let txtCode = await conn.sendMessage(m.chat, { text: "Usa este código para vincularte como Sub-Bot temporal. No es recomendable usar tu cuenta principal." }, { quoted: m });
            let codeMsg = await conn.sendMessage(m.chat, { text: secret }, { quoted: m });
            if (txtCode?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: txtCode.key }) }, 30000);
            if (codeMsg?.key) setTimeout(() => { conn.sendMessage(m.sender, { delete: codeMsg.key }) }, 30000);
            return;
        }

        // Abierto
        if (connection === 'open') {
            global.conns.push(sock);
            m?.chat && await conn.sendMessage(m.chat, { text: '¡Sub bot conectado exitosamente!' }, { quoted: m });
            await joinChannels(sock); // Sigue tu canal
        }
    }

    sock.ev.on("connection.update", connectionUpdate);
    sock.ev.on("creds.update", saveCreds);

    // Limpieza automática de subbots caídos
    setInterval(() => {
        if (!sock.user || !sock.ws || sock.ws.readyState !== ws.OPEN) {
            try { sock.ws.close(); } catch (e) {}
            if (typeof sock.ev?.removeAllListeners === 'function') sock.ev.removeAllListeners();
            let idx = global.conns.indexOf(sock);
            if (idx >= 0) global.conns.splice(idx, 1);
        }
    }, HEARTBEAT_INTERVAL);
}

// Función para que los sub bots sigan tu canal
async function joinChannels(conn) {
    if (!global.ch) return;
    for (const channelId of Object.values(global.ch)) {
        await conn.newsletterFollow(channelId).catch(() => {});
    }
}