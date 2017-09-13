@ZAPTest @Security @Template
Feature: Application should not be vulnerable to Security Issues

Background: 
    Given a new scanning session
    And a scanner with all policies disabled
    And the navigation and spider status is reset

Scenario Outline: Check for Security vulnerabilities on Node Goat application by running scan for <Policy>
  Given I have loaded the web application
    And I've loaded the Workflows page
    And all existing alerts are deleted
   Then the application is spidered
    And the "<Policy>" policy is enabled with "Low" threshold and "High" attack strength
   When the active scanner is run
   Then no higher risk vulnerabilities should be present

Examples:
    | Policy                      | Role          |
    | SQL Injection               | Administrator |
    | Cross Site Scripting        | Designer      |
    | Path Traversal              | Designer      |
    | Remote File Inclusion       | Administrator |
    | Server Side Include         | Designer      |
    | Server Side Code Injection  | Administrator |
    | Remote OS Command Injection | Designer      |
    | CRLF Injection              | Designer      |
    | External Redirect           | Administrator |
    | Source Code Disclosure      | Designer      |
    | Shell Shock                 | Designer      |
    | LDAP Injection              | Administrator |
    | XPATH Injection             | Designer      |
    | XML External Entity         | Administrator |
    | Padding Oracle              | Designer      |
    | Insecure HTTP Methods       | Administrator |