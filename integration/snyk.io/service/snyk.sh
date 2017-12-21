#!/bin/sh

snyk auth ${SNYK_TOKEN}
cd ${APP_DIR}

snyk test