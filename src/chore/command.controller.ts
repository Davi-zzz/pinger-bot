import {
  APIEmbedField,
  CacheType,
  ChatInputCommandInteraction,
} from 'discord.js';
import { FsHelper } from '../utils/index.js';
import { pingHttp } from './pinger.js';
import { trimMean } from '../utils/functions.helper.js';
import { embed } from '../utils/embed.js';
export class CommandController {
  static async setChannel(interaction: ChatInputCommandInteraction<CacheType>) {
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
  static async setEndpoint(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
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
  static async checkEndpoint(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
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
  static async checkStatus(
    interaction: ChatInputCommandInteraction<CacheType>,
  ) {
    const serverId = interaction.guildId;
    if (!serverId) {
      return await interaction.reply({
        content: '❌ This command can only be used in a server.',
      });
    }
    try {
      await interaction.deferReply();
      const testResult = FsHelper.loadReport(serverId);
      const results = Array<APIEmbedField>();
      for (const ep in testResult) {
        const responseTimes = testResult[ep];
        const mean = trimMean(responseTimes);
        results.push({
          name: `Endpoint: ${ep}`,
          value: `Mean Response Time: ${mean.toFixed(2)} ms`,
          inline: false,
        });
      }
      await interaction.editReply({
        embeds: [embed(results)],
      });
    } catch (error) {
      await interaction.followUp({
        content: `📡 Result: OFFLINE.`,
        flags: 'Ephemeral',
      });
    }
  }
}
