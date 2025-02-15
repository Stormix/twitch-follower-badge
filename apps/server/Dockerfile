FROM node:23.8.0-slim AS base

WORKDIR /app

RUN npm install -g corepack bun

# Copy root workspace files
COPY package.json .
COPY pnpm-workspace.yaml .
COPY pnpm-lock.yaml .

# Copy the server package and shared packages
COPY apps/server ./apps/server
COPY packages ./packages

# Install dependencies
RUN corepack install
RUN pnpm install --frozen-lockfile

# Set working directory to the server package
WORKDIR /app/apps/server

# Expose port
EXPOSE 3000

# Start the server
CMD ["bun", "run", "start"]
