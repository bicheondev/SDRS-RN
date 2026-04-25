import { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { RnwApp } from '../RnwApp.jsx';
import { loadNativeFonts } from './loadNativeFonts.js';

export function NativeRuntimeShell() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    let isMounted = true;

    loadNativeFonts()
      .catch(() => {})
      .finally(() => {
        if (isMounted) {
          setIsReady(true);
        }
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return <View style={styles.root}>{isReady ? <RnwApp /> : null}</View>;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
});
