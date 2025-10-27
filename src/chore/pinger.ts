import axios from 'axios';
import net from 'net';
import {
  STATUS,
  TestConnectionParams,
  TestPortResult,
  TestsResult,
  TestStatus,
} from '../types/types.js';
import { getClient } from './client.js';

export async function testConnection({
  ports = [80, 443],
  endpoint,
  channel_id,
}: TestConnectionParams) {
  try {
    const { hostname } = new URL(endpoint);
    const portResults = testPort(hostname, ports);
    const portPromises = portResults.map((p) => p.result);
    const resolvedPorts = await Promise.all(portPromises);
    const portsStatus = resolvedPorts.map((r) => ({
      port: r.port,
      status: r.status,
      responseTime: r.responseTime,
    }));

    const result: TestsResult = {
      message: `ENDPOINT: ${endpoint}`,
      status: STATUS.OFFLINE,
      portsStatus,
      responseTime: 0,
    };
    const isEveryPortDown = portsStatus.every(
      (p) => p.status === STATUS.OFFLINE,
    );
    if (isEveryPortDown) {
      return await notify(channel_id, result);
    }
    const httpResult = await pingHttp(endpoint);
    result.status = httpResult ? STATUS.OK : STATUS.OFFLINE;
    result.responseTime = httpResult.responseTime;
    if (!httpResult.ok && isEveryPortDown) {
      await notify(channel_id, result);
    }
    console.warn('🚧 Connection status: ', result);
    return result;
  } catch (error) {
    console.warn('⚠️ Connection error:', error);
  }
}
export async function pingHttp(endpoint: string) {
  const start: number = Date.now();
  try {
    await axios.get(endpoint, { timeout: 5000 });
    return {
      responseTime: Date.now() - start,
      ok: true,
    };
  } catch {
    return {
      responseTime: Date.now() - start,
      ok: false,
    };
  }
}
async function notify(channel_id: string, result: TestsResult) {
  const client = getClient();
  let message = '🚨 **STATUS WARNING** 🚨\n' + `**${result.message}**\n`;
  result.portsStatus.map(
    (e) => (message += `**PORT:${e.port} | STATUS: ${e.status}** \n`),
  );
  const channel =
    client.channels.cache.get(channel_id) ||
    (await client.channels.fetch(channel_id));
  if (channel && channel.isTextBased() && channel.isSendable()) {
    await channel.send(message + `<@&${process.env.ROLE_ID}>`);
  }
}

function testPort(host: string, ports: number[]) {
  const result: TestPortResult[] = [];
  for (const port of ports) {
    const start = Date.now();
    result.push({
      port: port,
      result: new Promise<TestStatus>((resolve) => {
        const socket = net.createConnection(port, host);
        socket.setTimeout(3000);

        socket.on('connect', () => {
          socket.destroy();
          resolve({
            port,
            responseTime: Date.now() - start,
            status: STATUS.OK,
          });
        });
        socket.on('timeout', () => {
          socket.destroy();
          resolve({
            port,
            responseTime: Date.now() - start,
            status: STATUS.OFFLINE,
          });
        });
        socket.on('error', () =>
          resolve({
            port,
            responseTime: Date.now() - start,
            status: STATUS.OFFLINE,
          }),
        );
      }),
    });
  }
  return result;
}
