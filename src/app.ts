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

cron.schedule('*/5 * * * *', () => {
  serverOptions = FsHelper.load();
  serverOptions.forEach(({ endpoints, channel_id }) => {
    if (endpoints && endpoints.length > 0 && channel_id)
      endpoints.map((ep) => {
        const { port, href: endpoint } = new URL(ep.includes('http') ? ep : `http://${ep}`);
        port.length > 0
          ? testConnection({ endpoint, channel_id, ports: [+port] })
          : testConnection({ endpoint, channel_id });
      });
  });
});

await registerCommands();
