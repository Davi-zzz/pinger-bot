import fs from 'fs';
import path from 'path';

import { fileURLToPath } from 'url';
import { IndexedServerOptions, PingResult, Reports } from '../types/types.js';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../', 'config.json');
const backupConfigPath = path.resolve(
  __dirname,
  '../../',
  'config-backup.json',
);

export class FsHelper {
  private static parseAndConvertToMap(rawPayload: any): IndexedServerOptions {
    let rawData: object = {};

    if (
      rawPayload &&
      typeof rawPayload === 'object' &&
      !Array.isArray(rawPayload) &&
      rawPayload.data
    ) {
      rawData = rawPayload.data;
    }

    return new Map(Object.entries(rawData)) as IndexedServerOptions;
  }

  static load(): IndexedServerOptions {
    try {
      const rawPayload = JSON.parse(fs.readFileSync(configPath, 'utf-8'));

      const result = FsHelper.parseAndConvertToMap(rawPayload);

      console.log('main save loaded');
      return result;
    } catch (error) {
      try {
        const rawPayload = JSON.parse(
          fs.readFileSync(backupConfigPath, 'utf-8'),
        );

        const result = FsHelper.parseAndConvertToMap(rawPayload);

        console.log('backup save loaded');
        return result;
      } catch (error) {
        console.warn('Not possible to load save or backup', error);
        return new Map() as IndexedServerOptions;
      }
    }
  }

  static save(data: IndexedServerOptions) {
    const now = Date.now();

    const dataObject = Object.fromEntries(data);

    const payload = {
      lastModification: Date.now(),
      data: dataObject,
    };

    try {
      fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));

      const backupRaw = fs.existsSync(backupConfigPath)
        ? fs.readFileSync(backupConfigPath, 'utf-8')
        : null;

      let backup = backupRaw ? JSON.parse(backupRaw) : null;
      const fiveMinutes = 5 * 60 * 1000;
      const outdated =
        !backup ||
        !backup.lastModification ||
        now - backup.lastModification > fiveMinutes;

      if (outdated) {
        fs.writeFileSync(backupConfigPath, JSON.stringify(payload, null, 2));
        console.log('Backup updated.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }

  static saveReport(data: PingResult, serverId: string) {
    const reportPath = path.resolve(
      __dirname,
      '../../',
      `${serverId}-reports.json`,
    );
    try {
      const existingData = FsHelper.loadReport(serverId);

      console.log('🚀 ~ FsHelper ~ saveReport ~ existingData:', existingData);

      const { endpoint } = data;
      if (!existingData[endpoint]) {
        existingData[endpoint] = [];
      }
      existingData[endpoint].length >= 50
        ? existingData[endpoint].shift()
        : null;
      existingData[endpoint].push(data.responseTime);
      fs.writeFileSync(reportPath, JSON.stringify(existingData, null, 2), {
        flag: 'w',
      });
    } catch (error) {
      console.error('Error saving report data:', error);
    }
  }
  static loadReport(serverId: string): Reports {
    const reportPath = path.resolve(
      __dirname,
      '../../',
      `${serverId}-reports.json`,
    );

    try {
      const rawData = fs.readFileSync(reportPath, {
        flag: 'r+',
        encoding: 'utf-8',
      });
      const data: Reports = JSON.parse(rawData);
      return data;
    } catch (error) {
      console.error('Error loading report data:', error);
    }
    return {};
  }
}
