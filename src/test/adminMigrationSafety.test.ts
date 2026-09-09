import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
const source = (path: string) => readFileSync(fileURLToPath(new URL(path, import.meta.url)), 'utf8');
describe('post-migration Admin safeguards', () => {
  it('does not present legacy DNS or deploy steps as current instructions', () => {
    const migration = source('../pages/admin/AdminMigration.tsx');
    expect(migration).not.toContain('185.158.133.1');
    expect(migration).not.toContain('docs.lovable.dev');
    expect(migration).toContain('Guía antigua retirada');
    expect(migration).not.toMatch(/\.update\(|\.delete\(|\.insert\(/);
  });
  it('copies identifiers without claiming to configure secret values', () => {
    const keys = source('../pages/admin/AdminApiKeys.tsx');
    expect(keys).not.toContain('Lovable Cloud → Secretos');
    expect(keys).not.toContain('docs.lovable.dev');
    expect(keys).toContain('Copiar nombre');
    expect(keys).toContain('no demuestra que se esté utilizando');
    expect(keys).toContain('Sin verificar');
  });
});
