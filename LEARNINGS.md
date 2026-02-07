# Learnings

## Optimization: N+1 Inserts to createMany
When optimizing database inserts in Prisma, replacing a loop of `create` calls with `createMany` can significantly improve performance by reducing round-trips to the database.

### Implementation Pattern
**Before:**
```typescript
for (const item of items) {
  await tx.model.create({ data: { ...item } });
}
```

**After:**
```typescript
const data = items.map(item => ({ ...item }));
await tx.model.createMany({ data });
```

### Verification
- Ensure that any data transformations or lookups done inside the loop can be done upfront (e.g., using a Map).
- Verify that `createMany` is supported by the database provider (e.g., Postgres supports it, SQLite supports it in recent versions).

## Troubleshooting: Database Benchmarking
- When running benchmarks in restricted environments (e.g., no Docker pull access), it may be impossible to spin up a fresh database container.
- Always check `schema.prisma` for supported providers.
- If empirical benchmarking is impossible, rely on theoretical justification (e.g., batch insert efficiency) and verify code correctness via type checking (`npm run build`).

## TypeScript Fixes
- Fixed type mismatch in `admin.controller.ts` where `req.params` was inferred as `string | string[]` causing build failure. Explicit casting or type narrowing is required.
