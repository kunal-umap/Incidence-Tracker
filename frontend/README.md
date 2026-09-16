# Enterprise Frontend Client

React 19 & TypeScript frontend application configured with Tailwind CSS, Vite, and containerized with Docker & Nginx.

## Features
- Containerized development with live hot-reload (`Dockerfile` target: `development`).
- Production-ready lightweight Nginx image with reverse proxy to `http://backend:8000/api/` (`Dockerfile` target: `production`).
- Integrated JWT authentication management, token renewal, and AI agent execution console.

## Development
```bash
# Inside docker
docker compose up frontend

# Or standalone locally
npm install
npm run dev
```
