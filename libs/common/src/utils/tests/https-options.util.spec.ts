import { mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { generateKeyPairSync } from 'node:crypto';
import { loadHttpsOptions } from '../https-options.util';

describe('loadHttpsOptions', () => {
  const originalKeyPath = process.env.TLS_KEY_PATH;
  const originalCertPath = process.env.TLS_CERT_PATH;
  let dir: string;

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'tls-opts-'));
  });

  beforeEach(() => {
    delete process.env.TLS_KEY_PATH;
    delete process.env.TLS_CERT_PATH;
  });

  afterAll(() => {
    process.env.TLS_KEY_PATH = originalKeyPath;
    process.env.TLS_CERT_PATH = originalCertPath;
  });

  function write(name: string, contents: string): string {
    const path = join(dir, name);
    writeFileSync(path, contents);
    return path;
  }

  describe('opt-in behaviour', () => {
    it('should return undefined when neither env var is set', () => {
      expect(loadHttpsOptions()).toBeUndefined();
    });

    it('should return undefined when only the key path is set', () => {
      process.env.TLS_KEY_PATH = write('lonely-key.pem', 'whatever');

      expect(loadHttpsOptions()).toBeUndefined();
    });

    it('should return undefined when only the cert path is set', () => {
      process.env.TLS_CERT_PATH = write('lonely-cert.pem', 'whatever');

      expect(loadHttpsOptions()).toBeUndefined();
    });
  });

  describe('unreadable files', () => {
    it('should throw naming the env var when the key is missing', () => {
      process.env.TLS_KEY_PATH = join(dir, 'does-not-exist.pem');
      process.env.TLS_CERT_PATH = write('any-cert.pem', 'whatever');

      expect(() => loadHttpsOptions()).toThrow(/TLS_KEY_PATH=.*does-not-exist/);
    });

    it('should throw naming the env var when the cert is missing', () => {
      process.env.TLS_KEY_PATH = write('any-key.pem', 'whatever');
      process.env.TLS_CERT_PATH = join(dir, 'absent-cert.pem');

      expect(() => loadHttpsOptions()).toThrow(/TLS_CERT_PATH=.*absent-cert/);
    });
  });

  describe('malformed material', () => {
    it('should reject a cert file that is not a certificate', () => {
      process.env.TLS_KEY_PATH = write('k1.pem', 'not a key');
      process.env.TLS_CERT_PATH = write('c1.pem', 'definitely not a cert');

      expect(() => loadHttpsOptions()).toThrow(/is not an X.509 certificate/);
    });

    it('should reject an empty cert file', () => {
      process.env.TLS_KEY_PATH = write('k2.pem', 'not a key');
      process.env.TLS_CERT_PATH = write('c2.pem', '');

      expect(() => loadHttpsOptions()).toThrow(/is not an X.509 certificate/);
    });

    // The swapped-paths case: a private key in TLS_CERT_PATH is well-formed PEM
    // but not a certificate, which readFileSync alone would happily accept.
    it('should reject a private key handed to TLS_CERT_PATH', () => {
      const { privateKey } = generateKeyPairSync('rsa', {
        modulusLength: 2048,
        publicKeyEncoding: { type: 'spki', format: 'pem' },
        privateKeyEncoding: { type: 'pkcs8', format: 'pem' },
      });
      process.env.TLS_KEY_PATH = write('k3.pem', privateKey);
      process.env.TLS_CERT_PATH = write('c3.pem', privateKey);

      expect(() => loadHttpsOptions()).toThrow(/is not an X.509 certificate/);
    });
  });
});
