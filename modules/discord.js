const mineflayer = require('mineflayer') // eslint-disable-line
const { Client, GatewayIntentBits } = require('discord.js');

/**
 * @param {mineflayer.Bot} bot // to enable intellisense
 */
module.exports = bot => {
    bot.on("spawn", () => {
        const client = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages, GatewayIntentBits.MessageContent] });
        client.on('ready', () => {
            console.log(`Logged in as ${client.user.tag}!`);
        });

        let handleChat = async (username, message) => {
            let channel = client.channels.cache.get("1050796217409486909");
            channel.send(`<${username}> ${message}`);
        };
        client.on("messageCreate", (message) => {
            if (message.channelId != "1050796217409486909" || message.author.bot) return;
            if (message.content.includes("§")) return;
            bot.chat(`${message.author.tag}: ${message.content}`)
        });
        bot.on('handleChat', (username, message, reply) => {
            if (username == "Avalon_Guard") return;
            handleChat(username, message);
        });

        bot.on('message', (message, position, sender) => {
            let blackList = ["Welcome to the LiveOverflow 1.19.2 Demo Server", "You reach the end of Demo!"];
            if (position !== 'system' || blackList.includes(message)) return;
            if (message == "Welcome to the LiveOverflow 1.19.2 Demo Server" || message == "You reach the end of Demo!") return;
            if (message.startsWith("N00bBot") && message.endsWith("the game")) return;
            handleChat(position, message);
        });

        setInterval(async () => {
            let channelArea = client.channels.cache.get("1051596800571736074");
            if (!channelArea || !channelArea.isTextBased()) return;
            let message = (await channelArea.messages.fetch({ limit: 1, after: "0" })).at(0)
            const playerList = Object.keys(bot.players).map(e => {
                if (bot.players[e]?.entity) {
                    return e;
                }
                return null
            }).filter(e => e != null);
            if (playerList.length >= 1) {
                await message.edit(playerList.join("\n"));
            } else {
                await message.edit("None");
            }
        }, 2000);

        client.login("MTA1MDc2NzEyMTU2MDM4MzUwOQ.GP9qIM.1r5uZwYnIvsittdHXmZggcBy_d-74bkhPkTyUc");
    });
}
