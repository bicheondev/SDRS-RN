import { registerRootComponent } from 'expo';

import { NativeRuntimeShell } from './NativeRuntimeShell.jsx';

const BASE64_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=';

function installBtoa() {
  if (typeof globalThis.btoa === 'function') {
    return;
  }

  globalThis.btoa = (input = '') => {
    const value = String(input);
    let output = '';

    for (let index = 0; index < value.length; index += 3) {
      const first = value.charCodeAt(index);
      const second = value.charCodeAt(index + 1);
      const third = value.charCodeAt(index + 2);

      if (first > 0xff || second > 0xff || third > 0xff) {
        throw new Error('btoa input must be a binary string.');
      }

      output += BASE64_CHARS[first >> 2];
      output += BASE64_CHARS[((first & 3) << 4) | (Number.isNaN(second) ? 0 : second >> 4)];
      output += Number.isNaN(second)
        ? '='
        : BASE64_CHARS[((second & 15) << 2) | (Number.isNaN(third) ? 0 : third >> 6)];
      output += Number.isNaN(third) ? '=' : BASE64_CHARS[third & 63];
    }

    return output;
  };
}

function installAtob() {
  if (typeof globalThis.atob === 'function') {
    return;
  }

  globalThis.atob = (input = '') => {
    const value = String(input).replace(/[\t\n\f\r ]/g, '');

    if (value.length % 4 === 1) {
      throw new Error('Invalid base64 string.');
    }

    let output = '';
    let buffer = 0;
    let bits = 0;

    for (const character of value.replace(/=+$/, '')) {
      const nextValue = BASE64_CHARS.indexOf(character);

      if (nextValue < 0 || nextValue > 63) {
        throw new Error('Invalid base64 character.');
      }

      buffer = (buffer << 6) | nextValue;
      bits += 6;

      if (bits >= 8) {
        bits -= 8;
        output += String.fromCharCode((buffer >> bits) & 0xff);
      }
    }

    return output;
  };
}

installBtoa();
installAtob();

registerRootComponent(NativeRuntimeShell);
