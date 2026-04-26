import { useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { loadNativeFonts } from './loadNativeFonts.js';

const appConfig = require('../../app.json');
const appVersion = appConfig?.expo?.version ?? 'unknown';

export function NativeRuntimeShell() {
  const [runtimeState, setRuntimeState] = useState({
    errorMessage: '',
    fontsLoaded: false,
    status: 'loading',
  });

  useEffect(() => {
    let isMounted = true;

    loadNativeFonts()
      .then(() => {
        if (!isMounted) {
          return;
        }

        setRuntimeState({
          errorMessage: '',
          fontsLoaded: true,
          status: 'ready',
        });
      })
      .catch((error) => {
        if (!isMounted) {
          return;
        }

        setRuntimeState({
          errorMessage: error instanceof Error ? error.message : String(error),
          fontsLoaded: false,
          status: 'error',
        });
      });

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <View style={styles.root}>
      <Text style={styles.title}>SDRS Native Runtime Loaded</Text>
      <Text style={styles.row}>Platform: {Platform.OS}</Text>
      <Text style={styles.row}>Platform version: {String(Platform.Version ?? 'unknown')}</Text>
      <Text style={styles.row}>App version: {appVersion}</Text>
      <Text style={styles.row}>Fonts loaded: {runtimeState.fontsLoaded ? 'yes' : 'no'}</Text>
      <Text style={styles.row}>Runtime status: {runtimeState.status}</Text>
      {runtimeState.errorMessage ? (
        <Text style={styles.error}>Initialization error: {runtimeState.errorMessage}</Text>
      ) : null}
      <Text style={styles.note}>Real SDRS UI mount is disabled in this diagnostic build.</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    alignItems: 'flex-start',
    backgroundColor: '#ffffff',
    flex: 1,
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    color: '#111827',
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 18,
  },
  row: {
    color: '#1f2937',
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 6,
  },
  error: {
    color: '#b91c1c',
    fontSize: 15,
    lineHeight: 22,
    marginTop: 12,
  },
  note: {
    color: '#4b5563',
    fontSize: 14,
    lineHeight: 20,
    marginTop: 18,
  },
});
