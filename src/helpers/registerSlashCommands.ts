import DiscordJS, { Client } from "discord.js";

const registerSlashCommands = (client: Client) => {
    console.log("Registering slash commands");
    const testingGuildID: string = '941546986430169119';
    const testingGuild = client.guilds.cache.get(testingGuildID);
    let commands;

    if(testingGuild) {
        commands = testingGuild.commands;
    }
    else {
        commands = client.application?.commands;
    };

    commands?.create({
        name: 'ping',
        description: 'test'
    });

    commands?.create({
        name: 'register',
        'description': "Register a counting channel",
        options: [{
            name: 'channel',
            description: "The channel to count in",
            required: true,
            type: DiscordJS.ApplicationCommandOptionType.Channel
        }]
    })
}

export { registerSlashCommands };