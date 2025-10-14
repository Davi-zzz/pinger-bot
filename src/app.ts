import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import cron from 'node-cron';
import { registerCommands } from './chore/commands.js';
import { testConnection } from './chore/pinger.js';
import { IndexedServerOptions } from './types/server.options.type.js';
import { dispatcher, FsHelper } from './utils/index.js';
import { getClient, setClient } from './chore/client.js';

config();

let serverOptions: IndexedServerOptions = new Map();

setClient(new Client({ intents: [GatewayIntentBits.Guilds] }));
const client = getClient();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  FsHelper.load();
});

client.on('interactionCreate', async (interaction) => {
  dispatcher(interaction);
});

client.login(process.env.DISCORD_TOKEN);

// Roda a cada 30 segundos
cron.schedule('*/30 * * * * *', () => {
  console.log('⏱️ Executando tarefa a cada 30 segundos:', new Date().toISOString());
  serverOptions = FsHelper.load();
  serverOptions.forEach(({ endpoint, ports, channel_id }) => {
    if (endpoint && channel_id)
      ports && ports.length > 0
        ? ports.forEach((p) => testConnection(endpoint, p, channel_id ))
        : [80, 443].forEach((p) => testConnection(endpoint, p, channel_id));
  });
  // Aqui você chama sua função, por exemplo:
  // testConnection('https://api.exemplo.com', 443);
});

await registerCommands();
