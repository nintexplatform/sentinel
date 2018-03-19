FROM node:8

WORKDIR /app
ADD ./package.json ./package.json
RUN npm install

ADD ./index.js ./index.js

# Install sslyze with dependencies 
RUN \
  apt-get update && \
  apt-get install -y python2.7 unzip wget python-pip python-dev gcc --no-install-recommends && \
  pip install --upgrade setuptools && \
  pip install typing sslyze==1.3.4

CMD ["node", "index.js"]