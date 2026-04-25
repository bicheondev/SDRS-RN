import { Image } from 'react-native';

const source = Image.resolveAssetSource(require('./menuInfoMark.svg'));

export default source?.uri ?? '';
