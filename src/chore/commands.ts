import { ChannelType, REST, Routes, SlashCommandBuilder } from 'discord.js';

export const commands = [
  new SlashCommandBuilder()
    .setName('setchannel')
    .setDescription('Determine the channel where i can send messages')
    .addChannelOption((op) =>
      op
        .setName('channel')
        .addChannelTypes(ChannelType.GuildText)
        .setDescription('Choose a channel')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('setendpoints')
    .setDescription('the endpoint that i should ping for you')
    .addStringOption((op) =>
      op.setName('endpoint').setDescription('the endpoint url').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName('checkendpoint')
    .setDescription('the endpoint that i should ping for you')
    .addStringOption((op) =>
      op.setName('url').setDescription('the endpoint url').setRequired(true),
    ),
].map((cmd) => cmd.toJSON());

export enum COMMANDS_LIST {
  SET_CHANNEL = 'setchannel',
  SET_ENDPOINTS = 'setendpoints',
  CHECK_ENDPOINT = 'checkendpoint',
}

export function checkCommand(command: string) {
  const commandList = Object.values(COMMANDS_LIST) as string[];
  return commandList.includes(command);
}

export async function registerCommands() {
  const rest = new REST({ version: '10' }).setToken(process.env.DISCORD_TOKEN!);
  //   !!for test
  // todo
  //   try {
  //     await rest.put(Routes.applicationCommands(process.env.CLIENT_ID!), { body: commands });
  //   } catch (err) {
  //     console.error(err);
  //   }
  await rest.put(Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!), {
    body: commands,
  });
}
