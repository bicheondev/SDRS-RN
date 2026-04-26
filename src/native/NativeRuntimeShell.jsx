import { Component, useCallback, useEffect, useState } from 'react';
import { Platform, StyleSheet, Text, View } from 'react-native';

import { loadNativeFonts } from './loadNativeFonts.js';

const appConfig = require('../../app.json');
const appVersion = appConfig?.expo?.version ?? 'unknown';
const ENABLE_REAL_SDRS_APP = true;

function getErrorMessage(error) {
  if (error instanceof Error && error.message) {
    return error.message;
  }

  return String(error);
}

function getBoundaryErrorMessage(error, errorInfo) {
  const message = getErrorMessage(error);
  const componentStack = errorInfo?.componentStack?.trim();

  return componentStack ? `${message}\n${componentStack}` : message;
}

function DiagnosticScreen({ runtimeState }) {
  const note =
    runtimeState.mountMode === 'real-app'
      ? 'Real SDRS UI is enabled. Diagnostic fallback is available if mounting fails.'
      : 'Real SDRS UI mount is disabled or failed; diagnostic fallback is active.';

  return (
    <View style={styles.root}>
      <Text style={styles.title}>SDRS Native Runtime Loaded</Text>
      <Text style={styles.row}>Platform: {Platform.OS}</Text>
      <Text style={styles.row}>Platform version: {String(Platform.Version ?? 'unknown')}</Text>
      <Text style={styles.row}>App version: {appVersion}</Text>
      <Text style={styles.row}>Fonts loaded: {runtimeState.fontsLoaded ? 'yes' : 'no'}</Text>
      <Text style={styles.row}>Runtime status: {runtimeState.status}</Text>
      {runtimeState.errorMessage ? (
        <Text style={styles.error}>Runtime error: {runtimeState.errorMessage}</Text>
      ) : null}
      <Text style={styles.note}>{note}</Text>
    </View>
  );
}

class RealAppErrorBoundary extends Component {
  constructor(props) {
    super(props);

    this.state = {
      errorMessage: '',
    };
  }

  static getDerivedStateFromError(error) {
    return {
      errorMessage: getErrorMessage(error),
    };
  }

  componentDidCatch(error, errorInfo) {
    this.props.onError(getBoundaryErrorMessage(error, errorInfo));
  }

  render() {
    if (this.state.errorMessage) {
      return this.props.renderFallback(this.state.errorMessage);
    }

    return this.props.children;
  }
}

export function NativeRuntimeShell() {
  const [runtimeState, setRuntimeState] = useState({
    AppComponent: null,
    errorMessage: '',
    fontsLoaded: false,
    mountMode: ENABLE_REAL_SDRS_APP ? 'real-app' : 'diagnostic',
    status: 'loading',
  });

  useEffect(() => {
    let isMounted = true;

    async function initializeRuntime() {
      let fontsLoaded = false;

      try {
        await loadNativeFonts();
        fontsLoaded = true;

        if (!isMounted) {
          return;
        }

        if (!ENABLE_REAL_SDRS_APP) {
          setRuntimeState({
            AppComponent: null,
            errorMessage: '',
            fontsLoaded,
            mountMode: 'diagnostic',
            status: 'ready',
          });
          return;
        }

        setRuntimeState((previousState) => ({
          ...previousState,
          errorMessage: '',
          fontsLoaded,
          mountMode: 'real-app',
          status: 'loading-real-app',
        }));

        const appModule = await import('../RnwApp.jsx');
        const AppComponent = appModule.RnwApp;

        if (typeof AppComponent !== 'function') {
          throw new Error('Expected src/RnwApp.jsx to export RnwApp.');
        }

        if (!isMounted) {
          return;
        }

        setRuntimeState({
          AppComponent,
          errorMessage: '',
          fontsLoaded,
          mountMode: 'real-app',
          status: 'ready',
        });
      } catch (error) {
        if (!isMounted) {
          return;
        }

        setRuntimeState({
          AppComponent: null,
          errorMessage: error instanceof Error ? error.message : String(error),
          fontsLoaded,
          mountMode: 'diagnostic-fallback',
          status: 'error',
        });
      }
    }

    initializeRuntime();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    const errorUtils = globalThis.ErrorUtils;

    if (typeof errorUtils?.setGlobalHandler !== 'function') {
      return undefined;
    }

    let isMounted = true;
    const previousHandler =
      typeof errorUtils.getGlobalHandler === 'function' ? errorUtils.getGlobalHandler() : null;

    errorUtils.setGlobalHandler((error) => {
      if (!isMounted) {
        return;
      }

      setRuntimeState((previousState) => ({
        ...previousState,
        AppComponent: null,
        errorMessage: getErrorMessage(error),
        mountMode: 'diagnostic-fallback',
        status: 'error',
      }));
    });

    return () => {
      isMounted = false;

      if (typeof previousHandler === 'function') {
        errorUtils.setGlobalHandler(previousHandler);
      }
    };
  }, []);

  const handleRealAppError = useCallback((errorMessage) => {
    setRuntimeState((previousState) => ({
      ...previousState,
      AppComponent: null,
      errorMessage,
      mountMode: 'diagnostic-fallback',
      status: 'error',
    }));
  }, []);

  const renderFallback = useCallback(
    (errorMessage) => (
      <DiagnosticScreen
        runtimeState={{
          ...runtimeState,
          AppComponent: null,
          errorMessage,
          mountMode: 'diagnostic-fallback',
          status: 'error',
        }}
      />
    ),
    [runtimeState],
  );

  const AppComponent = runtimeState.AppComponent;

  if (AppComponent) {
    return (
      <RealAppErrorBoundary onError={handleRealAppError} renderFallback={renderFallback}>
        <AppComponent />
      </RealAppErrorBoundary>
    );
  }

  return <DiagnosticScreen runtimeState={runtimeState} />;
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
