@GIT
Feature: Git
  Git Utilities

Scenario: Log in and copy some files from a container
  Given I have cloned the following git repo into the directory: working-dir
  | url                                            | cloneArguments |
  | https://org.visualstudio.com/org/_git/git-repo | --no-checkout  |
    And I checkout the following files in the directory: working-dir
  | commit            | file         |
  | [ENV_VAR_GIT_SHA] | GemFile      |
  | [ENV_VAR_GIT_SHA] | GemFile.lock |