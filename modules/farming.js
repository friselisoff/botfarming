const mineflayer = require('mineflayer'); // eslint-disable-line
const { Vec3 } = require('vec3');
const { GoalGetToBlock } = require('mineflayer-pathfinder').goals;
const mcData = require('minecraft-data')("1.19.2");
/**
 * @param {mineflayer.Bot} bot // to enable intellisense
 */
module.exports = bot => {
    let matchingSeed = {
        wheat: "wheat_seeds",
        beetroots: "beetroot_seeds",
        carrots: "carrot",
        potatoes: "potato",
    }
    let goSearchItem = [
        "potato",
        "poisonous_potato",
        "carrot",
        "beetroot",
        "beetroot_seeds",
        "wheat_seeds",
        "wheat",
    ]
    bot.isFarming = false;
    bot.on("spawn", () => {
        let resetLoop = () => {
            bot.isFarming = false;
        }
        setInterval(async () => {
            if (bot.isFarming) return;
            bot.isFarming = true;
            if (bot.inventory.emptySlotCount() <= 1) {
                let chestPos = new Vec3(-44571, 68, 63551);
                await bot.pathfinder.goto(new GoalGetToBlock(chestPos.x, chestPos.y, chestPos.z)).catch(console.error);
                let blockchest = bot.blockAt(chestPos);
                let chest = await bot.openChest(blockchest);
                let toStore = [];
                for (let i in bot.inventory.items()) {
                    let item = bot.inventory.items()[i];
                    if (!toStore.includes(item.type)) {
                        toStore.push(item.type);
                    }
                }
                for (let t in toStore) {
                    let type = toStore[t];
                    let count = bot.inventory.count(type);
                    if (Object.values(matchingSeed).includes(mcData.items[type].name)) {
                        if (count > 64) {
                            await chest.deposit(type, null, count - 64).catch(console.error);
                        }
                    } else {
                        await chest.deposit(type, null, count).catch(console.error);
                    }
                }
                console.log(bot.inventory.items());
                chest.close();
                resetLoop();
                return;
            }
            for (let ent in bot.entities) {
                let entity = bot.entities[ent];
                if (entity.name == "item" && entity.onGround && entity.metadata[entity.metadata.length - 1]?.itemId && goSearchItem.includes(mcData.items[entity.metadata[entity.metadata.length - 1].itemId].name)) {
                    await bot.pathfinder.goto(new GoalGetToBlock(entity.position.x, entity.position.y, entity.position.z)).catch(console.error);
                    let pos = entity.position.clone();
                    pos.y = bot.entity.position.y
                    bot.entity.position = pos;
                    resetLoop();
                    return;
                }
            }
            let blockToHarvest = bot.findBlock({
                count: 4000,
                maxDistance: 60,
                matching: block => ((Object.keys(matchingSeed).includes(block.name) && block._properties.age == 7) || (block.name == "beetroots" && block._properties.age == 3)),
            });
            if (!blockToHarvest) {
                resetLoop();
                return;
            };
            await bot.pathfinder.goto(new GoalGetToBlock(blockToHarvest.position.x, blockToHarvest.position.y, blockToHarvest.position.z)).catch(console.error);
            await bot.dig(blockToHarvest);
            if (bot.inventory.count(mcData.itemsByName[matchingSeed[blockToHarvest.name]].id) >= 1) {
                await bot.equip(mcData.itemsByName[matchingSeed[blockToHarvest.name]].id);
                await bot.placeBlock(bot.blockAt(blockToHarvest.position), new Vec3(0, 1, 0)).catch(console.error);
            }
            resetLoop();
        }, 300);
    });
}
