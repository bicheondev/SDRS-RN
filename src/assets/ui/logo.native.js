import { Image } from 'react-native';

const source = Image.resolveAssetSource(require('./logo.svg'));

export default source?.uri ?? '';
