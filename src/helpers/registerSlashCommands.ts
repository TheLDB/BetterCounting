import DiscordJS, { Client } from "discord.js";

const registerSlashCommands = (client: Client) => {
	console.log("Registering slash commands");
	const testingGuildID: string = "941546986430169119";
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
			},
		],
	});

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
