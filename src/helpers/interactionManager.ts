import { Client } from "discord.js";

const interactionManager = (client: Client) => {
    client.on('interactionCreate', async (interaction) => {
        if(!interaction.isCommand()) return;

        const { commandName, options } = interaction;

        if(commandName === "ping") {
            interaction.reply({
                content: 'pong',
                ephemeral: false
            })
        }
        if(commandName === "register") {
            const channel = options.get("channel");
            if(channel && channel.channel) {
                interaction.reply({
                    content: channel.channel.name,
                    ephemeral: true
                });
            }
        }
    })
}

export { interactionManager };