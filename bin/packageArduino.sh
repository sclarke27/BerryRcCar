#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh


build_dir=${path}/build/arduino
dist_dir=${path}/dist
src_dir=${path}/arduino
full_file_name="${FILENAME}-arduino-${VERSION}.tar.gz"

printf "${GREY}Package Arduino code for deployment${NC}\n"

rm -rf ${path}/build
mkdir -p ${build_dir}
mkdir -p ${dist_dir}

${path}/bin/stopNode.sh
printf "${GREY}copy core files to build folder${NC}\n"
cp -R ${src_dir}/* ${build_dir}

printf "${GREY}tar the build${NC}\n"
cd ${build_dir}
tar -zcvf ${full_file_name} *

printf "${GREY}move tar to dist${NC}\n"
mv ${full_file_name} ${dist_dir}/${full_file_name}

printf "${GREEN}Done.${NC}\n"