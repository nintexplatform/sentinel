FROM node:6-slim

RUN useradd -m snyk
RUN npm install -g snyk

COPY snyk.sh /snyk.sh
USER snyk

ENV SNYK_TOKEN ""
ENV APP_DIR ""

ENTRYPOINT [ "/snyk.sh" ]