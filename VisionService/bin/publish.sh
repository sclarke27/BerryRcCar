#!/usr/bin/env bash

#include global vars
path=$(pwd)
printf "${path}"
source ${path}/bin/globals.sh

# create local vars
botNumber=${1}
usr=${2}
pwd=${3}
botName="Raspi${botNumber}"
botIp=${ipList[${botNumber}]}
sshAddress=${usr}@${botIp}

build_dir=${path}/build/python
dist_dir=${path}/dist
src_dir=${path}/VisionService
full_file_name="${FILENAME}-python-${VERSION}.tar.gz"

printf "${GREY}Package Python files for deployment${NC}\n"

rm -rf ${path}/build
mkdir -p ${build_dir}
mkdir -p ${dist_dir}

printf "${GREY}copy files to build folder${NC}\n"
cp -R ${src_dir}/requirements.txt ${build_dir}
cp -R ${src_dir}/*.py ${build_dir}
cp -R ${src_dir}/utils ${build_dir}

printf "${GREY}tar the build${NC}\n"
cd ${build_dir}
tar -zcvf ${full_file_name} *

printf "${GREY}move tar to dist${NC}\n"
mv ${full_file_name} ${dist_dir}/${full_file_name}

printf "*${GREY}Publish python files to ${GREEN}${sshAddress}${NC}\n"

printf "*${GREY} upload tar file${NC}\n"
(export SSHPASS=${pwd}
sshpass -e scp ${path}/dist/${full_file_name} ${sshAddress}:)

printf "*${GREY} untar files to runtime${NC}\n"
(export SSHPASS=${pwd}
sshpass -e ssh -qtt ${sshAddress} bash -c "'
rm -rf ${INSTALL_FOLDER}/VisionService
mkdir -p ${INSTALL_FOLDER}/VisionService
tar -C ${INSTALL_FOLDER}/VisionService -xzf ${full_file_name}
'")

printf "${GREEN}Done.${NC}\n"