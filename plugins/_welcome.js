import { WAMessageStubType } from '@whiskeysockets/baileys';
import fetch from 'node-fetch';

export async function before(m, { conn, participants, groupMetadata }) {
  if (!m.isGroup || !m.messageStubType) return true;

  const stubParams = m.messageStubParameters || [];
  if (!Array.isArray(stubParams) || stubParams.length === 0) return true;

  let chat = global.db.data.chats[m.chat] || {};
  if (typeof chat.welcome === 'undefined') chat.welcome = true;

  if (!chat.welcome) return true;

  const userJid = stubParams[0];
  const username = userJid.split('@')[0];
  const mention = '@' + username;

  const memberCount = groupMetadata.participants?.length || 0;

  let avatar;
  try {
    avatar = await conn.profilePictureUrl(userJid, 'image');
  } catch {
    avatar = 'https://i.imgur.com/8B4QYQY.png';
  }

  const guildName = encodeURIComponent(groupMetadata.subject);
  const apiBase = "https://api.siputzx.my.id/api/canvas";
  const backgroundUrl = encodeURIComponent('https://files.catbox.moe/w1r8jh.jpeg');

  async function fetchImage(url) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('La API de imágenes falló');
      return await res.buffer();
    } catch (e) {
      console.error(e);
      const fallbackRes = await fetch(avatar);
      return await fallbackRes.buffer();
    }
  }

   if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_ADD || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_INVITE) {
    const defaultWelcome = `‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎ ‎˙      .   ˙     .           ˙   ˙      .   ˙     .           ˙   
ㅤׄㅤㅤׅ  ㅤׄㅤ⋱ㅤㅤ⁝ㅤㅤ⋰ㅤׄㅤㅤׅㅤㅤׄ
        ‎ ‎ ‎ ‎ ‎࿙͜࿚࿙͜࿚࿙࿚  ⃙🪼ᩙꫬ̸̷  ࿙࿚͜࿙࿚͜࿙࿚
๑  ⃚⃞💛ᩚ̰̆ ꧇ ʜᴏʟᴀ, ${mention}, bienvenido a ${groupMetadata.subject}  sᴏʏ *Ruby Hoshino,* ʟᴀ ʙᴏᴛ 𝖽𝖾 𝖾𝗌𝗍𝖺 𝗅𝗂𝗇𝖽𝖺 𝖼𝗈𝗆𝗎𝗇𝗂𝖽𝖺𝖽. ᴇ𝗌𝗉𝖾𝗋𝗈 𝗉𝗈𝖽𝖾𝗋 𝗅𝗅𝖾𝗏𝖺𝗋𝗆𝖾 𝗆𝗎𝗒 𝖻𝗂𝖾𝗇 𝖼𝗈𝗇𝗍𝗂𝗀𝗈 𝗒 𝗉𝗈𝖽𝖾𝗋 𝖼𝗋𝖾𝖺𝗋 𝗎𝗇𝖺 𝖻𝗎𝖾𝗇𝖺 𝗒 𝖽𝗎𝗋𝖺𝖽𝖾𝗋𝖺 𝖺𝗆𝗂𝗌𝗍𝖺𝖽.

๑  ⃚⃞💛ᩚ̰̆ ꧇ ɴ𝗈 𝗈𝗅𝗏𝗂𝖽𝖾𝗌 𝗉𝖺𝗌𝖺𝗋 𝗉𝗈𝗋 𝗅𝖺𝗌 𝗋𝖾𝗀𝗅𝖺𝗌! ʀᴇ𝖼𝗎𝖾𝗋𝖽𝖺 𝗊𝗎𝖾 𝗌𝗈𝗇 𝗂𝗆𝗉𝗈𝗋𝗍𝖺𝗇𝗍𝖾𝗌 𝗉𝖺𝗋𝖺 𝗎𝗇𝖺 𝖻𝗎𝖾𝗇𝖺 𝗒 𝗌𝖺𝗇𝖺 𝖼𝗈𝗇𝗏𝗂𝗏𝖾𝗇𝖼𝗂𝖺.

๑  ⃚⃞💛ᩚ̰̆ ꧇ ʙ𝗎𝖾𝗇𝗈, 𝖾𝗌𝗈 𝗌𝖾𝗋𝗂́𝖺 𝗍𝗈𝖽𝗈 𝖽𝖾 𝗆𝗂 𝗉𝖺𝗋𝗍𝖾, 𝖾𝗌𝗉𝖾𝗋𝗈 𝗍𝗎 𝖾𝗌𝗍𝖺𝖽𝗂́𝖺 𝗌𝖾𝖺 𝗅𝖺𝗋𝗀𝖺 𝗒 𝖽𝗎𝗋𝖺𝖽𝖾𝗋𝖺 𝖺𝗊𝗎𝗂́. 

━━━━━━━━━━━━━━━━━━━━━━━
> 𝙚𝙙𝙞𝙩𝙖 𝙡𝙖 𝙗𝙞𝙚𝙣𝙫𝙚𝙣𝙞𝙙𝙖 𝙘𝙤𝙣 𝙚𝙡 𝙘𝙤𝙢𝙖𝙣𝙙𝙤́ 
> #setwelcome
━━━━━━━━━━━━━━━━━━━━━━━
                  ──   ̨̽🪼⃚̶ ִ   ׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄׄ`;
    
    const welcomeText = (chat.welcomeText || defaultWelcome)
      .replace('@user', mention)
      .replace('@subject', groupMetadata.subject)
      .replace('@desc', groupMetadata.desc?.toString() || 'Sin descripción');
    
    const welcomeApiUrl = `${apiBase}/welcomev2?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${encodeURIComponent(avatar)}&background=${backgroundUrl}`;
    let imgBuffer = await fetchImage(welcomeApiUrl);

    await conn.sendMessage(m.chat, { image: imgBuffer, caption: welcomeText, mentions: [userJid] });
  } 
  else if (m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_LEAVE || m.messageStubType === WAMessageStubType.GROUP_PARTICIPANT_REMOVE) {
    const defaultBye = `❀ *Adiós, ${mention}* 👋\n\nEsperamos que vuelvas pronto a ${groupMetadata.subject}.\n\n✦ Ahora quedamos ${memberCount} miembros.`;
    
    const byeText = (chat.byeText || defaultBye)
      .replace('@user', mention)
      .replace('@subject', groupMetadata.subject);

    const goodbyeApiUrl = `${apiBase}/goodbyev2?username=${username}&guildName=${guildName}&memberCount=${memberCount}&avatar=${encodeURIComponent(avatar)}&background=${backgroundUrl}`;
    let imgBuffer = await fetchImage(goodbyeApiUrl);
    
    await conn.sendMessage(m.chat, { image: imgBuffer, caption: byeText, mentions: [userJid] });
  }

  return true;
}
