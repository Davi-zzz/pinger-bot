import { CacheType, Interaction } from 'discord.js';
import { CommandController } from '../chore/command.controller.js';
import { COMMANDS_LIST } from '../chore/commands.js';
import { isDirectMessage, isValidInteration } from './functions.helper.js';

export const dispatcher = async (interaction: Interaction<CacheType>) => {
  if (isDirectMessage(interaction) && interaction.isChatInputCommand()) {
    return await interaction.reply({
      content: '❌ Commands are not available in Direct Messages.',
    });
  }
  if (!isValidInteration(interaction)) return;
  const { commandName } = interaction;

  switch (commandName) {
    case COMMANDS_LIST.SET_CHANNEL:
      await CommandController.setChannel(interaction);
      break;

    case COMMANDS_LIST.SET_ENDPOINTS:
      await CommandController.setEndpoint(interaction);
      break;

    case COMMANDS_LIST.CHECK_ENDPOINT:
      await CommandController.checkEndpoint(interaction);
      break;

    case COMMANDS_LIST.CHECK_STATUS:
      await CommandController.checkStatus(interaction);
      break;

    default:
      break;
  }
};
