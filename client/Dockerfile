# ================================
# 🛠️ Build stage
# ================================
FROM node:18-alpine AS builder

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copy file cấu hình cần thiết trước khi install
COPY package.json pnpm-lock.yaml ./ 
COPY tsconfig*.json ./ 
COPY next.config.mjs ./
COPY public ./public
COPY styles ./styles

# Install tất cả dependencies (bao gồm dev)
RUN pnpm install

# Sao chép mã nguồn còn lại
COPY . .

# Build ứng dụng Next.js
RUN pnpm build

# ================================
# 🚀 Production stage
# ================================
FROM node:18-alpine

RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Chỉ copy những gì cần thiết cho production
COPY package.json pnpm-lock.yaml ./
RUN pnpm install

# Copy build output từ builder
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/next.config.mjs ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package.json ./package.json

EXPOSE 3000

# Chạy app bằng pnpm
CMD ["pnpm", "start"]
