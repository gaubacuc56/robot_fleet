FROM node:20-bookworm-slim AS deps

WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci


FROM node:20-bookworm-slim AS builder

WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# NEXT_PUBLIC_* is inlined into the bundle at build time, so this must be known
# here; set only at runtime, the bundle would keep the default. It is the URL
# the *browser* dials, so it resolves on the host, not as a service name.
ARG NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:8080
ENV NEXT_PUBLIC_WEBSOCKET_URL=$NEXT_PUBLIC_WEBSOCKET_URL

# next.config.js rewrites are resolved during `next build` and frozen into
# routes-manifest.json, so the proxy target must be known here as well; set only
# at runtime it is ignored and the default loopback URL survives into the image.
ARG BACKEND_URL=http://localhost:8080
ENV BACKEND_URL=$BACKEND_URL

ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build


FROM node:20-bookworm-slim AS runtime

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME=0.0.0.0

WORKDIR /app

# output: 'standalone' emits a self-contained server with only the node_modules
# it needs.
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

USER node

EXPOSE 3000

HEALTHCHECK --interval=10s --timeout=3s --start-period=20s --retries=5 \
    CMD node -e "fetch('http://127.0.0.1:3000/').then(r=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"

CMD ["node", "server.js"]
