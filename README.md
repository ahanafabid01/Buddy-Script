# AppifyLab Full Stack Selection Task

A full stack social feed application built with React, Express, and PostgreSQL.

The project includes:
- Secure authentication with HTTP-only JWT cookies
- CSRF protection for state-changing requests
- Feed posts with optional image attachments
- Nested comments and comment image support
- Post and comment reactions with multiple reaction types
- Cursor-based pagination for scalable feed loading
- Responsive UI with dedicated mobile-friendly pages

## Tech Stack

### Frontend
- React 19
- React Router 7
- Vite 8

### Backend
- Node.js + Express 5
- PostgreSQL (pg)
- Multer + Sharp for image handling
- Helmet, CORS, rate limiting, cookie-parser

## Repository Structure

```text
.
|- backend
|  |- package.json
|  |- sql/schema.sql
|  |- src
|     |- app.js
|     |- index.js
|     |- config/env.js
|     |- db/pool.js
|     |- middleware
|     |- routes
|     |- services
|     |- utils
|- frontend
|  |- package.json
|  |- vite.config.js
|  |- src
|     |- App.jsx
|     |- api
|     |- context
|     |- pages
|     |- styles
|- render.yaml
```

## Prerequisites

- Node.js 20+
- npm 10+
- PostgreSQL 14+

## Environment Variables

Create backend & frontend environment files.

## Local Development Setup

1. Install dependencies

	 Backend:

	 ```bash
	 cd backend
	 npm install
	 ```

	 Frontend:

	 ```bash
	 cd frontend
	 npm install
	 ```

2. Initialize the database schema

	 From backend:

	 Bash:

	 ```bash
	 psql "$DATABASE_URL" -f sql/schema.sql
	 ```

	 PowerShell:

	 ```powershell
	 psql $env:DATABASE_URL -f sql/schema.sql
	 ```

3. Start the backend server

	 ```bash
	 cd backend
	 npm run dev
	 ```

4. Start the frontend server (in a new terminal)

	 ```bash
	 cd frontend
	 npm run dev
	 ```

5. Open the app at:

	 http://localhost:5173

## Available Scripts

### Backend
- npm run dev: Start backend with nodemon
- npm start: Start backend in production mode
- npm run db:migrate: Configured in package.json, but currently no migration script file exists in backend/scripts. Use sql/schema.sql directly or add your migration runner.

### Frontend
- npm run dev: Start Vite dev server
- npm run build: Build production assets
- npm run preview: Preview production build

## API Overview

Base URL: /api

### Health
- GET /health

### Authentication
- POST /auth/register
- POST /auth/login
- POST /auth/logout
- GET /auth/me

### Feed
- GET /feed/posts
- POST /feed/posts
- GET /feed/posts/:postId
- POST /feed/posts/:postId/likes/toggle
- GET /feed/posts/:postId/reactions
- GET /feed/posts/:postId/comments
- POST /feed/posts/:postId/comments
- POST /feed/comments/:commentId/likes/toggle
- GET /feed/comments/:commentId/reactions

## Security Notes

- JWT auth uses secure HTTP-only cookies.
- CSRF protection is enabled for all non-safe methods except:
	- POST /api/auth/login
	- POST /api/auth/register
- CORS is allowlisted via CLIENT_ORIGIN.
- Helmet and rate limiting are enabled globally.

## Deployment

A Render blueprint is included in render.yaml for backend deployment.

Important:
- The Render start command runs npm run db:migrate before npm start.
- Ensure your migration script exists, or change the start command to your preferred migration method.
- Set DATABASE_URL to a real managed Postgres connection string in production.
