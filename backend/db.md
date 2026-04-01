## Database Setup (Neon PostgreSQL)

1. Create `backend/.env` from `backend/.env.example`.
2. Set `DATABASE_URL` to your Neon connection string.
3. Run migration:

```bash
npm run db:migrate
```

Recommended `.env` value format:

```env
DATABASE_URL=postgresql://<user>:<password>@<host>/<database>?sslmode=require
```
