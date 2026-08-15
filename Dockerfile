# Build and runtime are separate stages so the image ships neither the Vite
# toolchain nor the ~500MB of devDependencies it needs to produce dist/.
FROM node:24-alpine AS build
WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
RUN npm run build

FROM node:24-alpine AS runtime
WORKDIR /app
ENV NODE_ENV=production

# The SSR bundle leaves react, the router and srvx as external imports, so the
# runtime still needs the production dependency tree — just not the dev half.
COPY package.json package-lock.json ./
RUN npm ci --omit=dev && npm cache clean --force

COPY --from=build /app/dist ./dist
COPY server.mjs ./

EXPOSE 3000
CMD ["node", "server.mjs"]
