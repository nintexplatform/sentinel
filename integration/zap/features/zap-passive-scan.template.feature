@ZAPTest @Security @Template
Feature: Application should not be vulnerable to Security Issues

Background: 
    Given a new scanning session
    And a scanner with all policies disabled
    And the navigation and spider status is reset

Scenario: Check for Security vulnerabilities on Node Goat application by running Passive Scan
  Given I have loaded the web application
    And I've loaded the Workflows page
  Given the passive scanner is enabled
    And all existing alerts are deleted
    Then the application is spidered 
   Then no higher risk vulnerabilities should be present