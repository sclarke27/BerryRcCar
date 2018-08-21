#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

botNumber=${1}
usr=${2}
pwd=${3}
botName="Raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}
full_file_name="${FILENAME}-arduino-${VERSION}.tar.gz"

printf "*${GREY}Publish arduino to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} upload arduino tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}/arduino
mkdir -p ${INSTALL_FOLDER}/arduino
tar -C ${INSTALL_FOLDER}/arduino -xzf ${full_file_name}
'")

printf "${GREEN}Done.${NC}\n"