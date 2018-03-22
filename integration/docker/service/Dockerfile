FROM docker:stable
FROM node:8
COPY --from=0 /usr/local/bin/docker /usr/local/bin/docker

COPY index.js /index.js
COPY package.json /package.json

RUN npm install

CMD ["node", "/index.js"]
