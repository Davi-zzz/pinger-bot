import { Client } from 'discord.js';

let clientRef:Client;

export function setClient(client:Client) {
  clientRef = client;
}

export function getClient() {
  if (!clientRef) {
    throw new Error('O cliente Discord não foi definido. Chame setClient em app.js.');
  }
  return clientRef;
}
