const mineflayer = require('mineflayer') // eslint-disable-line

/**
 * @param {mineflayer.Bot} bot // to enable intellisense
 */

module.exports = bot => {
  bot.on('login', () => {
    const LO_USERNAME_REGEX = '(?:\\(.{1,15}\\)|\\[.{1,15}\\]|.){0,10}?(\\w+)'
    const LO_CHAT_REGEX = new RegExp(`^${LO_USERNAME_REGEX}\\s?[>:\\-»\\]\\)~]+\\s(.*)$`)
    bot.addChatPattern('lo', LO_CHAT_REGEX, { parse: true })

    // Replace the verify and sign message funcs
    bot._client.verifyMessage = (publicKey, packet) => false
    bot._client.signMessage = (message, timestamp, salt = 0) => Buffer.alloc(0)
  })

  bot.on('chat:lo', (matches) => {
    // Make sure its a real player
    if (bot.players[matches[0][0]]?.uuid == null) return

    bot.emit('handleChat', matches[0][0], matches[0][1], (response) => bot.chat(response))
  })

  bot.on('whisper', (username, message) => {
    // Make sure its a real player
    if (bot.players[username]?.uuid == null) return

    // bot.whisper is broken hence this mess
    bot.emit('handleChat', username, message, (response) => {
      const timestamp = BigInt(Date.now())
      bot._client.write('chat_command', {
        command: `msg ${username} ${response}`,
        timestamp,
        salt: 0n,
        argumentSignatures: [],
        signedPreview: false,
        previousMessages: []
      })
    })
  })

  bot.on('chat:chat', (username, message) => {
    if (username === bot.username) return

    // Make sure its a real player
    if (bot.players[username]?.uuid == null) return

    bot.emit('handleChat', username, message, (response) => bot.chat(response))
  })
}
