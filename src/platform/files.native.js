import * as DocumentPicker from 'expo-document-picker';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

function base64ToArrayBuffer(base64Value) {
  const binary = atob(base64Value);
  const bytes = new Uint8Array(binary.length);

  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }

  return bytes.buffer;
}

function arrayBufferToBase64(buffer) {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const chunkSize = 0x8000;

  for (let index = 0; index < bytes.length; index += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(index, index + chunkSize));
  }

  return btoa(binary);
}

function getFileNameFromUri(uri, fallbackName = 'file') {
  const [pathWithoutQuery] = String(uri ?? '').split('?');
  return decodeURIComponent(pathWithoutQuery.split('/').filter(Boolean).pop() ?? fallbackName);
}

function getMimeTypeFromName(fileName, fallbackType = 'application/octet-stream') {
  const lowered = String(fileName ?? '').toLowerCase();

  if (lowered.endsWith('.csv')) {
    return 'text/csv';
  }

  if (lowered.endsWith('.zip')) {
    return 'application/zip';
  }

  if (lowered.endsWith('.png')) {
    return 'image/png';
  }

  if (lowered.endsWith('.webp')) {
    return 'image/webp';
  }

  if (lowered.endsWith('.gif')) {
    return 'image/gif';
  }

  if (lowered.endsWith('.svg')) {
    return 'image/svg+xml';
  }

  if (lowered.endsWith('.jpg') || lowered.endsWith('.jpeg')) {
    return 'image/jpeg';
  }

  return fallbackType;
}

function getDocumentPickerType(accept) {
  const acceptValue = String(accept ?? '');

  if (acceptValue.includes('image/')) {
    return 'image/*';
  }

  if (acceptValue.includes('.csv') || acceptValue.includes('text/csv')) {
    return ['text/csv', 'text/comma-separated-values', 'application/vnd.ms-excel'];
  }

  if (acceptValue.includes('.zip') || acceptValue.includes('application/zip')) {
    return ['application/zip', 'application/x-zip-compressed'];
  }

  return '*/*';
}

function getDocumentPickerAssets(result) {
  if (!result || result.canceled || result.type === 'cancel') {
    return [];
  }

  if (Array.isArray(result.assets)) {
    return result.assets;
  }

  if (result.type === 'success' || result.uri) {
    return [result];
  }

  return [];
}

function createNativeFile(asset, fallbackType) {
  const uri = asset.uri;
  const name = asset.name || getFileNameFromUri(uri);
  const type = asset.mimeType || asset.type || getMimeTypeFromName(name, fallbackType);

  return {
    lastModified: Date.now(),
    name,
    size: asset.size ?? 0,
    type,
    uri,
    async arrayBuffer() {
      const base64 =
        asset.base64 ??
        (await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        }));

      return base64ToArrayBuffer(base64);
    },
  };
}

export async function pickFile({ accept = '', multiple = false } = {}) {
  const result = await DocumentPicker.getDocumentAsync({
    copyToCacheDirectory: true,
    multiple,
    type: getDocumentPickerType(accept),
  });
  const assets = getDocumentPickerAssets(result);
  const files = assets.map((asset) =>
    createNativeFile(asset, getMimeTypeFromName(asset.name ?? '', 'application/octet-stream')),
  );

  return multiple ? files : files[0] ?? null;
}

export async function downloadBlob(blob, fileName = 'download') {
  const targetUri = `${FileSystem.cacheDirectory}${encodeURIComponent(fileName)}`;
  const base64 = await blob.arrayBuffer().then(arrayBufferToBase64);

  await FileSystem.writeAsStringAsync(targetUri, base64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(targetUri, {
      dialogTitle: fileName,
      mimeType: getMimeTypeFromName(fileName),
      UTI: 'public.zip-archive',
    });
  }

  return targetUri;
}

export async function readFileAsDataUrl(file) {
  if (!file || !file.type?.startsWith('image/') || !file.uri) {
    return null;
  }

  const base64 = await FileSystem.readAsStringAsync(file.uri, {
    encoding: FileSystem.EncodingType.Base64,
  });

  return `data:${file.type};base64,${base64}`;
}
