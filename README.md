# Nuxt Minimal Starter

Look at the [Nuxt documentation](https://nuxt.com/docs/getting-started/introduction) to learn more.

## Setup

Make sure to install dependencies:

```bash
# npm
npm install

# pnpm
pnpm install

# yarn
yarn install

# bun
bun install
```

## Development Server

Start the development server on `http://localhost:3000`:

```bash
# npm
npm run dev

# pnpm
pnpm dev

# yarn
yarn dev

# bun
bun run dev
```

## Production

Build the application for production:

```bash
# npm
npm run build

# pnpm
pnpm build

# yarn
yarn build

# bun
bun run build
```

Locally preview production build:

```bash
# npm
npm run preview

# pnpm
pnpm preview

# yarn
yarn preview

# bun
bun run preview
```

Check out the [deployment documentation](https://nuxt.com/docs/getting-started/deployment) for more information.

## Environment Variables

Configure a database connection via a `.env` file (loaded by Nitro on the server-side). Copy `.env.example` to `.env` and set:

- `DB_HOST`: MySQL host
- `DB_USER`: MySQL username
- `DB_PASS`: MySQL password
- `DB_NAME`: Database name

A connection pool is created in `api/database.ts` and used by server API handlers (e.g. `server/api/users.get.ts`). Keep credentials only in `.env`; avoid hard-coded defaults.
