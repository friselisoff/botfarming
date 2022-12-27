const mineflayer = require('mineflayer') // eslint-disable-line

const { GoalGetToBlock } = require('mineflayer-pathfinder').goals

/**
 * @param {mineflayer.Bot} bot // to enable intellisense
 */
module.exports = bot => {
    // Simple command to let people know we are a bot
    bot.on('handleChat', async (username, message, reply) => {
        let args = message.split(" ");
        let command = args.shift();
        if (command == '!bot') reply('[iambot]');
        if (command == "!come" && username == "friselis") {
            for (let p in bot.players) {
                if (p != username) continue;
                let player = bot.players[p];
                if (!player.entity) return console.log("cant find entity");
                bot.pathfinder.goto(new GoalGetToBlock(player.entity.position.x, player.entity.position.y, player.entity.position.z))
            }
        }
        if (command == "!drop" && username == "friselis") {
            let items = bot.inventory.itemsRange(9, 45).length;
            while (bot.inventory.itemsRange(9, 45).length >= 1) {
                for (let item in bot.inventory.itemsRange(9, 45)) {
                    await bot.tossStack(bot.inventory.itemsRange(9, 45)[item]).catch(() => {});
                }
            }
            reply("dropped " + items + " stack");
        }
        if (command == "!reset" && username == "friselis") {
            bot.isFarming = false;
        }
        if (command == "!status" && username == "friselis") {
            reply((35-bot.inventory.emptySlotCount() / 35).toFixed(1) + "% full");
        }
    })
}
