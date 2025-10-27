import { APIEmbedField, EmbedBuilder } from 'discord.js';

export const embed = (data: APIEmbedField[]) => {
  const base = new EmbedBuilder()
    .setTitle('📡 Endpoint status:')
    .setDescription('Here is the current status of the endpoint.')
    .setColor(0x1abc9c)
    .setFooter({ text: 'Pinger Bot! ~ Burunyan!' })
    .setTimestamp();

  data.forEach((e) => {
    base.addFields(e);
  });
  return base;
};
