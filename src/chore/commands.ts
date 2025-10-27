import { ChannelType, REST, Routes, SlashCommandBuilder } from 'discord.js';

export enum COMMANDS_LIST {
  SET_CHANNEL = 'setchannel',
  SET_ENDPOINTS = 'setendpoints',
  CHECK_ENDPOINT = 'checkendpoint',
  CHECK_STATUS = 'checkstatus',
}

export const commands = [
  new SlashCommandBuilder()
    .setName(COMMANDS_LIST.SET_CHANNEL)
    .setDescription('Determine the channel where i can send messages')
    .addChannelOption((op) =>
      op
        .setName('channel')
        .addChannelTypes(ChannelType.GuildText)
        .setDescription('Choose a channel')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName(COMMANDS_LIST.SET_ENDPOINTS)
    .setDescription('the endpoint that i should ping for you')
    .addStringOption((op) =>
      op
        .setName('endpoint')
        .setDescription('the endpoint url')
        .setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName(COMMANDS_LIST.CHECK_ENDPOINT)
    .setDescription('the endpoint that i should ping for you')
    .addStringOption((op) =>
      op.setName('url').setDescription('the endpoint url').setRequired(true),
    ),
  new SlashCommandBuilder()
    .setName(COMMANDS_LIST.CHECK_STATUS)
    .setDescription('generate a report of endpoints status'),
].map((cmd) => cmd.toJSON());

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
  await rest.put(
    Routes.applicationGuildCommands(process.env.APP_ID!, process.env.GUILD_ID!),
    {
      body: commands,
    },
  );
}
