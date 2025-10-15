import { Interaction, CacheType } from 'discord.js';
import { COMMANDS_LIST } from '../chore/commands.js';
import { CommandController } from '../chore/command.controller.js';

export const dispatcher = async (interaction: Interaction<CacheType>) => {
  if (!interaction.isChatInputCommand()) return;
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

    default:
      break;
  }
};
