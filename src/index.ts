// * 3rd Party Libs
import 'dotenv/config';
import { Client, IntentsBitField } from "discord.js";

// * Helper functions
import { onReady } from './helpers/onReady';
import { interactionManager } from './helpers/interactionManager';
import { onMessage } from './helpers/onMessage';

console.log("Starting Counting Bot");

const client = new Client({
    intents: [
        IntentsBitField.Flags.Guilds,
        IntentsBitField.Flags.GuildMessages,
        IntentsBitField.Flags.MessageContent,
    ]
});

onReady(client);
interactionManager(client);
onMessage(client);

client.login(process.env.BOT_TOKEN);