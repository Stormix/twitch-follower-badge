# Twitch ~~Stalker~~ Follower Badge

A browser extension that allows you to see if someone follows you on Twitch right on their profile.

## Project Structure

This is a monorepo containing the following packages:

- `apps/extension`: Browser extension built with Plasmo
- `apps/server`: Backend server built with Bun, Hono, and DrizzleORM
- `packages/eslint-config`: Shared ESLint configuration
- `packages/typescript-config`: Shared TypeScript configuration

## Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS version)
- [pnpm](https://pnpm.io/) (Package manager)
- [Bun](https://bun.sh/) (For running the server)
- [Docker](https://www.docker.com/) (For local development)
- [mise](https://mise.jdx.dev/) (Runtime version manager - recommended)

## Getting Started

1. Install dependencies:

```bash
pnpm install
```

2. Set up environment variables:

Create `.env` files in both `apps/server` and `apps/extension` directories with the required variables:

For server:

```env
PORT=3000
DATABASE_URL=
JWT_SECRET=
TWITCH_CLIENT_ID=
REDIS_URL=redis://localhost:6379
```

For extension:

```env
PLASMO_PUBLIC_BACKEND_URL=
PLASMO_PUBLIC_TWITCH_CLIENT_ID=
PLASMO_PUBLIC_EXTENSION_ID=
```

3. Start the development database:

```bash
pnpm db:up
```

4. Run database migrations:

```bash
cd apps/server
pnpm db:push
```

5. Start the development server:

```bash
cd apps/server
pnpm dev
```

6. Start the extension development:

```bash
cd apps/extension
pnpm dev
```

## Development

- `pnpm lint`: Run ESLint across all packages
- `pnpm format`: Run Prettier across all packages
- `pnpm extension:dev`: Start extension development
- `pnpm db:up`: Start development database
- `pnpm db:down`: Stop development database

## Building for Production

### Extension

```bash
cd apps/extension
pnpm build
pnpm package
```

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License.

