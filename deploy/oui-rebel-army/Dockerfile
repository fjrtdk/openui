# oui.rebel.army: OpenUI self-hosted chat with a model picker, dashboards and a whiteboard.
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV DO_NOT_TRACK=1 NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
# Tests run in the build so a broken allowlist or example never ships.
RUN npm run generate && npm test && npm run build

FROM node:22-bookworm-slim
WORKDIR /app
ENV NODE_ENV=production DO_NOT_TRACK=1 NEXT_TELEMETRY_DISABLED=1
COPY --from=build /app ./
CMD ["npx","next","start","-H","127.0.0.1","-p","3460"]
