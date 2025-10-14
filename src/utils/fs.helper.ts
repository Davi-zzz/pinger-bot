import fs from 'fs';
import path from 'path';
import { IndexedServerOptions } from '../types/server.options.type.js';

import { fileURLToPath } from 'url';

// --- ESM Path Setup ---
// 1. Get the current file's URL
const __filename = fileURLToPath(import.meta.url);

// 2. Get the current directory's path (C:\...\pinger\dist\utils)
const __dirname = path.dirname(__filename);

// 3. FIX: Use '../../' to navigate up from 'dist/utils' to the project root 'pinger'.
const configPath = path.resolve(__dirname, '../../', 'config.json');
const backupConfigPath = path.resolve(__dirname, '../../', 'config-backup.json');
// --- End ESM Path Setup ---

export class FsHelper {
  // Utility function to safely parse and convert the payload to a Map
  private static parseAndConvertToMap(rawPayload: any): IndexedServerOptions {
    let rawData: object = {};

    // 1. Safety Check: Ensure the payload is an object and contains the 'data' property.
    if (rawPayload && typeof rawPayload === 'object' && !Array.isArray(rawPayload) && rawPayload.data) {
      rawData = rawPayload.data;
    } 
    
    // 2. Convert the (now guaranteed) plain object to a Map. If the payload was corrupt/missing, 
    // rawData is {}, resulting in an empty Map.
    return new Map(Object.entries(rawData)) as IndexedServerOptions;
  }

  static load(): IndexedServerOptions {
    try {
      // 1. Try to load the main config file (config.json)
      const rawPayload = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      const result = FsHelper.parseAndConvertToMap(rawPayload);

      console.log('main save loaded');
      return result;

    } catch (error) {
      // If main config fails (ENOENT or parsing error), try backup
      try {
        // 2. Try to load the backup config file (config-backup.json)
        const rawPayload = JSON.parse(fs.readFileSync(backupConfigPath, 'utf-8'));
        
        const result = FsHelper.parseAndConvertToMap(rawPayload);

        console.log('backup save loaded');
        return result;

      } catch (error) {
        // 3. If both fail, log warning and return an empty Map
        console.warn('Not possible to load save or backup', error);
        return new Map() as IndexedServerOptions;
      }
    }
  }

  static save(data: IndexedServerOptions) {
    const now = Date.now();
    
    // CONVERSION: Convert the Map back into a plain object for JSON serialization.
    const dataObject = Object.fromEntries(data);
    
    const payload = {
      lastModification: Date.now(),
      data: dataObject, // Saving a plain object
    };
    
    try {
      // Write the main config file.
      fs.writeFileSync(configPath, JSON.stringify(payload, null, 2));

      // Backup Logic: Check if backup exists or is outdated
      const backupRaw = fs.existsSync(backupConfigPath)
        ? fs.readFileSync(backupConfigPath, 'utf-8')
        : null;

      let backup = backupRaw ? JSON.parse(backupRaw) : null;
      const sevenDays = 7 * 24 * 60 * 60 * 1000;
      const outdated =
        !backup || !backup.lastModification || now - backup.lastModification > sevenDays;

      if (outdated) {
        // Write the backup file.
        fs.writeFileSync(backupConfigPath, JSON.stringify(payload, null, 2));
        console.log('Backup updated.');
      }
    } catch (error) {
      console.error('Error saving data:', error);
    }
  }
}