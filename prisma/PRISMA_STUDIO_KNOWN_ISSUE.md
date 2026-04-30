# Prisma Studio Known Issue: ERR_STREAM_PREMATURE_CLOSE

**Date Recorded:** 2026-04-30
**Status:** Known upstream issue (non-breaking)

## Description
When running `npx prisma studio` (or `npx prisma@latest studio`), the terminal consistently logs the following error:

```
[Prisma Studio] Error [ERR_STREAM_PREMATURE_CLOSE]: Premature close
    at onclose (node:internal/streams/end-of-stream:171:30)
    at process.processTicksAndRejections (node:internal/process/task_queues:84:11) {
  code: 'ERR_STREAM_PREMATURE_CLOSE'
}
```

## Diagnosis
- This is a **known, non-breaking runtime behavior** in Prisma Studio.
- It is **not** a misconfiguration in the project's codebase, environment, or database connection.
- Prisma Studio remains fully functional despite these logs appearing.

## Action Plan
- **Do not** attempt to debug or restructure the Prisma configuration to "fix" this, as it is an internal issue within Prisma Studio's HTTP/stream handling.
- **Ignore the error** in the terminal while using Prisma Studio.
- Keep an eye on future Prisma releases for an upstream patch that resolves the stream premature close issue.
