# Production build for a Next.js (app router) project
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --no-audit --no-fund

FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
# If you rely on NEXT_PUBLIC_* and other envs, they should be in .env at build time
RUN npm run build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
# Next.js standalone output (if using "output: 'standalone'" it's even slimmer; otherwise keep node_modules)
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY package*.json ./
COPY --from=deps /app/node_modules ./node_modules

# Next default port
EXPOSE 3000
CMD ["npm", "run", "start", "--", "-p", "3000"]
