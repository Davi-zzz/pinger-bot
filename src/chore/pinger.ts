import axios from 'axios';
import net from 'net';
import { getClient } from './client.js';

export async function testConnection(endpoint: string, port: number, channel_id: string) {
  try {
    const { hostname } = new URL(endpoint);

    const [httpOk, portOk] = await Promise.all([pingHttp(endpoint), testPort(hostname, port)]);
    const result = {
      httpOk,
      portOk,
      online: httpOk || portOk,
    };
    console.warn('🚧 Status da conexão: ', result);
  } catch (error) {
    console.warn('⚠️ Erro ao testar conexão:', error);
    const client = getClient();
    const channel =
      client.channels.cache.get(channel_id) || (await client.channels.fetch(channel_id));
    if (channel && channel.isTextBased() && channel.isSendable()) {
      const message =
        `🚨 **ALERTA DE STATUS** 🚨\n` +
        `O endpoint configurado para este servidor (` +
        `**${endpoint}:${port}**` +
        `) falhou o teste de conexão. Status: OFFLINE.\n`;

      await channel.send(message);
    } else {
      console.error(`[ERRO DE NOTIFICAÇÃO].`);
    }
  }
  return { httpOk: false, portOk: false, online: false };
}

async function pingHttp(endpoint: string) {
  try {
    await axios.get(endpoint, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}

function testPort(host: string, port: number) {
  return new Promise<boolean>((resolve) => {
    const socket = net.createConnection(port, host);
    socket.setTimeout(3000);

    socket.on('connect', () => {
      socket.destroy();
      resolve(true);
    });
    socket.on('timeout', () => {
      socket.destroy();
      resolve(false);
    });
    socket.on('error', () => resolve(false));
  });
}
