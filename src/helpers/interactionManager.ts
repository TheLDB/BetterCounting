// * 3rd Party Libs
import { Client, EmbedBuilder } from "discord.js";
import { doesChannelExist } from "./doesChannelExist";
import { PrismaClient } from "@prisma/client";
const interactionManager = async (client: Client) => {
	const prisma = new PrismaClient();
	client.on("interactionCreate", async (interaction) => {
		if (!interaction.isCommand()) return;

		const { commandName, options } = interaction;

		if (commandName === "register") {
			const channel = options.get("channel"); // * Get values for the channel (of type DiscordJS Channel)
			const increment = options.get("increment");
			console.log(increment);
			if (channel && channel.value && interaction.memberPermissions?.has("Administrator")) {
				// * Check if it exists in Supabase already
				const doesExist = await doesChannelExist(channel.value.toString());
				if (!doesExist) {
					// * Create new channel
					const newChannel = await prisma.countStatus.create({
						data: {
							channelID: channel.value.toString(),
							serverID: interaction.guildId!,
							currentNum: 0,
							highestStreak: 0,
							increment: increment ? Number(increment.value) : 1,
							createdOn: new Date(),
							updatedOn: new Date(),
						},
					});

					if (newChannel) {
						interaction.reply({
							content: `Alright! We're now counting in <#${channel.value.toString()}>!`,
							ephemeral: false,
						});
					}
				} else {
					interaction.reply({
						content: `Looks like <#${channel.value.toString()}> is already registered!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
						ephemeral: true,
					});
				}
			} else {
				interaction.reply({
					content: `Uh oh! Looks like you lack the permissions to perform this action!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
					ephemeral: true,
				});
			}
		} else if (commandName === "updateincrement") {
			const channel = options.get("channel");
			const increment = options.get("increment");
			if (channel && channel.value && interaction.memberPermissions?.has("Administrator")) {
				// * Ensure channel is present in Supabase/registered
				const doesExist = await doesChannelExist(channel.value.toString());
				if (doesExist) {
					const updatedIncrement = await prisma.countStatus.update({
						where: {
							channelID: channel.value.toString(),
						},
						data: {
							increment: Number(increment?.value),
						},
					});

					if (updatedIncrement) {
						interaction.reply({
							content: `Done! The increment in <#${channel.value.toString()}> is now ${increment?.value?.toString()}!`,
							ephemeral: false,
						});
					} else {
						interaction.reply({
							content: `Looks like something went wrong.. uh oh.`,
							ephemeral: false,
						});
					}
				} else {
					interaction.reply({
						content: `Uh oh! Looks like the channel <#${channel.value.toString()}> isn't registered yet.\nYou can register it using the /register command\n\nIf you think this is a bug, DM me on discord: lndn#4096`,
						ephemeral: true,
					});
				}
			}

		} else if (commandName === "leaderboard") {
			const channel = options.get("channel");
			if (channel && channel.value) {
				// * Get leaderboard for specific channel

				// * Get every count submission for the channel
				const channelInputs = await prisma.countSubmissions.findMany({
					where: {
						channelID: channel.value.toString(),
					},
				});

				// * Create an array of users and their scores, add them all up based on the submission, then sort them
                
				let userIDArr: string[] = [];
				let scoreArr: number[] = [];
				let leaderboardObjects: { name: string; value: number }[] = [];
        
				channelInputs.forEach((submission) => {
					const findUserID = userIDArr.find((id) => id === submission.userID);

					if (findUserID && submission.wasCorrect) {

						const indexOfUID = userIDArr.indexOf(submission.userID);
						scoreArr[indexOfUID] += 1;

					} else if (findUserID && !submission.wasCorrect) {

						const indexofUID = userIDArr.indexOf(submission.userID);
						scoreArr[indexofUID] -= 5;

					} else if (submission.wasCorrect) {

						userIDArr.push(submission.userID);
						scoreArr.push(1);

					} else if (!submission.wasCorrect) {

						userIDArr.push(submission.userID);
						scoreArr.push(-5);
                        
					} else {
						console.log("uhhhhhhhhh");
					}
				});

                // * Push all array data to an array of objects
				userIDArr.forEach((id, index) => {
					leaderboardObjects.push({
						name: `${userIDArr[index]}`,
						value: scoreArr[index],
					});
				});

                // * Sort all objects in descending order
                leaderboardObjects.sort((a, b) => {
                    return b.value - a.value;
                });

                // * Build embed
				const leaderboardEmbed = new EmbedBuilder()
					.setColor("Green")
					.setTitle("✨ Counting Leaderboard")
					.setDescription(`🔻 Leaderboard for <#${interaction.channelId}>`)
					.setFooter({
						text: `Stats as of ${new Date().toISOString()}`,
					});

                    // * Append items to description
                        // * Dynamic text like refrencing a channel cant be done in fields so description is best
				leaderboardObjects.forEach((obj, index) => {
					if (index < 9) {
						leaderboardEmbed.setDescription(`${leaderboardEmbed.data.description}\n\n<@${leaderboardObjects[index].name}> - \`\`${leaderboardObjects[index].value}\`\``);
					}
				});

				interaction.reply({
					embeds: [leaderboardEmbed],
				});

			} else {
				// * Get leaderboard for entire server
                const serverInputs = await prisma.countSubmissions.findMany({
                    where: {
                        serverID: interaction.guildId?.toString()
                    }
                });

                // * Create an array of users and their scores, add them all up based on the submission, then sort them

                // * Keep track of userID and score in two different arrays, and push them at the same time, index's will stay consistent throughout
                    // * is there a better way of doing this?
				let userIDArr: string[] = [];
				let scoreArr: number[] = [];
				let leaderboardObjects: { name: string; value: number }[] = [];
				serverInputs.forEach((submission) => {
					const findUserID = userIDArr.find((id) => id === submission.userID);
					if (findUserID && submission.wasCorrect) {
						const indexOfUID = userIDArr.indexOf(submission.userID);
						scoreArr[indexOfUID] += 1;
					} else if (findUserID && !submission.wasCorrect) {
						const indexofUID = userIDArr.indexOf(submission.userID);
						scoreArr[indexofUID] -= 5;
					} else if (submission.wasCorrect) {
						userIDArr.push(submission.userID);
						scoreArr.push(1);
					} else if (!submission.wasCorrect) {
						userIDArr.push(submission.userID);
						scoreArr.push(-5);
					} else {
						console.log("uhhhhhhhhh");
					}
				});

                // * Build the array of objects
                userIDArr.forEach((id, index) => {
					leaderboardObjects.push({
						name: `${userIDArr[index]}`,
						value: scoreArr[index],
					});
				});

                // * Sort in descending 
                leaderboardObjects.sort((a, b) => {
                    return b.value - a.value;
                });

                // * Build the embed
				const leaderboardEmbed = new EmbedBuilder()
					.setColor("Green")
					.setTitle("✨ Counting Leaderboard")
					.setDescription(`🔻 Leaderboard for the entire server`)
					.setFooter({
						text: `Stats as of ${new Date().toISOString()}`,
					});

				leaderboardObjects.forEach((obj, index) => {
					if (index < 9) {
						leaderboardEmbed.setDescription(`${leaderboardEmbed.data.description}\n\n<@${leaderboardObjects[index].name}> - \`\`${leaderboardObjects[index].value}\`\``);
					}
				});

				interaction.reply({
					embeds: [leaderboardEmbed],
				});

			}
		} else if (commandName === "delete") {
			const channel = options.get("channel"); // * Get values for the channel (of type DiscordJS Channel)
			if (channel && channel.value && interaction.memberPermissions?.has("Administrator")) {
				// * Check if it exists in Supabase already
				const doesExist = await doesChannelExist(channel.value.toString());
				if (doesExist) {
					// * Delete it
					const deletedChannel = await prisma.countStatus.delete({
						where: {
							channelID: channel.value.toString(),
						},
					});

					if (deletedChannel) {
						interaction.reply({
							content: `Done! I'm no longer counting in <#${channel.value.toString()}>!`,
							ephemeral: false,
						});
					}
				} else {
					interaction.reply({
						content: `Looks like <#${channel.value.toString()}> isn't registered!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
						ephemeral: true,
					});
				}
			} else {
				interaction.reply({
					content: `Uh oh! Looks like you lack the permissions to perform this action!\n\nIf you think this is a bug, please message me on Discord: lndn#4096`,
					ephemeral: true,
				});
			}
		}
	});
};

export { interactionManager };
