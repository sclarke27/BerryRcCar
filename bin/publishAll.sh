#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

botNumber=${1}
usr=${2}
pwd=${3}
botName="raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}
full_file_name="${FILENAME}-full-${VERSION}.tar.gz"

printf "*${GREY} Publish App to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} clean up temp files and stop runnig processes${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
killall chromium-browser
killall java
killall node
rm *.log
rm *.err
rm ${full_file_name}
'")    

printf "*${GREY} upload app tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)


printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}
mkdir ${INSTALL_FOLDER}
tar -C ${INSTALL_FOLDER} -xzf ${full_file_name}
'")

printf "*${GREY} run npm install to build/refresh node packages${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
cd ${INSTALL_FOLDER}/javascript
npm install
'")    

printf "*${GREY} run gradle build${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
cd ${INSTALL_FOLDER}/java
gradle build -Pconfig=${botName}
rm -rf dist/
mkdir dist/
tar -xf build/distributions/java.tar -C dist/
'")

printf "${GREEN}Done.${NC}\n"