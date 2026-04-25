import { Image } from 'react-native';

const source = Image.resolveAssetSource(require('./menuInfoLogo.svg'));

export default source?.uri ?? '';
