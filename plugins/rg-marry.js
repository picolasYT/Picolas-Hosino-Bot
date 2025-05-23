import fs from 'fs';
import path from 'path';

const marriagesFile = path.resolve('./src/database/casados.json');
let proposals = {};

function loadMarriages() {
  if (fs.existsSync(marriagesFile)) {
    const data = fs.readFileSync(marriagesFile, 'utf-8');
    return JSON.parse(data);
  } else return {};
}

function saveMarriages(data) {
  fs.writeFileSync(marriagesFile, JSON.stringify(data, null, 2));
}

let marriages = loadMarriages();

let handler = async (m, { conn, command, usedPrefix, args }) => {
  const isMarriage = /^(marry)$/i.test(command);
  const isDivorce = /^(divorce)$/i.test(command);

  async function handleError(err) {
    await m.reply('✐ Ocurrió un error.');
    console.error(err);
  }

  switch (true) {
    case isMarriage: {
      let userData = global.db.data.users[m.sender];
      if (userData.age < 18) {
        await m.reply('✧ Debes ser mayor de 18 años para casarte.');
        return;
      }

      let sender = m.sender;

      if (marriages[sender]) {
        await conn.reply(
          m.chat,
          `✧ Ya estás casado/a con *@${marriages[sender].split('@')[0]}*\n> Puedes divorciarte con el comando: *#divorce*`,
          m,
          { mentions: [marriages[sender]] }
        );
        return;
      }

      if (!m.mentionedJid || m.mentionedJid.length === 0) {
        await conn.reply(
          m.chat,
          '✧ Debes mencionar a alguien para aceptar o proponer matrimonio.\n> Ejemplo » *' + usedPrefix + command + '* @' + conn.user.jid.split('@')[0],
          m,
          { mentions: [conn.user.jid] }
        );
        return;
      }

      let target = m.mentionedJid[0];

      if (marriages[target]) {
        await conn.reply(
          m.chat,
          `✧ @${target.split('@')[0]} ya está casado/a con: *@${marriages[target].split('@')[0]}*\n> Puedes usar *#divorce*`,
          m,
          { mentions: [target, marriages[target]] }
        );
        return;
      }

      if (sender === target) {
        await m.reply('✧ ¡No puedes proponerte matrimonio a ti mismo!');
        return;
      }

      if (proposals[target] && proposals[target] === sender) {
        delete proposals[target];

        let senderName = conn.getName(sender);
        let targetName = conn.getName(target);

        marriages[sender] = target;
        marriages[target] = sender;
        saveMarriages(marriages);

        global.db.data.users[sender].marry = targetName;
        global.db.data.users[target].marry = senderName;

        await conn.reply(
          m.chat,
          `✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩\n¡Se han Casado! ฅ^•ﻌ•^ฅ*:･ﾟ✧\n\n*•.¸♡ Esposo/a @${sender.split('@')[0]} ♡¸.•*\n*•.¸♡ Esposo/a @${target.split('@')[0]}\n\n\`Disfruten de su luna de miel\`\n\n✩.･:｡≻───── ⋆♡⋆ ─────.•:｡✩`,
          m,
          { mentions: [sender, target] }
        );
      } else {
        proposals[sender] = target;

        let display = m.mentionedJid && m.mentionedJid[0] ? m.mentionedJid[0] : (m.fromMe ? conn.user.jid : m.sender);

        await conn.reply(
          m.chat,
          `♡ @${display.split('@')[0]}, @${sender.split('@')[0]} te ha propuesto matrimonio, ¿aceptas?\n> ✐ Aceptar » *${usedPrefix}${command}*`,
          m,
          { mentions: [sender, display] }
        );
      }
      break;
    }

    case isDivorce: {
      let sender = m.sender;

      if (!marriages[sender]) {
        await m.reply('✧ Tú no estás casado/a con nadie.');
        return;
      }

      let partner = marriages[sender];

      delete marriages[sender];
      delete marriages[partner];
      saveMarriages(marriages);

      let senderName = conn.getName(sender);
      let partnerName = conn.getName(partner);

      global.db.data.users[sender].marry = '';
      global.db.data.users[partner].marry = '';

      await conn.reply(
        m.chat,
        `✐ @${sender.split('@')[0]} y @${partner.split('@')[0]} se han divorciado.`,
        m,
        { mentions: [sender, partner] }
      );
      break;
    }
  }
};

handler.help = ['marry', 'divorce', 'divorciarse'];
handler.tags = ['rg'];
handler.command = ['marry', 'divorce'];
handler.group = true;
handler.register = true;

export default handler;