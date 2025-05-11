import db from '../lib/database.js'
import fs from 'fs'
import PhoneNumber from 'awesome-phonenumber'
import { createHash } from 'crypto'
import fetch from 'node-fetch'
import moment from 'moment-timezone'

const Reg = /\|?(.*)([.|] *?)([0-9]*)$/i

let handler = async function (m, { conn, text, usedPrefix, command }) {
  const who = m.mentionedJid?.[0] || (m.fromMe ? conn.user.jid : m.sender)
  const mentionedJid = [who]

  const pp = await conn.profilePictureUrl(who, 'image').catch(() => 'https://files.catbox.moe/xr2m6u.jpg')
  const user = global.db.data.users[m.sender]
  const name2 = conn.getName(m.sender)

  if (user.registered) {
    return m.reply(`✦.── Ya estás Registrado ──.✦\n\n¿Deseas volver a registrarte?\nUtiliza *${usedPrefix}unreg* para borrar tu registro.`)
  }

  if (!Reg.test(text)) {
    return m.reply(`✦.── Formato Incorrecto ──.✦\n\nUso correcto:\n*${usedPrefix + command} nombre.edad*\nEjemplo:\n*${usedPrefix + command} ${name2}.18*`)
  }

  let [_, name, __, age] = text.match(Reg)
  if (!name) return m.reply('✦.── Error ──.✦\n\n𔖲𔖮𔖭 El nombre no puede estar vacío.')
  if (!age) return m.reply('✦.── Error ──.✦\n\n𔖲𔖮𔖭 La edad no puede estar vacía.')
  if (name.length >= 100) return m.reply('✦.── Nombre muy largo ──.✦\n\n𔖲𔖮𔖭 El nombre no debe tener más de 100 caracteres.')

  age = parseInt(age)
  if (age > 1000) return m.reply('✦.── Edad demasiado alta ──.✦\n\n𔖲𔖮𔖭 Wow, el abuelo quiere jugar con el bot.')
  if (age < 5) return m.reply('✦.── Edad muy baja ──.✦\n\n𔖲𔖮𔖭 ¿Un bebé programando bots?')

  // Registro
  user.name = `${name}✓`.trim()
  user.age = age
  user.regTime = +new Date()
  user.registered = true

  user.coin += 46
  user.exp += 310
  user.joincount += 25

  const sn = createHash('md5').update(m.sender).digest('hex').slice(0, 20)

  const regbot = `
✦.──  Registro Completado ──.✦

𔖲𔖮𔖭 *Nombre* : ${name}
𔖲𔖮𔖭 *Edad* : ${age} años
𔖲𔖮𔖭 *ID* : ${sn}

⭑ ⭒ Recompensas Iniciales ⭒ ⭑
𓆩 ⛁ Monedas : +46
𓆩 ✰ Experiencia : +310
𓆩 ❖ Tokens : +25

✧ *Verifica tu registro aca*! ✧
➤ https://chat.whatsapp.com/GHhOeix2sTY32wIO85pNgd
`.trim()

  await m.react('📩')

  await conn.sendMessage(m.chat, {
    text: regbot,
    contextInfo: {
      externalAdReply: {
        title: '✧ Registro Completado ✧',
        body: 'Únete a la comunidad de Mai',
        thumbnailUrl: pp,
        sourceUrl: 'https://chat.whatsapp.com/GHhOeix2sTY32wIO85pNgd',
        mediaType: 1,
        showAdAttribution: true,
        renderLargerThumbnail: true
      }
    }
  }, { quoted: m })

  // Enviar notificación al grupo oficial
  const grupoNotificacion = '120363400775710652@newsletter' // Aquí se actualizó el ID
  const mensajeNotificacion = `
✦.──  Nuevo Registro ──.✦

𔖲𔖮𔖭 *Nombre* : ${name}
𔖲𔖮𔖭 *Edad* : ${age}
𔖲𔖮𔖭 *ID* : ${sn}

⭑ ⭒ Recompensas Otorgadas ⭒ ⭑
𓆩 ⛁ +46 monedas
𓆩 ✰ +310 experiencia
𓆩 ❖ +25 tokens

🕒 ${moment().format('YYYY-MM-DD HH:mm:ss')}
`.trim()

  try {
    if (global.conn?.sendMessage) {
      const ppGroup = await conn.profilePictureUrl(who, 'image').catch(() => null)
      await global.conn.sendMessage(grupoNotificacion, {
        image: { url: ppGroup || pp },
        caption: mensajeNotificacion
      })
    }
  } catch (e) {
    console.error('Error al enviar notificación al grupo:', e)
  }
}

handler.help = ['reg']
handler.tags = ['rg']
handler.command = ['verify', 'verificar', 'reg', 'register', 'registrar']

export default handler
