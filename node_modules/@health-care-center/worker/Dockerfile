FROM node:20-alpine AS base
WORKDIR /app
RUN apk add --no-cache libc6-compat

FROM base AS builder
COPY package*.json ./
COPY packages ./packages
COPY apps/worker ./apps/worker
RUN npm ci --prefer-offline --no-audit
RUN npm run build --workspace=@health-care-center/shared
RUN npm run build --workspace=@health-care-center/worker

FROM base AS runner
ENV NODE_ENV=production
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 nodejs

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/packages/shared/dist ./packages/shared/dist
COPY --from=builder /app/packages/shared/package.json ./packages/shared/package.json
COPY --from=builder /app/apps/worker/dist ./apps/worker/dist
COPY --from=builder /app/apps/worker/package.json ./apps/worker/package.json

USER nodejs
CMD ["node", "apps/worker/dist/index.js"]
