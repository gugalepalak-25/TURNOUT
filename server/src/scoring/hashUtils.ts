import crypto from 'crypto';

/**
 * Deterministically sort keys of an object recursively to produce canonical JSON
 */
export function canonicalStringify(obj: any): string {
  if (obj === null || typeof obj !== 'object') {
    return JSON.stringify(obj);
  }

  if (Array.isArray(obj)) {
    return '[' + obj.map((item) => canonicalStringify(item)).join(',') + ']';
  }

  const sortedKeys = Object.keys(obj).sort();
  const entries = sortedKeys.map((key) => {
    return JSON.stringify(key) + ':' + canonicalStringify(obj[key]);
  });

  return '{' + entries.join(',') + '}';
}

/**
 * Compute SHA-256 evidence hash from canonical JSON
 */
export function computeEvidenceHash(evidencePayload: Record<string, any>): {
  evidenceHash: string;
  canonicalJson: string;
} {
  const canonicalJson = canonicalStringify(evidencePayload);
  const hash = crypto.createHash('sha256').update(canonicalJson, 'utf8').digest('hex');
  return {
    evidenceHash: hash,
    canonicalJson,
  };
}

