export const DATABASE_NAME = 'ship-database-app';
export const STORE_NAME = 'app-state';
export const STATE_KEY = 'database-v1';
export const DATABASE_VERSION = 1;

function createStorageAdapterError() {
  return new Error(
    'Native persistence is not implemented yet. Choose Expo SQLite, AsyncStorage, or FileSystem-backed storage for the APK port.',
  );
}

export async function openDatabase() {
  throw createStorageAdapterError();
}

export async function loadStoredDatabaseState() {
  throw createStorageAdapterError();
}

export async function saveStoredDatabaseState() {
  throw createStorageAdapterError();
}
