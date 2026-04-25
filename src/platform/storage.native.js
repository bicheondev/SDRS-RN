import * as FileSystem from 'expo-file-system/legacy';

export const DATABASE_NAME = 'ship-database-app';
export const STORE_NAME = 'app-state';
export const STATE_KEY = 'database-v1';
export const DATABASE_VERSION = 1;

const STORAGE_DIRECTORY = `${FileSystem.documentDirectory}${DATABASE_NAME}/`;
const STORAGE_FILE_URI = `${STORAGE_DIRECTORY}${STATE_KEY}.json`;

async function ensureStorageDirectory() {
  const directoryInfo = await FileSystem.getInfoAsync(STORAGE_DIRECTORY);

  if (!directoryInfo.exists) {
    await FileSystem.makeDirectoryAsync(STORAGE_DIRECTORY, { intermediates: true });
  }
}

export async function openDatabase() {
  await ensureStorageDirectory();

  return {
    directoryUri: STORAGE_DIRECTORY,
    fileUri: STORAGE_FILE_URI,
    name: DATABASE_NAME,
    storeName: STORE_NAME,
    version: DATABASE_VERSION,
  };
}

export async function loadStoredDatabaseState() {
  await ensureStorageDirectory();

  const fileInfo = await FileSystem.getInfoAsync(STORAGE_FILE_URI);

  if (!fileInfo.exists) {
    return null;
  }

  const storedValue = await FileSystem.readAsStringAsync(STORAGE_FILE_URI);

  if (!storedValue) {
    return null;
  }

  return JSON.parse(storedValue);
}

export async function saveStoredDatabaseState(databaseState) {
  await ensureStorageDirectory();
  await FileSystem.writeAsStringAsync(STORAGE_FILE_URI, JSON.stringify(databaseState));
}
