import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';

import { loadBundledDatabaseStateFromFiles } from '../domain/importExport/bundledData.js';

export const DEFAULT_BUNDLED_FILES = {
  ship: { module: require('../../ship.csv'), name: 'ship.csv', type: 'text/csv' },
  images: { module: require('../../images.zip'), name: 'images.zip', type: 'application/zip' },
};

function base64ToArrayBuffer(base64Value) {
  const binary = atob(base64Value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function createAssetFile({ name, type, uri }) {
  return {
    lastModified: Date.now(),
    name,
    size: 0,
    type,
    uri,
    async arrayBuffer() {
      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      return base64ToArrayBuffer(base64);
    },
  };
}

async function loadBundledFile({ module, name, type }) {
  const asset = Asset.fromModule(module);
  await asset.downloadAsync();

  return createAssetFile({
    name,
    type,
    uri: asset.localUri ?? asset.uri,
  });
}

export async function loadBundledDatabaseState(files = DEFAULT_BUNDLED_FILES) {
  const [shipFile, imagesFile] = await Promise.all([
    loadBundledFile(files.ship),
    loadBundledFile(files.images),
  ]);

  return loadBundledDatabaseStateFromFiles({ imagesFile, shipFile });
}
