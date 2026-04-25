import { Image } from 'react-native';

const source = Image.resolveAssetSource(require('../../no-image.svg'));

export default source?.uri ?? '';
