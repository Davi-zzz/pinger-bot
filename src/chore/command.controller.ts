import { CacheType, Interaction } from 'discord.js';
import { FsHelper } from '../utils/index.js';
import { checkCommand } from './commands.js';

export class CommandController {
  static async setChannel(interaction: Interaction<CacheType>) {
    if (!interaction.isChatInputCommand() || !checkCommand(interaction.commandName)) return;
    const channel = interaction.options.getChannel('channel', true);
    const guildId = interaction.guildId!;
    const data = FsHelper.load();
    const existing = data.get(guildId);
    if (existing) {
      existing.channel_id = channel.id;
    } else {
      data.set(guildId, { channel_id: channel.id });
    }

    FsHelper.save(data);

    await interaction.reply({
      content: `✅ Canal de notificações configurado para ${channel}.`,
      ephemeral: true,
    });
  }
  static async setEndpoint(interaction: Interaction<CacheType>) {
    console.log('set endpoint ===========================');
    if (!interaction.isChatInputCommand() || !checkCommand(interaction.commandName)) return;
    const endpoint = interaction.options.getString('endpoint', true);
    const guildId = interaction.guildId!;
    const data = FsHelper.load();
    const existing = data.get(guildId);
    if (existing) {
      existing.endpoint = endpoint;
    } else {
      data.set(guildId, { endpoint });
    }

    FsHelper.save(data);

    await interaction.reply({
      content: `✅ Endpoint configurado para ${endpoint}.`,
      ephemeral: true,
    });
  }
}
