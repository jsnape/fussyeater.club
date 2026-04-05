import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('generated api types', () => {
    it('should contain auth, registration, and invite endpoint path definitions', () => {
        const contents = readFileSync(join(process.cwd(), 'src/lib/api-types.d.ts'), 'utf8');

        expect(contents).toContain('"/api/auth/login"');
        expect(contents).toContain('"/api/auth/session"');
        expect(contents).toContain('"/api/invites/redeem"');
        expect(contents).toContain('"/api/register/complete"');
        expect(contents).toContain('"/api/households/invites"');
        expect(contents).toContain('"/api/households/invites/{inviteId}"');
    });
});
