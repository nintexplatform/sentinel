FROM python:3.7-slim
RUN pip install sslyze
RUN apt-get update
RUN apt-get -y install gnupg curl
RUN curl -sL https://deb.nodesource.com/setup_12.x | bash
RUN apt-get -y install nodejs

WORKDIR /app
ADD ./package.json ./package.json
RUN npm install
ADD ./index.js ./index.js
CMD ["node", "index.js"]