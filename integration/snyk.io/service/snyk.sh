#!/bin/sh
printf "\n"
snyk auth ${SNYK_TOKEN}
printf "\n"
cd working_dir
printf "\n"
snyk test
printf "\n"