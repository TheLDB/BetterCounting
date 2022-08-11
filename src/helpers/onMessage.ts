import { Client } from "discord.js";
import { PrismaClient } from "@prisma/client";
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

		// * If the channel is a counting channel, and the message content can be converted into a number
		if (channelExists && !Number.isNaN(Number(message.content))) {
			const sentNumber = Number(message.content);

			if (Math.round(100 * (sentNumber - Number(channelExists.currentNum))) / 100 === Number(channelExists.increment)) {
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

					// await prisma.countSubmissions.create({
					// 	data: {
					// 		entryID: crypto.randomUUID(),
					// 		userID: message.author.id,
					// 		serverID: message.guildId ? message.guildId : "uhhh",
					// 		channelID: message.channelId,
					// 		wasCorrect: true,
					// 		prevNum: channelExists.currentNum,
					// 		submittedNum: sentNumber,
					// 		createdOn: new Date()
					// 	}
					// });

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
				}
				if(sentNumber === 13) {
					message.react("😈")
				}
				else if(sentNumber === 42) {
					message.react("🧬")
				}
				else if(sentNumber === 100) {
					message.react("💯")
				}
			} else {
				// * Number is wrong, set counter to 0 and react with an X
				await prisma.countStatus.update({
					where: {
						channelID,
					},
					data: {
						currentNum: 0,
					},
				});

				message.react("❌");
			}
		}
	});
};

export { onMessage };
