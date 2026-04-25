import * as Font from 'expo-font';

import { APP_FONT_FAMILY } from '../theme.js';

let nativeFontsPromise = null;

export function loadNativeFonts() {
  if (!nativeFontsPromise) {
    nativeFontsPromise = Font.loadAsync({
      [APP_FONT_FAMILY]: require('../../assets/fonts/PretendardGOV-Regular.otf'),
      'Pretendard GOV Variable': require('../../assets/fonts/PretendardGOV-Regular.otf'),
      'Pretendard GOV': require('../../assets/fonts/PretendardGOV-Regular.otf'),
      'PretendardGOV-Regular': require('../../assets/fonts/PretendardGOV-Regular.otf'),
      'PretendardGOV-Medium': require('../../assets/fonts/PretendardGOV-Medium.otf'),
      'PretendardGOV-SemiBold': require('../../assets/fonts/PretendardGOV-SemiBold.otf'),
      'PretendardGOV-Bold': require('../../assets/fonts/PretendardGOV-Bold.otf'),
      'Material Symbols Rounded': require('../../assets/fonts/MaterialSymbolsRounded.ttf'),
      MaterialIconsRound: require('../../assets/fonts/MaterialIconsRound-Regular.otf'),
    }).catch((error) => {
      nativeFontsPromise = null;
      throw error;
    });
  }

  return nativeFontsPromise;
}
