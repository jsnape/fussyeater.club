---
applyTo: "**/*.ts,**/*.tsx"
---

## TypeScript Conventions

- TypeScript strict mode is enabled — no implicit `any`
- Prefer `type` over `interface`; never use `enum` (use string literal unions instead)
- Don't use `any` without explicit justification
- Use descriptive variable names; keep functions small and focused
- Handle errors explicitly — don't swallow them
- Don't make breaking API changes without discussion

## Testing

- **Framework**: Vitest with jsdom environment
- Test files co-located with source: `*.test.ts` next to the module under test
- Use `vi.fn()` and `vi.stubGlobal()` for mocking (Vitest built-ins)
- Test names use descriptive strings: `it('should return data on success', ...)`
- Arrange-Act-Assert pattern for test structure
- Write tests for new functionality; don't commit without running tests first
