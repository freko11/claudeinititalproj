# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev          # start dev server (Turbopack) at http://localhost:3000
npm run build        # production build
npm run lint         # ESLint
npx tsc --noEmit     # type-check without emitting

npx prisma migrate dev --name <name>   # create and apply a new migration
npx prisma generate                    # regenerate Prisma Client after schema changes
npx prisma studio                      # open browser GUI for the SQLite database
```

No test suite exists yet.

## Keeping this file current

Update this file whenever you make changes that affect how a future Claude instance would need to understand or work in this repo — new routes, schema changes, new components, changed conventions, added dependencies, etc. Do this in the same commit as the code change so the two never drift apart.

## Git workflow

After completing any meaningful unit of work, commit and push to GitHub so progress is never lost:

```bash
git add <specific files>
git commit -m "short imperative summary"
git push
```

- Commit after each logical step (feature added, bug fixed, schema changed, etc.) — not just at the end of a session.
- Stage specific files rather than `git add .` to avoid committing `.env`, `uploads/`, or `prisma/dev.db`.
- Keep commit messages in the imperative mood and scoped to what changed (e.g. `add comment resolve API`, `fix TipTap setContent type error`).
- Always push after committing — the remote on GitHub is the source of truth for persisted work.

## Architecture

**Full-stack Next.js 16 app** (App Router) with server components fetching data directly via Prisma, and client components for interactive UI. No separate backend.

### Data flow

- **Server pages** (`src/app/**/page.tsx`) query Prisma directly and pass serialised data as props to client components. Pages use `export const dynamic = "force-dynamic"` to prevent caching.
- **API routes** (`src/app/api/**`) handle all mutations (upload, PATCH, DELETE, POST). Client components call these via `fetch`.
- **Database**: SQLite via Prisma 5 (`prisma/dev.db`). Schema in `prisma/schema.prisma`. Singleton client in `src/lib/prisma.ts` (globalThis pattern for dev hot-reload safety).
- **Uploaded files** are stored on disk in `/uploads/` (gitignored). The filename stored in `Document.filePath` is `${timestamp}-${originalName}`. Files are served back through `/api/files/[filename]`.

### Document status lifecycle

`draft` → `pending_review` → `approved` | `rejected`
                ↓ (recall)
             `draft`

- Users submit via `PATCH /api/documents/:id` `{status:"pending_review"}`.
- Users can recall a document under review via `PATCH /api/documents/:id` `{status:"draft"}`, unlocking it for further edits.
- Approvers approve/reject via `POST /api/documents/:id/approvals`, which also updates `Document.status`.
- Editing in the TipTap editor is locked unless `role === "user"` and `status === "draft"`. Both `pending_review` and `approved` show a locked editor with a status banner.

### Role system

There is no authentication. Role (`"user"` | `"approver"`) is stored in `localStorage` under the key `docflow-role` and toggled via the navbar. The `useRole()` hook (`src/hooks/use-role.ts`) is the single source of truth. Client components import this hook to gate UI (delete button, comment input, approval panel).

### Key components

| Component | Purpose |
|---|---|
| `DocumentWorkspace` | Main client component for `/documents/[id]`. Single-view layout: full-width inline editor with a toolbar (title, status, Save/Submit actions) and a collapsible right sidebar (Comments, History, Approval tabs). |
| `RichEditor` | TipTap wrapper — requires `'use client'`. Outputs HTML string via `onChange`. |
| `useRole` | localStorage-backed hook; always initialises as `"user"` on first render to avoid SSR hydration mismatch. |

### DOCX handling

mammoth.js runs **server-side** in the upload route (`src/app/api/documents/upload/route.ts`) to extract plain text into `Document.content` at upload time. The original file is stored on disk but is no longer shown in the document workspace (the split-panel viewer was removed). PDFs get an empty `content` field; users type the working copy into the TipTap editor manually.

### Node.js version

Running Node.js **24**. Prisma 5 is still in use (was pinned when Node was 20.10); it can be upgraded to Prisma 7 at any time now that the Node constraint is gone.

### Tailwind / shadcn

Tailwind v4 — no `tailwind.config.js`; theme tokens live in `src/app/globals.css` via `@theme`. shadcn components are in `src/components/ui/` and are plain files (not a package), safe to edit directly.
