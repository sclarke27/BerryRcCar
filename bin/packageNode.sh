#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh


build_dir=${path}/build/javascript
dist_dir=${path}/dist
src_dir=${path}/javascript
full_file_name="${FILENAME}-node-${VERSION}.tar.gz"

printf "${GREY}Package Node for deployment${NC}\n"

rm -rf ${path}/build
mkdir -p ${build_dir}
mkdir -p ${dist_dir}

${path}/bin/stopNode.sh
printf "${GREY}copy core files to build folder${NC}\n"
cp -R ${src_dir}/bot ${build_dir}
cp -R ${src_dir}/server ${build_dir}
cp -R ${src_dir}/main.js ${build_dir}
cp -R ${src_dir}/package.json ${build_dir}

printf "${GREY}tar the build${NC}\n"
cd ${build_dir}
tar -zcvf ${full_file_name} *

printf "${GREY}move tar to dist${NC}\n"
mv ${full_file_name} ${dist_dir}/${full_file_name}

printf "${GREEN}Done.${NC}\n"