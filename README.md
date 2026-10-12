# Strecklista

The frontend for a "strecklista" (a tally list for the shop), originally developed for <a href="https://prit.chalmers.it/">P.R.I.T.</a>

[![Last Commit][last-commit-shield]][last-commit-url]
[![Build Status][build-shield]][build-url]
[![Test Coverage][coverage-shield]][coverage-url]
[![Repo Size][repo-size-shield]][repo-size-url]
[![Author][author-shield]][author-url]

<!-- Add a screenshot of the shop page here, e.g. docs/screenshot.png -->
<!-- ![Shop page](docs/screenshot.png) -->

# Index

1. [About the project](#about-the-project)
1. [Features](#features)
1. [Built with](#built-with)
1. [Getting started](#getting-started)
1. [Configuration](#configuration)
1. [Scripts](#scripts)
1. [Testing](#testing)
1. [Deployment](#deployment)
1. [Contributing](#contributing)
1. [Authors](#authors)
1. [Acknowledgments](#acknowledgments)

# About the project
Strecklista is a digital tally system for small communities, such as those at Chalmers Student Union. It runs on a display in shared community spaces, showing real-time inventory counts and enabling barcode-scanner purchases from the shop.

This repository contains **only the frontend**. It needs the backend, [prit-streck-backend](https://github.com/olillin/prit-streck-backend) by olillin, which stores users, items, balances and transactions and handles authentication.

## Built with
![Vite][vite-shield]
![React][react-shield]
![TypeScript][typescript-shield]
![Vitest][vitest-shield]
![Docker][docker-shield]

## Features
- Shop with barcode-scanner purchases
- Inventory management: add, edit, refill and favourite items
- Balances and deposits, with Swish QR codes for payment
- Transaction history with search and filters
- Login as a user (OAuth2 through Gamma) or as a client (ID and secret) for shared screens
- "Remember me" for clients, with automatic session renewal
- Client management with scopes
- Command console for quick actions
- Customizable colour theme
- Detects when the backend is unreachable



# Getting started

You need [Node.js](https://nodejs.org/) 20 or newer and a running backend.

```sh
# Clone the repository
git clone https://github.com/erikpersson0884/strecklista.git

# Navigate into the project directory
cd strecklista

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app runs on [http://localhost:3000](http://localhost:3000). Requests to `/api` are proxied to the backend.

# Configuration

Using a .env file is optional, everything will work without one and having it is simply for extra configuration during development. Copy `.env.example` to `.env` to change the defaults.

| Variable | Default | Description |
|---|---|---|
| `API_URL` | `http://localhost:8080` | URL of the backend that `/api` is proxied to in development |

# Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server on port 3000 |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run test` | Run the tests in watch mode |
| `npm run test:coverage` | Run the tests once and print a coverage report (HTML report in `coverage/`) |

# Testing

Tests use [Vitest](https://vitest.dev/) and Testing Library. They cover the API layer, adapters, contexts and utilities.

```sh
npm run test:coverage
```

The coverage badge is updated by a GitHub Actions workflow on every push to `main`.

# Deployment

The repository includes a `Dockerfile`, a `docker-compose.yml` and an `nginx.conf`. The app is built into static files and served by nginx.

```sh
docker compose up --build
```

The app is then available on [http://localhost:3000](http://localhost:3000) (host port 3000 maps to port 80 in the container).

**The backend must be running on the same Docker network, reachable as `strecklista-backend` on port 8080.** nginx looks this name up when it starts and will not start without it. To use a different backend, change `proxy_pass` in `nginx.conf`.

## How nginx is configured

- **Static files:** the built app is served from `/usr/share/nginx/html`.
- **Page reloads and deep links:** `try_files $uri $uri/ /index.html` falls back to `index.html` for any path that isn't a file, so client-side routes such as `/inventory` or the login callback work on reload instead of returning 404.
- **API proxy:** requests to `/api/` are forwarded to `http://strecklista-backend:8080/`. The trailing slash removes the `/api` prefix (`/api/group` becomes `/group`), the same as the Vite dev proxy. The browser talks to a single origin, so no CORS setup is needed.
- **Forwarded headers:** `Host`, `X-Real-IP`, `X-Forwarded-For` and `X-Forwarded-Proto` are passed on, so the backend sees the original host, client IP and whether the request used HTTPS.

# Contributing
If you want to contribute, follow these steps:

1. Fork the repository
2. Create a new branch (`git checkout -b feature-branch`)
3. Make your changes and run the tests (`npm run test:coverage`)
4. Commit your changes (`git commit -m 'Add new feature'`)
5. Push to the branch (`git push origin feature-branch`)
6. Create a Pull Request

<!-- # Licence -->

# Authors
- <a href="https://erikpersson0884.github.io/portfolio">Erik Persson</a> 🐦

# Acknowledgments
- <a href="https://github.com/Adenholm">Hanna Adenholm</a> for contributing a lot to the remake of the design
- <a href="https://github.com/olillin">Cal</a> for developing the backend this application uses






<!-- Repo info Shields -->
[last-commit-shield]: https://img.shields.io/github/last-commit/erikpersson0884/strecklista/main?style=for-the-badge&cacheSeconds=30
[last-commit-url]: https://github.com/erikpersson0884/strecklista/commits/main

[repo-size-shield]: https://img.shields.io/github/repo-size/erikpersson0884/strecklista?style=for-the-badge&cacheSeconds=60
[repo-size-url]: https://github.com/erikpersson0884/strecklista

[author-shield]: https://img.shields.io/badge/Author-Erik%20Persson-blue?style=for-the-badge
[author-url]: https://github.com/erikpersson0884

[build-shield]: https://img.shields.io/github/actions/workflow/status/erikpersson0884/strecklista/frontend-tests.yml?branch=main&style=for-the-badge
[build-url]: https://github.com/erikpersson0884/strecklista/actions


<!-- Frameworks & Languages Shields -->
[vite-shield]: https://img.shields.io/badge/Vite-646CFF?logo=Vite&logoColor=white&style=for-the-badge
[react-shield]: https://img.shields.io/badge/React-61DAFB?logo=react&logoColor=white&style=for-the-badge
[vitest-shield]: https://img.shields.io/badge/Vitest-3E7CFF?logo=vitest&logoColor=white&style=for-the-badge
[docker-shield]: https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=for-the-badge
[typescript-shield]: https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=for-the-badge


<!-- Test Coverage Shields -->
[coverage-shield]: https://img.shields.io/endpoint?url=https://raw.githubusercontent.com/erikpersson0884/strecklista/coverage/.github/coverage.json&style=for-the-badge&v=2
[coverage-url]: https://github.com/erikpersson0884/strecklista/actions