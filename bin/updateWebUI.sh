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

javascript_src_dir=${path}/javascript
bin_dir=${path}/bin
config_dir=${path}/config

full_file_name="${FILENAME}-webui-${VERSION}.tar.gz"

printf "*${GREY} Publish Web UI to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} clean up temp files ${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm ${full_file_name}
'")    

printf "*${GREY} upload new tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp -P 22 ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} clear old files${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}/javascript/server
'")

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
tar -C ${INSTALL_FOLDER}/javascript -xzf ${full_file_name}
'")

printf "${GREEN}Done.${NC}\n"