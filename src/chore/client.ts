import { Client } from 'discord.js';

let clientRef:Client;

export function setClient(client:Client) {
  clientRef = client;
}

export function getClient() {
  if (!clientRef) {
    throw new Error('the discord client was not defined');
  }
  return clientRef;
}
