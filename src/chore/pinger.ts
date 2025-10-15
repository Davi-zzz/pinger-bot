import axios from 'axios';
import net from 'net';
import { TestConnectionParams, TestsResult, STATUS } from '../types/server.options.type.js';
import { getClient } from './client.js';
import e from 'express';

export async function testConnection({
  ports = [80, 443],
  endpoint,
  channel_id,
}: TestConnectionParams) {
  try {
    const { hostname } = new URL(endpoint);
    const portResults = testPort(hostname, ports);
    const portTests = [];
    for (const result of portResults) {
      portTests.push(result.result);
    }
    const portsStatus = [];
    const portOk = await Promise.all(portTests);
    for (let i = 0; i < ports.length; i++) {
      const result = portResults[i];
      portsStatus.push({ port: result.port, status: portOk[i] ? STATUS.OK : STATUS.OFFLINE });
    }
    const result: TestsResult = {
      message: `ENDPOINT: ${endpoint}`,
      status: STATUS.OFFLINE,
      portsStatus,
    };
    const isEveryPortDown = portsStatus.every((p) => p.status === STATUS.OFFLINE);
    if (isEveryPortDown) {
      return await notify(channel_id, result);
    }
    const httpOk = await pingHttp(endpoint);
    result.status = httpOk ? STATUS.OK : STATUS.OFFLINE;
    if (!httpOk && isEveryPortDown) {
      await notify(channel_id, result);
    }
    console.warn('🚧 Connection status: ', result);
  } catch (error) {
    console.warn('⚠️ Connection error:', error);
    return { httpOk: false, portOk: false, online: false };
  }
}
export async function pingHttp(endpoint: string) {
  try {
    await axios.get(endpoint, { timeout: 3000 });
    return true;
  } catch {
    return false;
  }
}
async function notify(channel_id: string, result: TestsResult) {
  const client = getClient();
  let message = '🚨 **STATUS WARNING** 🚨\n' + `**${result.message}**\n`;
  result.portsStatus.map((e) => (message += `**PORT:${e.port} | STATUS: ${e.status}** \n`));
  const channel =
    client.channels.cache.get(channel_id) || (await client.channels.fetch(channel_id));
  if (channel && channel.isTextBased() && channel.isSendable()) {
    await channel.send(message + `<@&${process.env.ROLE_ID}>`);
  }
}

function testPort(host: string, ports: number[]) {
  const result: Array<{ port: number; result: Promise<boolean> }> = [];
  for (const port of ports) {
    result.push({
      port: port,
      result: new Promise<boolean>((resolve) => {
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
      }),
    });
  }
  return result;
}
