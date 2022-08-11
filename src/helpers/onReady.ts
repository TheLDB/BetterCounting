import { Client } from "discord.js";
import { registerSlashCommands } from './registerSlashCommands';

const onReady = (client: Client): void => {
    client.on("ready", async () => {
        if(!client.user || !client.application) return;

        registerSlashCommands(client);
        console.log(`Logged in as ${client.user.username}!`)
    })
}

export { onReady }