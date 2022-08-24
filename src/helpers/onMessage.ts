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

		let channelExists = await prisma.countStatus.findUnique({
			where: {
				channelID,
			},
		});

		// * Get latest record for the channel to ensure that its not someone duplicating it
		const latestMessage = await prisma.countSubmissions.findMany({
			where: {
				channelID,
			},
			orderBy: {
				createdOn: "desc",
			},
			take: 1,
		});

		const determineEligibillity = async () => {
			if(latestMessage.length === 0) {
				return true;
			}
			else {
				if (latestMessage[0].userID === message.author.id && latestMessage[0].wasCorrect) {
					return false;
				} else if (latestMessage[0].userID === message.author.id && !latestMessage[0].wasCorrect) {
					return true;
				}
				else if(latestMessage[0].userID !== message.author.id) {
					return true;
				}
			}
		};

		2
		const canSendMessage = await determineEligibillity();

		// * If the channel is a counting channel, and the message content can be converted into a number
		if (channelExists && channelExists && !Number.isNaN(Number(message.content))) {
			const sentNumber = Number(message.content);
			if (Math.round(100 * (sentNumber - Number(channelExists.currentNum))) / 100 === Number(channelExists.increment) && canSendMessage) {
				// * Number is correct, increment and react
				if (sentNumber > Number(channelExists.highestStreak)) {
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
							prevNum: channelExists.currentNum,
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
							prevNum: channelExists.currentNum,
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
			} else if (Math.round(100 * (sentNumber - Number(channelExists.currentNum))) / 100 === Number(channelExists.increment) && !canSendMessage) {
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
							prevNum: channelExists.currentNum,
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
		else if (channelExists) {
			try {
				let sentNumber = evaluate(message.content);
				if (Math.round(100 * (sentNumber - Number(channelExists.currentNum))) / 100 === Number(channelExists.increment) && canSendMessage) {
					// * Number is correct, increment and react
					if (sentNumber > Number(channelExists.highestStreak)) {
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
								prevNum: channelExists.currentNum,
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
								prevNum: channelExists.currentNum,
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
				} else if (Math.round(100 * (sentNumber - Number(channelExists.currentNum))) / 100 === Number(channelExists.increment) && !canSendMessage) {
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
								prevNum: channelExists.currentNum,
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
