FROM node:22-alpine AS builder

WORKDIR /app

COPY package.json package-lock.json* ./
RUN npm install

COPY . .
RUN npm run build

# ─── Stage 2: Production ─────────────────────────────────────────────────────
FROM node:22-alpine AS production

WORKDIR /app

RUN apk add --no-cache wget

COPY package.json package-lock.json* ./
RUN npm install --omit=dev

COPY --from=builder /app/dist ./dist
RUN mkdir -p /app/drizzle/migrations
COPY --from=builder /app/drizzle/migrations ./drizzle/migrations

ENV APP_ROOT=/app
ENV UPLOAD_DIR=/app/uploads

RUN addgroup -S app && adduser -S app -G app && \
    mkdir -p /app/uploads /app/data && \
    chown -R app:app /app

EXPOSE 3000

COPY docker/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=5 \
  CMD wget -qO- http://127.0.0.1:3000/health >/dev/null || exit 1

USER app

CMD ["/entrypoint.sh"]
