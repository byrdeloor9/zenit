# Budget App Frontend

React + TypeScript + Vite frontend for Budget App.

## Features

- Fully typed with TypeScript in strict mode
- Modern UI with Tailwind CSS
- Dashboard with real-time statistics
- Responsive design

## Tech Stack

- React 18
- TypeScript 5.3+ (strict mode)
- Vite 5
- Tailwind CSS
- Axios for API calls

## Setup

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm run dev
```

The app will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

## Project Structure

```
src/
├── api/              # API client and services
│   └── api.ts
├── components/       # React components
│   └── Dashboard.tsx
├── types.ts          # TypeScript type definitions
├── App.tsx           # Main App component
├── main.tsx          # Entry point
└── index.css         # Global styles
```

## API Integration

The frontend connects to the Django backend at `http://localhost:8000/api`

Main endpoints:
- `GET /api/dashboard/` - Dashboard statistics
- `GET /api/health/` - Health check

## Type Safety

All code follows strict TypeScript rules:
- No implicit any
- Strict null checks
- Explicit return types for functions
- Full type coverage

## Development

### Type Checking

```bash
npm run build
```

This will run TypeScript compiler in check mode.

### Linting

```bash
npm run lint
```

