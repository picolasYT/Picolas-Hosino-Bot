import { smsg } from './lib/simple.js';
import { format } from 'util';
import * as ws from 'ws';
import path, { join } from 'path';
import { unwatchFile, watchFile } from 'fs';
import chalk from 'chalk';
import failureHandler from './lib/respuesta.js';
import { fileURLToPath } from 'url';

const { proto } = (await import('@whiskeysockets/baileys')).default;
const isNumber = x => typeof x === 'number' && !isNaN(x);

export async function handler(chatUpdate) {
    this.uptime = this.uptime || Date.now();
    if (!chatUpdate || !chatUpdate.messages || chatUpdate.messages.length === 0) return;

    const m = chatUpdate.messages[chatUpdate.messages.length - 1];
    if (!m) return;

    if (global.db.data == null) await global.loadDatabase();

    try {
        const conn = this;
        const newM = smsg(conn, m) || m;
        if (!newM) return;

        const chatDB = global.db.data.chats[newM.chat];
        if (chatDB && chatDB.botPrimario) {
            const universalWords = ['resetbot', 'resetprimario', 'botreset'];
            const firstWord = newM.text ? newM.text.trim().split(' ')[0].toLowerCase() : '';
            if (!universalWords.includes(firstWord) && chatDB.botPrimario !== conn.user.jid) {
                return;
            }
        }

        newM.exp = 0;
        newM.coin = false;

        global.db.data.users[newM.sender] = global.db.data.users[newM.sender] || {};
        const user = global.db.data.users[newM.sender];
        Object.assign(user, {
            exp: user.exp ?? 0,
            coin: user.coin ?? 10,
            joincount: user.joincount ?? 1,
            diamond: user.diamond ?? 3,
            lastadventure: user.lastadventure ?? 0,
            lastclaim: user.lastclaim ?? 0,
            health: user.health ?? 100,
            crime: user.crime ?? 0,
            lastcofre: user.lastcofre ?? 0,
            lastdiamantes: user.lastdiamantes ?? 0,
            lastpago: user.lastpago ?? 0,
            lastcode: user.lastcode ?? 0,
            lastcodereg: user.lastcodereg ?? 0,
            lastduel: user.lastduel ?? 0,
            lastmining: user.lastmining ?? 0,
            muto: user.muto ?? false,
            premium: user.premium ?? false,
            premiumTime: user.premium ? user.premiumTime ?? 0 : 0,
            registered: user.registered ?? false,
            genre: user.genre ?? '',
            birth: user.birth ?? '',
            marry: user.marry ?? '',
            description: user.description ?? '',
            packstickers: user.packstickers ?? null,
            name: user.name ?? newM.name,
            age: user.age ?? -1,
            regTime: user.regTime ?? -1,
            afk: user.afk ?? -1,
            afkReason: user.afkReason ?? '',
            role: user.role ?? 'Nuv',
            banned: user.banned ?? false,
            useDocument: user.useDocument ?? false,
            level: user.level ?? 0,
            bank: user.bank ?? 0,
            warn: user.warn ?? 0,
        });

        global.db.data.chats[newM.chat] = global.db.data.chats[newM.chat] || {};
        const chat = global.db.data.chats[newM.chat];
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
            antiArabe: chat.antiArabe ?? false,
            nsfw: chat.nsfw ?? false,
            antifake: chat.antifake ?? false,
            delete: chat.delete ?? false,
            expired: chat.expired ?? 0,
            botPrimario: chat.botPrimario ?? null,
        });

        global.db.data.settings[conn.user.jid] = global.db.data.settings[conn.user.jid] || {};
        const settings = global.db.data.settings[conn.user.jid];
        Object.assign(settings, {
            self: settings.self ?? false,
            restrict: settings.restrict ?? true,
            jadibotmd: settings.jadibotmd ?? true,
            antiPrivate: settings.antiPrivate ?? false,
            autoread: settings.autoread ?? false,
            status: settings.status ?? 0,
        });

        if (opts['nyimak']) return;
        if (!newM.fromMe && opts['self']) return;
        if (opts['swonly'] && newM.chat !== 'status@broadcast') return;
        if (typeof newM.text !== 'string') newM.text = '';

        const groupMetadata = (newM.isGroup ? ((conn.chats[newM.chat] || {}).metadata || await conn.groupMetadata(newM.chat).catch(_ => null)) : {}) || {};
        const participants = (newM.isGroup ? groupMetadata.participants : []) || [];
        const cleanJid = jid => jid?.split(':')[0] || '';
        const normalizeJid = jid => jid?.replace(/[^0-9]/g, '');
        const senderNum = normalizeJid(newM.sender);
        const botNums = [conn.user.jid, conn.user.lid].map(j => normalizeJid(cleanJid(j)));
        const userParticipant = newM.isGroup ? participants.find(u => normalizeJid(u.id) === senderNum) : {};
        const botParticipant = newM.isGroup ? participants.find(u => botNums.includes(normalizeJid(u.id))) : {};
        const isROwner = [conn.decodeJid(global.conn.user.id), ...global.owner.map(([number]) => number)].map(v => v.replace(/[^0-9]/g, '')).includes(senderNum);
        const isOwner = isROwner || newM.fromMe;
        const isAdmin = newM.isGroup ? userParticipant?.admin === 'superadmin' || userParticipant?.admin === 'admin' : false;
        const isBotAdmin = !!botParticipant?.admin;
        const isMods = isOwner || global.mods.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum);
        const isPrems = isROwner || global.prems.map(v => v.replace(/[^0-9]/g, '')).includes(senderNum) || user.premium;

        newM.exp += Math.ceil(Math.random() * 10);
        let usedPrefix;
        const ___dirname = path.join(path.dirname(fileURLToPath(import.meta.url)), './plugins');

        for (const name in global.plugins) {
            const plugin = global.plugins[name];
            if (!plugin || plugin.disabled) continue;

            const __filename = join(___dirname, name);
            if (typeof plugin.all === 'function') {
                try {
                    await plugin.all.call(conn, newM, { chatUpdate, __dirname, __filename });
                } catch (e) { console.error(e); }
            }

            if (!opts['restrict'] && plugin.tags?.includes('admin')) continue;

            const str2Regex = str => str.replace(/[|\\{}()[\]^$+*?.]/g, '\\$&');
            const _prefix = plugin.customPrefix ? plugin.customPrefix : conn.prefix ? conn.prefix : global.prefix;

            const match = (_prefix instanceof RegExp ? [[_prefix.exec(newM.text), _prefix]] :
                Array.isArray(_prefix) ?
                _prefix.map(p => {
                    const re = p instanceof RegExp ? p : new RegExp(str2Regex(p));
                    return [re.exec(newM.text), re];
                }) :
                typeof _prefix === 'string' ? [[new RegExp(str2Regex(_prefix)).exec(newM.text), new RegExp(str2Regex(_prefix))]] : [[[], new RegExp]]
            ).find(p => p[1]);

            if (typeof plugin.before === 'function' && await plugin.before.call(conn, newM, { match, conn, participants, groupMetadata, userParticipant, botParticipant, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename })) {
                continue;
            }

            if (typeof plugin !== 'function') continue;

            if ((usedPrefix = (match[0] || '')[0])) {
                const noPrefix = newM.text.replace(usedPrefix, '').trim();
                const [command, ...args] = noPrefix.split(/\s+/).filter(v => v);
                const text = args.join(' ');
                
                const isAccept = plugin.command instanceof RegExp ? plugin.command.test(command) :
                    Array.isArray(plugin.command) ?
                    plugin.command.some(cmd => cmd instanceof RegExp ? cmd.test(command) : cmd === command) :
                    typeof plugin.command === 'string' ? plugin.command === command : false;
                
                if (!isAccept) continue;
                
                if (newM.id?.startsWith('NJX-') || (newM.id?.startsWith('BAE5') && newM.id.length === 16) || (newM.id?.startsWith('B24E') && newM.id.length === 20)) {
                    continue;
                }
                
                global.comando = command;
                newM.plugin = name;

                if (chat?.isBanned && !isROwner && !['grupo-unbanchat.js', 'owner-exec.js', 'owner-exec2.js', 'grupo-delete.js'].includes(name)) {
                    return;
                }

                if (user?.banned && !isROwner && !['owner-unbanuser.js', 'owner-exec.js', 'owner-exec2.js'].includes(name)) {
                    newM.reply(`《✦》Estás baneado/a, no puedes usar comandos en este bot!\n\n${user.bannedReason ? `✰ *Motivo:* ${user.bannedReason}` : '✰ *Motivo:* Sin Especificar'}\n\n> ✧ Si este Bot es cuenta oficial y tiene evidencia que respalde que este mensaje es un error, puedes exponer tu caso con un moderador.`);
                    return;
                }
                
                const adminMode = chat?.modoadmin;
                const mini = `${plugin.botAdmin || plugin.admin || plugin.group || noPrefix || usedPrefix || newM.text.slice(0, 1) === usedPrefix || plugin.command}`;
                if (adminMode && !isOwner && !isROwner && newM.isGroup && !isAdmin && mini) return;

                if (plugin.rowner && !isROwner) {
                    failureHandler('rowner', conn, newM);
                    continue;
                }
                if (plugin.owner && !isOwner) {
                    failureHandler('owner', conn, newM);
                    continue;
                }
                if (plugin.mods && !isMods) {
                    failureHandler('mods', conn, newM);
                    continue;
                }
                if (plugin.premium && !isPrems) {
                    failureHandler('premium', conn, newM);
                    continue;
                }
                if (plugin.admin && !isAdmin) {
                    failureHandler('admin', conn, newM);
                    continue;
                }
                if (plugin.private && newM.isGroup) {
                    failureHandler('private', conn, newM);
                    continue;
                }
                if (plugin.group && !newM.isGroup) {
                    failureHandler('group', conn, newM);
                    continue;
                }
                if (plugin.register && !user.registered) {
                    failureHandler('unreg', conn, newM);
                    continue;
                }
                
                newM.isCommand = true;
                const xp = 'exp' in plugin ? parseInt(plugin.exp) : 17;
                newM.exp += xp;

                if (!isPrems && plugin.coin && user.coin < plugin.coin) {
                    conn.reply(newM.chat, `❮✦❯ Se agotaron tus ${moneda}`, newM);
                    continue;
                }
                if (plugin.level > user.level) {
                    conn.reply(newM.chat, `❮✦❯ Se requiere el nivel: *${plugin.level}*\n\n• Tu nivel actual es: *${user.level}*\n\n• Usa este comando para subir de nivel:\n*${usedPrefix}levelup*`, newM);
                    continue;
                }

                const extra = {
                    match, usedPrefix, noPrefix, _args: args, args, command, text, conn, participants, groupMetadata, user, botParticipant, isROwner, isOwner, isAdmin, isBotAdmin, isPrems, chatUpdate, __dirname, __filename,
                };
                
                try {
                    await plugin.call(conn, newM, extra);
                    if (!isPrems) newM.coin = newM.coin || plugin.coin || false;
                } catch (e) {
                    newM.error = e;
                    console.error(e);
                    if (e) {
                        let text = format(e);
                        for (const key of Object.values(global.APIKeys)) text = text.replace(new RegExp(key, 'g'), 'Administrador');
                        newM.reply(text);
                    }
                } finally {
                    if (typeof plugin.after === 'function') {
                        try {
                            await plugin.after.call(conn, newM, extra);
                        } catch (e) { console.error(e); }
                    }
                    if (newM.coin) conn.reply(newM.chat, `❮✦❯ Utilizaste ${+newM.coin} ${moneda}`, newM);
                }
                break;
            }
        }
    } catch (e) {
        console.error(e);
    } finally {
        let stats = global.db.data.stats;
        if (newM) {
            const utente = global.db.data.users[newM.sender];
            if (utente?.muto) {
                const bang = newM.key.id;
                const cancellazzione = newM.key.participant;
                await conn.sendMessage(newM.chat, { delete: { remoteJid: newM.chat, fromMe: false, id: bang, participant: cancellazzione }});
            }
            if (newM.sender && (user)) {
                user.exp += newM.exp;
                user.coin -= newM.coin * 1;
            }
            if (newM.plugin) {
                const now = +new Date;
                stats[newM.plugin] = stats[newM.plugin] || { total: 0, success: 0, last: now, lastSuccess: 0 };
                stats[newM.plugin].total += 1;
                stats[newM.plugin].last = now;
                if (newM.error == null) {
                    stats[newM.plugin].success += 1;
                    stats[newM.plugin].lastSuccess = now;
                }
            }
        }
        try {
            if (!opts['noprint']) await (await import(`./lib/print.js`)).default(newM, conn);
        } catch (e) { console.log(newM, newM.quoted, e); }
        if (global.db.data.settings[conn.user.jid]?.autoread) await conn.readMessages([newM.key]);
        if (global.db.data.chats[newM.chat]?.reaction && newM.text.match(/(ción|dad|aje|oso|izar|mente|pero|tion|age|ous|ate|and|but|ify|ai|yuki|a|s)/gi)) {
            const pickRandom = (list) => list[Math.floor(Math.random() * list.length)];
            const emot = pickRandom(["🍟", "😃", "😄", "😁", "😆", "🍓", "😅", "😂", "🤣", "🥲", "☺️", "😊", "😇", "🙂", "🙃", "😉", "😌", "😍", "🥰", "😘", "😗", "😙", "🌺", "🌸", "😚", "😋", "😛", "😝", "😜", "🤪", "🤨", "🌟", "🤓", "😎", "🥸", "🤩", "🥳", "😏", "💫", "😞", "😔", "😟", "😕", "🙁", "☹️", "😣", "😖", "😫", "😩", "🥺", "😢", "😭", "😤", "😠", "😡", "🤬", "🤯", "😳", "🥵", "🥶", "😶‍🌫️", "😱", "😨", "😰", "😥", "😓", "🤗", "🤔", "🫣", "🤭", "🤖", "🍭", "🤫", "🫠", "🤥", "😶", "📇", "😐", "💧", "😑", "🫨", "😬", "🙄", "😯", "😦", "😧", "😮", "😲", "🥱", "😴", "🤤", "😪", "😮‍💨", "😵", "😵‍💫", "🤐", "🥴", "🤢", "🤮", "🤧", "😷", "🤒", "🤕", "🤑", "🤠", "😈", "👿", "👺", "🧿", "🌩", "👻", "😺", "😸", "😹", "😻", "😼", "😽", "🙀", "😿", "😾", "🫶", "👍", "✌️", "🙏", "🫵", "🤏", "🤌", "☝️", "🖕", "🙏", "🫵", "🫂", "🐱", "🤹‍♀️", "🤹‍♂️", "🗿", "✨", "⚡", "🔥", "🌈", "🩷", "❤️", "🧡", "💛", "💚", "🩵", "💙", "💜", "🖤", "🩶", "🤍", "🤎", "💔", "❤️‍🔥", "❤️‍🩹", "❣️", "💕", "💞", "💓", "💗", "💖", "💘", "💝", "🚩", "👊", "⚡️", "💋", "🫰", "💅", "👑", "🐣", "🐤", "🐈"]);
            if (!newM.fromMe) return conn.sendMessage(newM.chat, { react: { text: emot, key: newM.key }});
        }
    }
}

global.dfail = (type, m, conn) => { failureHandler(type, conn, m); };
const file = global.__filename(import.meta.url, true);
watchFile(file, async () => {
    unwatchFile(file);
    console.log(chalk.green('Actualizando "handler.js"'));
    if (global.conns?.length > 0) {
        const users = [...new Set(global.conns.filter((conn) => conn.user && conn.ws.socket?.readyState !== ws.CLOSED))];
        for (const userr of users) { userr.subreloadHandler(false); }
    }
});