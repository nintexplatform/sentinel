#!/bin/sh
snyk auth ${SNYK_TOKEN}
cd working_dir

snyk test