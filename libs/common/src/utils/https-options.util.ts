import { readFileSync } from 'node:fs';
import { X509Certificate, createPrivateKey } from 'node:crypto';
import type { HttpsOptions } from '@nestjs/common/interfaces/external/https-options.interface';

export function loadHttpsOptions(): HttpsOptions | undefined {
  const keyPath = process.env.TLS_KEY_PATH;
  const certPath = process.env.TLS_CERT_PATH;

  if (!keyPath || !certPath) {
    return undefined;
  }

  const key = read(keyPath, 'TLS_KEY_PATH');
  const cert = read(certPath, 'TLS_CERT_PATH');

  const certificate = parse(
    () => new X509Certificate(cert),
    `TLS_CERT_PATH=${certPath} is not an X.509 certificate`,
  );

  const privateKey = parse(
    () => createPrivateKey(key),
    `TLS_KEY_PATH=${keyPath} is not a private key (passphrase-protected keys are unsupported)`,
  );

  if (!certificate.checkPrivateKey(privateKey)) {
    throw new Error(
      `TLS_KEY_PATH=${keyPath} is not the private key for TLS_CERT_PATH=${certPath}`,
    );
  }

  return { key, cert };
}

function read(path: string, envVar: string): Buffer {
  try {
    return readFileSync(path);
  } catch (error) {
    throw new Error(`Failed to read ${envVar}=${path}: ${message(error)}`);
  }
}

function parse<T>(fn: () => T, context: string): T {
  try {
    return fn();
  } catch (error) {
    throw new Error(`${context}: ${message(error)}`);
  }
}

function message(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
