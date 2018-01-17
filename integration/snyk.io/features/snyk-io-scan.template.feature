@SNYK @Security @Template
Feature: SNYK.IO
  Ensure that there are no vulnerabilities reported while scanning the project dependencies

Scenario: Ensure that there are no vulnerabilities reported while scanning the project dependencies
  Given the SNYK command is run against the project dependencies
  Then there should not be any vulnerable paths found