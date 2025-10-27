import { Client, GatewayIntentBits } from 'discord.js';
import { config } from 'dotenv';
import cron from 'node-cron';
import {
  getClient,
  registerCommands,
  setClient,
  testConnection,
} from './chore/index.js';
import { IndexedServerOptions } from './types/types.js';
import { dispatcher, FsHelper } from './utils/index.js';

config();

let serverOptions: IndexedServerOptions = new Map();

setClient(
  new Client({
    intents: [GatewayIntentBits.Guilds],
  }),
);
const client = getClient();

client.once('ready', () => {
  console.log(`✅ Logged in as ${client.user?.tag}`);
  FsHelper.load();
});

client.on('interactionCreate', async (interaction) => {
  dispatcher(interaction);
});

client.login(process.env.DISCORD_TOKEN);

cron.schedule('*/5 * * * *', async () => {
  serverOptions = FsHelper.load();
  for (const [serverId, { endpoints, channel_id }] of serverOptions.entries()) {
    if (endpoints && endpoints.length > 0 && channel_id)
      for (const ep of endpoints) {
        const { port, href: endpoint } = new URL(
          ep.includes('http') ? ep : `http://${ep}`,
        );
        const results =
          port.length > 0
            ? await testConnection({ endpoint, channel_id, ports: [+port] })
            : await testConnection({ endpoint, channel_id });

        if (results) {
          FsHelper.saveReport(
            {
              endpoint: ep,
              status: results.status,
              responseTime: results.responseTime,
            },
            serverId,
          );
        }
      }
  }
});

await registerCommands();
