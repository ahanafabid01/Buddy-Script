# System Summary (AppifyLab Selection Task)

## Overview
This project is a full-stack social feed system with authentication, post publishing, threaded comments/replies, media uploads, and reaction workflows.

Tech stack:
- Backend: Node.js, Express, PostgreSQL
- Frontend: React, React Router, Vite
- Auth: JWT in secure cookie

## What We Built

### 1) Authentication and Session Flow
- Register, login, logout, and current-user bootstrap endpoints.
- JWT is stored in HttpOnly cookie.
- CSRF token cookie is issued and validated for unsafe requests.

### 2) Feed and Post Features
- Create post with text and optional image.
- Public/private post visibility support.
- Feed loading with cursor pagination.
- Single post fetch endpoint for detail pages.

### 3) Comment and Reply Features
- Add top-level comments and nested replies.
- Text-or-image comments/replies are supported.
- Default collapsed replies with expand/collapse controls.
- Paginated loading for top-level comments.

### 4) Reactions (Persisted by Type)
- Reaction types supported: like, love, care, haha, wow, sad, angry.
- Reaction type is persisted in DB for posts and comments.
- Toggle logic behavior:
  - selecting same reaction again removes reaction
  - selecting a different reaction updates type
- Aggregated reaction counts are returned per type.

### 5) Reactions Pages
- Post reactions page with:
  - "People who have reacted" header
  - all + per-reaction filters
- Comment reactions page with the same filter behavior.

### 6) Media and Uploads
- Upload support for post/comment/reply images.
- Preview and remove image before submit.
- Validation for file type and size.

### 7) Responsive UX Enhancements
- Dedicated post comments page for mobile comment navigation.
- Feed cards on large screens show cleaner comment preview behavior.
- Comment action row layout refined for cleaner alignment.
- Story "Your Story" + badge consistency across desktop/mobile.

## Security Decisions
- Helmet enabled (with cross-origin resource policy adjustment for media).
- CORS restricted to configured frontend origin.
- Global and auth-specific rate limits.
- CSRF protection middleware enabled.
- x-powered-by header disabled.

## Scalability and Data Decisions
- Denormalized counters used on posts/comments (like/comment/reply counts).
- Cursor-based pagination for feed and comments.
- DB indexes added for feed ordering, reactions, and thread traversal.
- SQL schema includes backfill/update steps for counters.

## API Design Notes
- Feed routes are protected behind auth middleware.
- Reaction toggle endpoints accept `reactionType` to persist exact user intent.
- Dedicated reaction list endpoints:
  - GET /api/feed/posts/:postId/reactions
  - GET /api/feed/comments/:commentId/reactions

## Key Product/Engineering Decisions
- Keep existing visual language from provided template and refine instead of redesigning from scratch.
- Introduce dedicated detail pages for dense mobile interactions (comments/reactions).
- Persist reaction type in DB to avoid UI-only reaction state drift.
- Keep feed cards lightweight while allowing deep interaction pages for full detail.

## Current State
- Core social flow is functional end-to-end.
- Build is passing after the latest changes.
- Remaining polish can focus on design micro-details and QA edge cases.
