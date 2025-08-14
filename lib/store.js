import { readFileSync, writeFileSync, existsSync } from 'fs';

// Importa las funciones necesarias de Baileys
const { initAuthCreds, BufferJSON, proto } = (await import('@whiskeysockets/baileys')).default;

/**
 * Vincula los eventos de la conexión de Baileys para mantener un registro
 * en memoria de los chats, contactos y metadatos de grupos.
 * @param {import('@whiskeysockets/baileys').WASocket} conn - La instancia del socket de Baileys.
 */
function bind(conn) {
  // Asegura que el objeto de chats exista en la conexión
  if (!conn.chats) conn.chats = {};

  /**
   * Actualiza la información de los contactos (nombres, etc.) en el registro de chats.
   * @param {Array<import('@whiskeysockets/baileys').Contact>} contacts - Lista de contactos a actualizar.
   */
  function updateNameToDb(contacts) {
    if (!contacts) return;
    try {
      contacts = contacts.contacts || contacts;
      for (const contact of contacts) {
        const id = conn.decodeJid(contact.id);
        if (!id || id === 'status@broadcast') continue;
        
        let chat = conn.chats[id];
        if (!chat) {
            chat = conn.chats[id] = { ...contact, id };
        }
        
        const isGroup = id.endsWith('@g.us');
        conn.chats[id] = {
          ...chat,
          ...contact,
          id,
          ...(isGroup ? 
            { subject: contact.subject || contact.name || chat.subject || '' } :
            { name: contact.notify || contact.name || chat.name || chat.notify || '' }
          )
        };
      }
    } catch (e) {
      console.error('Error actualizando nombres en la base de datos:', e);
    }
  }

  // Escucha los eventos de Baileys para mantener los datos actualizados
  conn.ev.on('contacts.upsert', updateNameToDb);
  conn.ev.on('groups.update', updateNameToDb);
  conn.ev.on('contacts.set', updateNameToDb);

  conn.ev.on('chats.set', async ({ chats: newChats }) => {
    try {
      for (const { id, name, readOnly } of newChats) {
        const jid = conn.decodeJid(id);
        if (!jid || jid === 'status@broadcast') continue;
        
        const isGroup = jid.endsWith('@g.us');
        let chat = conn.chats[jid];
        if (!chat) {
            chat = conn.chats[jid] = { id: jid };
        }

        chat.isChats = !readOnly;
        if (name) chat[isGroup ? 'subject' : 'name'] = name;
        
        if (isGroup) {
          const metadata = await conn.groupMetadata(jid).catch(() => null);
          if (metadata) {
            chat.subject = metadata.subject;
            chat.metadata = metadata;
          }
        }
      }
    } catch (e) {
      console.error('Error en chats.set:', e);
    }
  });

  conn.ev.on('group-participants.update', async ({ id, participants, action }) => {
    if (!id) return;
    const jid = conn.decodeJid(id);
    if (jid === 'status@broadcast') return;
    
    if (!conn.chats[jid]) conn.chats[jid] = { id: jid };
    
    const chat = conn.chats[jid];
    chat.isChats = true;
    
    const metadata = await conn.groupMetadata(jid).catch(() => null);
    if (metadata) {
      chat.subject = metadata.subject;
      chat.metadata = metadata;
    }
  });

  conn.ev.on('chats.upsert', (newChats) => {
    try {
      for (const chat of newChats) {
        const id = conn.decodeJid(chat.id);
        if (!id || id === 'status@broadcast') continue;
        
        conn.chats[id] = { ...(conn.chats[id] || {}), ...chat, isChats: true };
        
        if (id.endsWith('@g.us')) {
            conn.insertAllGroup?.().catch(() => null);
        }
      }
    } catch (e) {
      console.error('Error en chats.upsert:', e);
    }
  });
}

// Mapea los tipos de claves de Baileys a los nombres de propiedad en el archivo de sesión.
// La clave 'session' es la correcta para la mayoría de las versiones de Baileys.
const KEY_MAP = {
  'pre-key': 'preKeys',
  'session': 'sessions',
  'sender-key': 'senderKeys',
  'app-state-sync-key': 'appStateSyncKeys',
  'app-state-sync-version': 'appStateVersions',
  'sender-key-memory': 'senderKeyMemory'
};

/**
 * Crea y gestiona el estado de autenticación guardándolo en un único archivo JSON.
 * @param {string} filename - La ruta del archivo donde se guardará la sesión.
 * @param {import('pino').Logger} logger - El logger para registrar información.
 * @returns {{ state: import('@whiskeysockets/baileys').AuthenticationState, saveState: () => void }}
 */
function useSingleFileAuthState(filename, logger) {
  let creds, keys = {}, saveCount = 0;

  // Función para guardar el estado de autenticación en el archivo.
  const saveState = (forceSave) => {
    logger?.trace('Guardando estado de autenticación...');
    saveCount++;
    if (forceSave || saveCount > 5) {
      writeFileSync(
        filename,
        JSON.stringify({ creds, keys }, BufferJSON.replacer, 2)
      );
      saveCount = 0;
    }
  };

  // Carga el estado desde el archivo si existe, si no, crea uno nuevo.
  if (existsSync(filename)) {
    const result = JSON.parse(
      readFileSync(filename, { encoding: 'utf-8' }),
      BufferJSON.reviver
    );
    creds = result.creds;
    keys = result.keys;
  } else {
    creds = initAuthCreds();
    keys = {};
  }

  return {
    state: {
      creds,
      keys: {
        get: (type, ids) => {
          const key = KEY_MAP[type];
          return ids.reduce((dict, id) => {
            let value = keys[key]?.[id];
            if (value) {
              if (type === 'app-state-sync-key') {
                value = proto.AppStateSyncKeyData.fromObject(value);
              }
              dict[id] = value;
            }
            return dict;
          }, {});
        },
        set: (data) => {
          for (const _key in data) {
            const key = KEY_MAP[_key];
            keys[key] = keys[key] || {};
            Object.assign(keys[key], data[_key]);
          }
          saveState();
        }
      }
    },
    saveState
  };
}

// Exporta las funciones para que puedan ser usadas en otros archivos de tu bot.
export default {
  bind,
  useSingleFileAuthState
};
