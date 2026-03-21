FROM node:22-alpine AS base

# --- Dependencies ---
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci

# --- Builder ---
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

RUN node - <<'NODE_DIAGNOSTIC'
const fs = require('fs');
const path = require('path');

const packageName = '@tanstack/react-query';
const packageJsonPath = `${packageName}/package.json`;
const directPath = path.join(process.cwd(), 'node_modules', packageName);

console.log('[diagnostic] cwd =', process.cwd());
console.log('[diagnostic] node version =', process.version);
console.log('[diagnostic] direct path exists =', fs.existsSync(directPath), directPath);

try {
  const resolved = require.resolve(packageJsonPath);
  const pkg = require(resolved);
  console.log('[diagnostic] resolved package.json =', resolved);
  console.log('[diagnostic] package version =', pkg.version);
} catch (error) {
  console.error('[diagnostic] failed to resolve @tanstack/react-query/package.json before next build');
  console.error(error);
  process.exit(1);
}
NODE_DIAGNOSTIC

ENV NEXT_TELEMETRY_DISABLED=1

RUN npm run build

# --- Runner ---
FROM base AS runner
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1

RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

RUN mkdir .next
RUN chown nextjs:nodejs .next

COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static
COPY --from=builder --chown=nextjs:nodejs /app/public ./public

USER nextjs

EXPOSE 3000

ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

CMD ["node", "server.js"]
