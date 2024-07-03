FROM node:16.14.0

ENV APP_ROOT /src
ENV HOST 0.0.0.0

WORKDIR ${APP_ROOT}

COPY ./package.json ${APP_ROOT}
COPY ./package-lock.json ${APP_ROOT}

RUN npm install @quasar/cli -g
RUN npm ci

COPY . ${APP_ROOT}

ARG graphql_uri
ARG api_url
ENV GRAPHQL_URI=${graphql_uri}
ENV API_URL=${api_url}

RUN npm run build:pwa

CMD ["quasar", "serve", "dist/pwa", "-p", "8080"]
