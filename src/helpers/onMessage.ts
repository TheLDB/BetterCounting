import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
import * as crypto from "crypto";
import { evaluate } from "mathjs";

const onMessage = (client: Client): void => {
	const prisma = new PrismaClient();

	client.on("messageCreate", async (message) => {
		if (message.author.bot) return;

		// * Get channel ID
		const channelID = message.channelId;

		// * Check if channelID is registered in Supabase

		console.time("countStatus")
		let channelExists = await prisma.countStatus.findMany({
			where: {
				channelID,
			},
		});
		console.timeEnd("countStatus")

		// * Get latest record for the channel to ensure that its not someone duplicating it
		console.time("countsubfind")
		const latestMessage = await prisma.countSubmissions.findFirst({
			where: {
				channelID,
			},
			orderBy: {
				createdOn: "desc",
			},
		});
		console.timeEnd("countsubfind");

		const determineEligibillity = async () => {
			if(latestMessage) {
				if (latestMessage.userID === message.author.id && latestMessage.wasCorrect) {
					return false;
				} else if (latestMessage.userID === message.author.id && !latestMessage.wasCorrect) {
					return true;
				}
			}
		};

		console.time("counter")

		const canSendMessage = await determineEligibillity();
		console.timeEnd("counter");

		// * If the channel is a counting channel, and the message content can be converted into a number
		if (channelExists && channelExists[0] && !Number.isNaN(Number(message.content))) {
			const sentNumber = Number(message.content);
			if (Math.round(100 * (sentNumber - Number(channelExists[0].currentNum))) / 100 === Number(channelExists[0].increment) && canSendMessage) {
				// * Number is correct, increment and react
				if (sentNumber > Number(channelExists[0].highestStreak)) {
					// * If it's a new high streak, update the score
					message.react("✅");
					message.react("🎉");

					await prisma.countStatus.update({
						where: {
							channelID,
						},
						data: {
							currentNum: sentNumber,
							highestStreak: sentNumber,
						},
					});

					await prisma.countSubmissions.create({
						data: {
							entryID: crypto.randomUUID(),
							userID: message.author.id,
							serverID: message.guildId ? message.guildId : "uhhh",
							channelID: message.channelId,
							wasCorrect: true,
							prevNum: channelExists[0].currentNum,
							submittedNum: sentNumber,
							wasNewHighScore: true,
							createdOn: new Date(),
						},
					});
				} else {
					// * Else, just update the currentNum
					message.react("✅");

					await prisma.countStatus.update({
						where: {
							channelID,
						},
						data: {
							currentNum: sentNumber,
						},
					});

					await prisma.countSubmissions.create({
						data: {
							entryID: crypto.randomUUID(),
							userID: message.author.id,
							serverID: message.guildId!,
							channelID: message.channelId,
							wasCorrect: true,
							prevNum: channelExists[0].currentNum,
							submittedNum: sentNumber,
							wasNewHighScore: false,
							createdOn: new Date(),
						},
					});
				}
				if (sentNumber === 13) {
					message.react("😈");
				} else if (sentNumber === 42) {
					message.react("🧬");
				} else if (sentNumber === 100) {
					message.react("💯");
				}
			} else if (Math.round(100 * (sentNumber - Number(channelExists[0].currentNum))) / 100 === Number(channelExists[0].increment) && !canSendMessage) {
				message.react("❓");
				message.reply({
					content: `Uh oh <@${message.author.id}>! You sent the last message as well.\nPlease let someone else increment before you do!`,
				});
			} else {
				// * Number is wrong, set counter to 0 and react with an X
				if (canSendMessage) {
					message.react("❌");

					await prisma.countSubmissions.create({
						data: {
							entryID: crypto.randomUUID(),
							userID: message.author.id,
							serverID: message.guildId!,
							channelID: message.channelId,
							wasCorrect: false,
							prevNum: channelExists[0].currentNum,
							submittedNum: sentNumber,
							wasNewHighScore: false,
							createdOn: new Date(),
						},
					});

					await prisma.countStatus.update({
						where: {
							channelID,
						},
						data: {
							currentNum: 0,
						},
					});
				}
				else {
					message.react("❓");
					message.reply({
						content: `Uh oh <@${message.author.id}>! You sent the last message as well.\nPlease let someone else increment before you do!`,
					});
				}
			}
		}
		// * Check if it's a math expression
		else if (channelExists[0]) {
			try {
				let sentNumber = evaluate(message.content);
				if (Math.round(100 * (sentNumber - Number(channelExists[0].currentNum))) / 100 === Number(channelExists[0].increment) && canSendMessage) {
					// * Number is correct, increment and react
					if (sentNumber > Number(channelExists[0].highestStreak)) {
						// * If it's a new high streak, update the score
						message.react("✅");
						message.react("🎉");

						await prisma.countStatus.update({
							where: {
								channelID,
							},
							data: {
								currentNum: sentNumber,
								highestStreak: sentNumber,
							},
						});

						await prisma.countSubmissions.create({
							data: {
								entryID: crypto.randomUUID(),
								userID: message.author.id,
								serverID: message.guildId ? message.guildId : "uhhh",
								channelID: message.channelId,
								wasCorrect: true,
								prevNum: channelExists[0].currentNum,
								submittedNum: sentNumber,
								wasNewHighScore: true,
								createdOn: new Date(),
							},
						});
					} else {
						// * Else, just update the currentNum
						message.react("✅");

						await prisma.countStatus.update({
							where: {
								channelID,
							},
							data: {
								currentNum: sentNumber,
							},
						});

						await prisma.countSubmissions.create({
							data: {
								entryID: crypto.randomUUID(),
								userID: message.author.id,
								serverID: message.guildId!,
								channelID: message.channelId,
								wasCorrect: true,
								prevNum: channelExists[0].currentNum,
								submittedNum: sentNumber,
								wasNewHighScore: false,
								createdOn: new Date(),
							},
						});
					}
					if (sentNumber === 13) {
						message.react("😈");
					} else if (sentNumber === 42) {
						message.react("🧬");
					} else if (sentNumber === 100) {
						message.react("💯");
					}
				} else if (Math.round(100 * (sentNumber - Number(channelExists[0].currentNum))) / 100 === Number(channelExists[0].increment) && !canSendMessage) {
					message.react("❓");
					message.reply({
						content: `Uh oh <@${message.author.id}>! You sent the last message as well.\nPlease let someone else increment before you do!`,
					});
				} else {
					// * Number is wrong, set counter to 0 and react with an X
					if (canSendMessage) {
						message.react("❌");

						await prisma.countSubmissions.create({
							data: {
								entryID: crypto.randomUUID(),
								userID: message.author.id,
								serverID: message.guildId!,
								channelID: message.channelId,
								wasCorrect: false,
								prevNum: channelExists[0].currentNum,
								submittedNum: sentNumber,
								wasNewHighScore: false,
								createdOn: new Date(),
							},
						});

						await prisma.countStatus.update({
							where: {
								channelID,
							},
							data: {
								currentNum: 0,
							},
						});
					} else {
						message.react("❓");
						message.reply({
							content: `Uh oh <@${message.author.id}>! You sent the last message as well.\nPlease let someone else increment before you do!`,
						});
					}
				}
			} catch (e) {
				// * Stop MathJS from crashing the whole program
				return;
			}
		}
	});
};

export { onMessage };
