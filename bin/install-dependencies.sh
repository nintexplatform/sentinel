#!/bin/bash
set -e
set -u
set -o pipefail

success='\033[1;32m'
error='\033[1;31m'
info='\033[0;34m'
reset='\033[0m'

process="Docker"
{
  echo -e "${info} Checking any existing versions of '$process'" 
  docker -v 
} || {
  #Install docker 
  echo -e "${info} No existing versions of '$process'"
  echo -e "${info} Download and Installation of '$process' has started ${reset}"
  curl -fsSL get.docker.com -o install-docker.sh 
  sh install-docker.sh
  echo -e "${success} $process installed! ${reset}"
}

process="Docker-Compose"
{
  echo -e "${info} Checking any existing versions of '$process'" 
  docker-compose -v 
} || {
  #Install docker-compose 
  echo -e "${info} No existing versions of '$process'"
  echo -e "${info} Download and Installation of '$process' has started ${reset}"
  dockerComposeVersion="$(git ls-remote https://github.com/docker/compose | grep "refs/tag" | grep -oP "[0-9]+\.[0-9]+\.[0-9]+" | tail -n1)"
  curl -L https://github.com/docker/compose/releases/download/$dockerComposeVersion/docker-compose-`uname -s`-`uname -m` -o /usr/local/bin/docker-compose
  sudo chmod +x /usr/local/bin/docker-compose
  echo -e "${success} $process installed! ${reset}"
}

echo -e "${info}------------------------------------------------------------${reset}"

process="Node.js"
{
  echo -e "${info} Checking any existing versions of '$process'" 
  node -v 
} || {
#Install Node.js
echo -e "${info} No existing versions of '$process'"
echo -e "${info} Download and Installation of '$process' has started ${reset}"
curl -o- https://raw.githubusercontent.com/creationix/nvm/v0.33.4/install.sh | bash
source ~/.nvm/nvm.sh
nvm install node
echo -e "${success} $process installed! ${reset}"
}

echo -e "${info} Please Logout and Login back to take changes effect ${reset}"

status=$?
if [ $status -ne 0 ]
then
	echo -e "${error} Installation of $process failed. Resolve the errors and Try again! ${reset}"
    exit 1
fi