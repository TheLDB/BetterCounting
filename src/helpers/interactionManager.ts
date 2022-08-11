// * 3rd Party Libs
import { Client, GuildMember } from "discord.js";
import { doesChannelExist } from "./doesChannelExist";
import { PrismaClient } from "@prisma/client";
const interactionManager = async (client: Client) => {
    const prisma = new PrismaClient();
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isCommand()) return;

        const { commandName, options } = interaction;

        if(commandName === "register") {
            const channel = options.get("channel"); // * Get values for the channel (of type DiscordJS Channel)
            if(channel && channel.value && interaction.memberPermissions?.has("Administrator")) {
                // * Check if it exists in Supabase already
                const doesExist = await doesChannelExist(channel.value.toString());
                if(!doesExist) {
                    // * Create new channel
                    const newChannel = await prisma.countStatus.create({
                        data: {
                            channelID: channel.value.toString(),
                            serverID: interaction.guildId!,
                            currentNum: 0,
                            highestStreak: 0,
                            createdOn: new Date(),
                            updatedOn: new Date()
                        }
                    });

                    if(newChannel) {
                        interaction.reply({
                            content: `Alright! We're now counting in <#${channel.value.toString()}>!`,
                            ephemeral: false
                        })
                    }
                }
                else {
                    interaction.reply({
                        content: `Looks like <#${channel.value.toString()}> is already registered!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
                        ephemeral: true
                    })
                }
            }
            else {
                interaction.reply({
                    content: `Uh oh! Looks like you lack the permissions to perform this action!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
                    ephemeral: true
                })
            }
        }
        if(commandName === "delete") {
            const channel = options.get("channel"); // * Get values for the channel (of type DiscordJS Channel)
            if(channel && channel.value && interaction.memberPermissions?.has("Administrator")) {
                // * Check if it exists in Supabase already
                const doesExist = await doesChannelExist(channel.value.toString());
                if(doesExist) {
                    // * Delete it
                    const deletedChannel = await prisma.countStatus.delete({
                        where: {
                            channelID: channel.value.toString()
                        }
                    });

                    if(deletedChannel) {
                        interaction.reply({
                            content: `Done! I'm no longer counting in <#${channel.value.toString()}>!`,
                            ephemeral: false
                        })
                    }
                }
                else {
                    interaction.reply({
                        content: `Looks like <#${channel.value.toString()}> isn't registered!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
                        ephemeral: true
                    })
                }
            }
            else {
                interaction.reply({
                    content: `Uh oh! Looks like you lack the permissions to perform this action!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
                    ephemeral: true
                })
            }
        }
    })
}

export { interactionManager };