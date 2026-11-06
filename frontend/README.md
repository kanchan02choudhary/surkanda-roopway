# Surkanda Devi Ropeway — Frontend

React 18 + Vite + React Router multi-page frontend.

## Run
```bash
npm install
cp .env.example .env
npm run dev
npm run build
```
Set `VITE_API_URL` to your Express backend API URL including `/api` (local: `http://localhost:5000/api`; production: `https://YOUR-BACKEND-DOMAIN/api`). Configure it in the frontend host and redeploy after changing it. The backend must allow the exact frontend origin through its `FRONTEND_URL` environment variable.

The booking page uses the backend to create Razorpay orders and verify payments. The contact form submits to the backend and does not open the visitor's email application.
