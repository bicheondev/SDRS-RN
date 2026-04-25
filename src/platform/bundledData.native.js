export const DEFAULT_BUNDLED_FILES = {
  ship: { name: 'ship.csv', type: 'text/csv' },
  images: { name: 'images.zip', type: 'application/zip' },
};

export async function loadBundledDatabaseState() {
  throw new Error(
    'Native bundled seed loading is not implemented yet. Use Expo Asset/FileSystem to load ship.csv and images.zip for the APK port.',
  );
}
