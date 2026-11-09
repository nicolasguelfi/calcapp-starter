# CalcApp — multi-stage image
#   stage 1 (build): Node installs the locked dependencies, runs the tests, builds dist/
#   stage 2 (run):   nginx serves the static files — no Node, no source code
#
#   docker build -t calcapp .
#   docker run --rm -p 3000:3000 calcapp        # then open http://localhost:3000
#
# The container listens on $PORT (default 3000). Health check: GET / must answer 200.

# ---------- stage 1: build ----------
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run test:run && npm run build

# ---------- stage 2: run ----------
FROM nginx:1.28-alpine
ARG SOURCE_COMMIT=unknown
LABEL org.opencontainers.image.title="calcapp" \
      org.opencontainers.image.revision="${SOURCE_COMMIT}"
ENV PORT=3000
# the nginx image renders /etc/nginx/templates/*.template with envsubst at start-up
COPY docker/nginx.conf.template /etc/nginx/templates/default.conf.template
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 3000
# busybox wget is part of the alpine base image (no curl needed)
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/" || exit 1
