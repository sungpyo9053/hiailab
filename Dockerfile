# =========================================================
# 오토벤딩 Dockerfile — Next.js standalone 출력 사용
# 빌드:        docker build -t autovending .
# 실행:        docker run --rm -p 3000:3000 --env-file .env.local autovending
# compose 권장: docker compose up -d
# =========================================================

# ---------- 1) deps ----------
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json* ./
RUN npm ci --prefer-offline --no-audit --progress=false

# ---------- 2) builder ----------
FROM node:20-alpine AS builder
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
COPY . .
RUN npm run build

# ---------- 3) runner ----------
FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

# 비루트 유저로 실행
RUN addgroup -S nextjs && adduser -S nextjs -G nextjs

# Next.js standalone 출력만 복사 (image 크기 최적화)
COPY --from=builder --chown=nextjs:nextjs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nextjs /app/.next/static ./.next/static
# public 폴더는 현재 비어 있어도 무방하지만, 존재하면 복사
COPY --from=builder --chown=nextjs:nextjs /app/public ./public

# /setup 에서 저장하는 폴더 (런타임에 mkdir 됨, 권한 미리 확보)
RUN mkdir -p /app/.autovending && chown -R nextjs:nextjs /app/.autovending

USER nextjs
EXPOSE 3000

CMD ["node", "server.js"]
