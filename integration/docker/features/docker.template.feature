@DOCKER
Feature: Docker
  Utilities for docker

Scenario: Log in and copy some files from a container
  Given I have logged into the docker registry quay.io
    And I have run the docker command
    | cmd | docker run -v $(pwd):/wd quay.io/repo/docker-image:tag cp -R node_modules /wd/node_modules |