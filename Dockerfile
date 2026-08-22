# The nit web console.
#
#   docker build -t nit-console:local .
#
# It lives here rather than in nit/deploy because a Dockerfile outside its
# own build context is a portability trap: some builders read it, others refuse.

FROM node:24-alpine AS build

WORKDIR /src

# corepack installs the pnpm version pinned by package.json's packageManager
# field, so the image builds with the same one developers use.
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./

# --frozen-lockfile is the CI form: it fails rather than silently resolving a
# different tree when the lockfile and package.json disagree.
RUN pnpm install --frozen-lockfile

COPY . .
RUN pnpm exec ng build --configuration production

# --- runtime ----------------------------------------------------------------

FROM nginx:1.27-alpine

COPY --from=build /src/dist/nit-console/browser /usr/share/nginx/html

# A template, not a finished config: the nginx image substitutes ${NIT_API_URL}
# at start-up, so one image serves any deployment.
COPY --from=build /src/default.conf.template /etc/nginx/templates/default.conf.template

# Where nginx proxies /v1 and /healthz. Override it to point at your control
# plane; the default is the service name the Compose stacks use.
ENV NIT_API_URL=http://nitd:8080

EXPOSE 80
