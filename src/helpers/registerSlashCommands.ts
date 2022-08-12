import DiscordJS, { Client } from "discord.js";

const registerSlashCommands = (client: Client) => {
	console.log("Registering slash commands");
	const testingGuildID: string = "";
	const testingGuild = client.guilds.cache.get(testingGuildID);
	let commands;

	if (testingGuild) {
		commands = testingGuild.commands;
	} else {
		commands = client.application?.commands;
	}

	commands?.create({
		name: "register",
		description: "Register a counting channel",
		options: [
			{
				name: "channel",
				description: "The channel to count in",
				required: true,
				type: DiscordJS.ApplicationCommandOptionType.Channel,
			},
			{
				name: "increment",
				description: "The number to increment counting by. Default is 1",
				required: false,
				type: DiscordJS.ApplicationCommandOptionType.Number,
			}
		],
	});

	commands?.create({
		name: "updateincrement",
		description: "Update the increment for a specific counting channel",
		options: [
			{
				name: "channel",
				description: "The counting channel to update the increment in",
				required: true,
				type: DiscordJS.ApplicationCommandOptionType.Channel
			},
			{
				name: "increment",
				description: "The new number increment",
				required: true,
				type: DiscordJS.ApplicationCommandOptionType.Number,
			}
		]
	});

	commands?.create({
		name: "leaderboard",
		description: "Get a leaderboard of server or channel counting leaders",
		options: [
			{
				name: "channel",
				description: "The counting channel to get a leaderboard of",
				required: false,
				type: DiscordJS.ApplicationCommandOptionType.Channel
			}
		]
	})

	commands?.create({
		name: "score",
		description: "Get the counting score of a specific user. +1 for a correct count, -5 for a wrong count",
		options: [
			{
				name: "user",
				description: "The user to get a counting score of.",
				required: false,
				type: DiscordJS.ApplicationCommandOptionType.User 
			}
		]
	})

	commands?.create({
		name: "channelscore",
		description: "Get the current and high score of a specific channel",
		options: [
			{
				name: "channel",
				description: "The channel to get the current and high score of",
				required: false,
				type: DiscordJS.ApplicationCommandOptionType.Channel
			}
		]
	})
	
	commands?.create({
		name: "delete",
		description: "Delete a counting channel",
		options: [
			{
				name: "channel",
				description: "The channel to stop counting in",
				required: true,
				type: DiscordJS.ApplicationCommandOptionType.Channel,
			},
		],
	});
};

export { registerSlashCommands };
