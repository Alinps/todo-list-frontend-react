# To-Do Frontend (React)

A modern task management frontend built with React.

This app includes:
- User authentication (login/register)
- Task creation (date + time)
- Dedicated task listing page with search, filter, edit, and pagination
- Profile management (view profile, edit profile, change password)
- Premium upgrade flow
- Admin login and dashboard pages
- Import/Export actions (CSV, JSON, TXT, PDF, SQL)

## Tech Stack

- React (Create React App)
- React Router
- Axios (with interceptor-based auth)
- Bootstrap + custom theme CSS
- React Toastify
- jsPDF

## Project Structure

- `src/components/` UI pages/components
- `src/context/` auth context
- `src/utils/` route guards (`PrivateRoute`, `AdminRoute`)
- `src/api.js` shared axios instance + auth interceptor
- `public/theme.css` global styling/theme

## Prerequisites

- Node.js 18+
- npm 9+
- Running backend API

## Setup

1. Install dependencies

```bash
npm install
```

2. Start development server

```bash
npm start
```

App runs at: `http://localhost:3000`

## Build

```bash
npm run build
```

## Test

```bash
npm test
```

## API Base URL

This frontend currently uses:

- `http://127.0.0.1:8000/api/`

Set in `src/api.js` (`baseURL`).

If your backend runs elsewhere, update that value.

## Authentication

Auth token is stored in `localStorage` and attached automatically by Axios interceptor:

- Header format: `Authorization: Token <token>`

## Main Routes

- `/` Landing page
- `/login` User login
- `/register` User registration
- `/tasks` Task form page (create tasks)
- `/tasks/list` Task listing page (search/filter/edit/pagination)
- `/about` About page
- `/profile` Profile page (view/edit/change password/upgrade)
- `/admin/login` Admin login
- `/admin/dashboard` Admin dashboard

## Profile Features

Profile page is integrated with:

- `GET /api/profile/me/`
- `PATCH /api/profile/update/`
- `POST /api/profile/change-password/`
- `POST /api/profile/upgrade_premium/`

## Notes

- Ensure backend CORS is configured for `http://localhost:3000`.
- Some features require authenticated users.
- After password change, backend may return a new token; frontend handles token refresh.
