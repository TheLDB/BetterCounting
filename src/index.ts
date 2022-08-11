import 'dotenv/config';
import { Client } from "discord.js";
import { onReady } from './helpers/onReady';
import { interactionManager } from './helpers/interactionManager';

console.log("Starting Counting Bot");

const client = new Client({
    intents: []
});

onReady(client);
interactionManager(client);

client.login(process.env.BOT_TOKEN);