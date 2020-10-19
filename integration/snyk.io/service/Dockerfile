FROM snyk/snyk-cli:npm
WORKDIR /snykApi
ENV SERVICE_DIR "/snykApi"
COPY index.js index.js
COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm ci
ENTRYPOINT []
CMD ["node", "/snykApi/index.js"]