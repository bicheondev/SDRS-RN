import { getDefaultConfig } from 'expo/metro-config.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const projectRoot = path.dirname(fileURLToPath(import.meta.url));
const config = getDefaultConfig(projectRoot);

const nativeRedirects = new Map([
  [path.join(projectRoot, 'src/platform/index.js'), path.join(projectRoot, 'src/platform/index.native.js')],
  [path.join(projectRoot, 'src/platform/files.js'), path.join(projectRoot, 'src/platform/files.native.js')],
  [path.join(projectRoot, 'src/platform/storage.js'), path.join(projectRoot, 'src/platform/storage.native.js')],
  [
    path.join(projectRoot, 'src/platform/bundledData.js'),
    path.join(projectRoot, 'src/platform/bundledData.native.js'),
  ],
  [
    path.join(projectRoot, 'src/adapters/storage.web.js'),
    path.join(projectRoot, 'src/platform/storage.native.js'),
  ],
  [
    path.join(projectRoot, 'src/adapters/bundledSeed.web.js'),
    path.join(projectRoot, 'src/platform/bundledData.native.js'),
  ],
  [path.join(projectRoot, 'no-image.svg'), path.join(projectRoot, 'src/assets/no-image.native.js')],
  [
    path.join(projectRoot, 'src/assets/ui/logo.svg'),
    path.join(projectRoot, 'src/assets/ui/logo.native.js'),
  ],
  [
    path.join(projectRoot, 'src/assets/ui/menuInfoLogo.svg'),
    path.join(projectRoot, 'src/assets/ui/menuInfoLogo.native.js'),
  ],
  [
    path.join(projectRoot, 'src/assets/ui/menuInfoMark.svg'),
    path.join(projectRoot, 'src/assets/ui/menuInfoMark.native.js'),
  ],
]);

const assetExts = new Set(config.resolver.assetExts);
['csv', 'otf', 'svg', 'ttf', 'zip'].forEach((extension) => assetExts.add(extension));
config.resolver.assetExts = Array.from(assetExts);

function getAbsoluteRequestPath(originModulePath, moduleName) {
  if (moduleName.startsWith('.')) {
    return path.normalize(path.resolve(path.dirname(originModulePath), moduleName));
  }

  if (path.isAbsolute(moduleName)) {
    return path.normalize(moduleName);
  }

  return null;
}

function getNativeRedirect(context, moduleName) {
  const originModulePath = context.originModulePath ?? '';

  if (originModulePath.endsWith('.native.js')) {
    return null;
  }

  const requestPath = getAbsoluteRequestPath(originModulePath, moduleName);
  return requestPath ? nativeRedirects.get(requestPath) ?? null : null;
}

const defaultResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  const redirectPath = getNativeRedirect(context, moduleName);

  if (redirectPath) {
    return {
      type: 'sourceFile',
      filePath: redirectPath,
    };
  }

  if (defaultResolveRequest) {
    return defaultResolveRequest(context, moduleName, platform);
  }

  return context.resolveRequest(context, moduleName, platform);
};

export default config;
