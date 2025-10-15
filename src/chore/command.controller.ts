import { CacheType, Interaction } from 'discord.js';
import { FsHelper } from '../utils/index.js';
import { checkCommand } from './commands.js';
import { pingHttp } from './pinger.js';

export class CommandController {
  static async setChannel(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand() || !checkCommand(interaction.commandName)) return;
    const channel = interaction.options.getChannel('channel', true);
    const guildId = interaction.guildId!;
    await interaction.deferReply();
    const data = FsHelper.load();
    const existing = data.get(guildId);
    if (existing) {
      existing.channel_id = channel.id;
    } else {
      data.set(guildId, { channel_id: channel.id });
    }

    FsHelper.save(data);

    await interaction.followUp({
      content: `✅ Notification channel defined to: ${channel}.`,
      flags: 'Ephemeral',
    });
  }
  static async setEndpoint(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand() || !checkCommand(interaction.commandName)) return;
    const endpoint = interaction.options.getString('endpoint', true);
    const guildId = interaction.guildId!;
    await interaction.deferReply();
    const data = FsHelper.load();
    const existing = data.get(guildId);
    if (existing && existing.endpoints) {
      existing.endpoints.push(endpoint);
    } else {
      data.set(guildId, { endpoints: [endpoint] });

    }

    FsHelper.save(data);

    await interaction.followUp({
      content: `✅ Endpoint defined to: ${endpoint}.`,
      flags: 'Ephemeral',
    });
  }
  static async checkEndpoint(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand() || !checkCommand(interaction.commandName)) return;
    const url = interaction.options.getString('url', true);
    try {
      await interaction.deferReply();
      const testResult = await pingHttp(url);
      await interaction.editReply({
        content: `📡 Result: ${testResult ? 'ONLINE' : 'OFFLINE'}.`,
      });
    } catch (error) {
      await interaction.followUp({
        content: `📡 Result: OFFLINE.`,
        flags: 'Ephemeral',
      });
    }
  }
}
