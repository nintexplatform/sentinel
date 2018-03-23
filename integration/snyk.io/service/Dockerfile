FROM node:8.9.3-slim

RUN useradd -m snyk
RUN npm install -g snyk

COPY index.js /index.js
COPY package.json /package.json

RUN npm install

USER snyk

ENV SNYK_TOKEN ""
ENV APP_DIR ""

CMD ["node", "/index.js"]