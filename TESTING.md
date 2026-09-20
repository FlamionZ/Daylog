# Testing Guide — Internship Companion

## Test Stack

| Tool | Purpose |
|---|---|
| Vitest | Unit & integration tests |
| React Testing Library | Component tests |
| Playwright | End-to-end tests |

## Running Tests

```bash
# Unit & integration tests
pnpm test

# Watch mode (during development)
pnpm test:watch

# End-to-end tests
pnpm test:e2e

# All checks
pnpm lint && pnpm typecheck && pnpm test && pnpm build
```

## Test Structure

```
src/
├── lib/__tests__/        # Utility unit tests
├── features/*/tests/     # Feature-specific tests
└── server/tests/         # Server-side integration tests
e2e/                      # Playwright E2E tests
```

## Writing Tests

### Unit Tests

Test pure logic in `src/lib/` and domain services:

```typescript
import { describe, it, expect } from 'vitest';
import { calculateWorkedMinutes } from '@/lib/date';

describe('calculateWorkedMinutes', () => {
  it('deducts break from total', () => {
    const checkIn = new Date('2026-09-20T01:00:00Z');
    const checkOut = new Date('2026-09-20T09:00:00Z');
    expect(calculateWorkedMinutes(checkIn, checkOut, 60)).toBe(420);
  });
});
```

### E2E Tests

Located in `e2e/`. Playwright auto-starts the dev server.

```typescript
import { test, expect } from '@playwright/test';

test('user can navigate to dashboard', async ({ page }) => {
  await page.goto('/dashboard');
  await expect(page.getByText('Dashboard')).toBeVisible();
});
```

## Coverage

```bash
pnpm test -- --coverage
```

Coverage reports are generated in `coverage/` directory.
