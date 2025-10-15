import fs from 'fs';
import path from 'path';
import { IndexedServerOptions } from '../types/server.options.type.js';

import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);

const __dirname = path.dirname(__filename);

const configPath = path.resolve(__dirname, '../../', 'config.json');
const backupConfigPath = path.resolve(__dirname, '../../', 'config-backup.json');

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

    // 2is {}, resulting in an empty Map.
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
        const rawPayload = JSON.parse(fs.readFileSync(backupConfigPath, 'utf-8'));

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
      const fiveMinutes = 5 * 60 * 60 * 1000;
      const outdated =
        !backup || !backup.lastModification || now - backup.lastModification > fiveMinutes;

      if (outdated) {
        fs.writeFileSync(backupConfigPath, JSON.stringify(payload, null, 2));
        console.log('Backup updated.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}
