import {
  CacheType,
  ChatInputCommandInteraction,
  Interaction,
} from 'discord.js';
import { checkCommand } from '../chore/commands.js';

export function isValidInteration(
  interaction: Interaction<CacheType>,
): interaction is ChatInputCommandInteraction<CacheType> {
  return (
    interaction.isChatInputCommand() && checkCommand(interaction.commandName)
  );
}

export function isDirectMessage(interaction: any): boolean {
  return interaction.guildId === null;
}

export function trimMean([...data]: number[]): number {
  const trimmed = data.sort((a, b) => a - b);
  if (data.length > 10) {

    for (let i = 0; i < 2; i++) {
      trimmed.pop();
      trimmed.shift();
    }
    let result = 0;
    
    for (const num of trimmed) {
      result += num;
    }
    return result / trimmed.length;
  }
  return data[0];
}
