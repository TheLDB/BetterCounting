import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
const onMessage = (client: Client): void => {
    const prisma = new PrismaClient();
    client.on("messageCreate", async (message) => {
        if(message.author.bot) return;

        // * Get channel ID
        const channelID = message.channelId;

        // * Check if channelID is registered in Supabase

        // ! This is very very slow.... how do we fix it?
        let channelExists = await prisma.countStatus.findUnique({
            where: {
                channelID
            }
        });

        // * If the channel is a counting channel, and the message content can be converted into a number
        if(channelExists && !Number.isNaN(Number(message.content))) {
            const sentNumber = Number(message.content);
            if(sentNumber - Number(channelExists.currentNum) === 1) {
                // * Number is 1 higher, increment and react
                if(sentNumber > Number(channelExists.highestStreak)) {
                    // * If it's a new high streak, update the score
                    await prisma.countStatus.update({
                        where: {
                            channelID
                        },
                        data: {
                            currentNum: sentNumber,
                            highestStreak: sentNumber,
                        }
                    })
                }
                else {
                    // * Else, just update the currentNum
                    await prisma.countStatus.update({
                        where: {
                            channelID
                        },
                        data: {
                            currentNum: sentNumber
                        }
                    });
                }
                
                message.react('✅')
            }
            else {
                // * Number is wrong, set counter to 0 and react with an X
                await prisma.countStatus.update({
                    where: {
                        channelID
                    },
                    data: {
                        currentNum: 0
                    }
                });

                message.react('❌')
            }
        }
        
    })
}

export { onMessage }