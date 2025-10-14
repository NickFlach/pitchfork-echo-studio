# Managed PaaS Deployment Notes

Examples: Render, Fly.io, Railway, Heroku (container), Azure Web Apps, GCP Cloud Run.

- Build: container image using Dockerfile (multi-stage). Expose port 8080 (frontend) and 3001 (API) or split services.
- Env/Secrets: map `DATABASE_URL`, `JWT_SECRET`, `ENCRYPTION_KEY`, provider keys, `ALLOWED_ORIGINS`, `VITE_API_URL`.
- Health checks: API `/ready` and `/health`, Frontend `/`.
- Persistent storage: Postgres add-on; Redis add-on; IPFS external service.
- Scale: set min instances=1, enable auto-restart on health failure.

For Cloud Run
- `--port 3001` for API service, `--port 8080` for frontend service.
- Min instances 1, CPU 1, memory 512–1024Mi.
