# ================================
# 🛠️ Build stage
# ================================
FROM node:18-alpine AS builder

# Kích hoạt corepack và pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Thư mục làm việc
WORKDIR /app

# Sao chép các file cần thiết cho cài đặt trước khi copy toàn bộ
COPY package.json pnpm-lock.yaml ./ 
COPY tsconfig*.json ./ 

# Cài các dependency (bao gồm dev)
RUN pnpm install

# Sao chép toàn bộ mã nguồn
COPY . .

# Build project (Next.js, NestJS, v.v.)
RUN pnpm build

# ================================
# 🚀 Production stage
# ================================
FROM node:18-alpine

# Kích hoạt corepack + pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

# Thư mục chạy
WORKDIR /app

# Sao chép file lock và package để cài production dependencies
COPY package.json pnpm-lock.yaml ./

# Cài đặt chỉ production dependencies
RUN pnpm install --prod

# Copy toàn bộ từ build stage (bao gồm dist hoặc .next)
COPY --from=builder /app ./

# Lệnh chạy app
CMD ["pnpm", "start"]
