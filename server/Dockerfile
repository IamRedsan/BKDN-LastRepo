# Stage 1: Build
FROM node:20-alpine AS builder

WORKDIR /app

# Cài pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy và cài dependencies
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --frozen-lockfile

# Copy source code và build
COPY . .
RUN pnpm build

# Stage 2: Production image
FROM node:20-alpine

WORKDIR /app

# Cài pnpm cho runtime nếu cần (nếu chỉ dùng node thì có thể bỏ)
RUN corepack enable && corepack prepare pnpm@latest --activate

# Copy build output và node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
