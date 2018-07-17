#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

build_dir=${path}/build
dist_dir=${path}/dist
javascript_src_dir=${path}/javascript
java_src_dir=${path}/java
bin_dir=${path}/bin
config_dir=${path}/config
full_file_name="${FILENAME}-full-${VERSION}.tar.gz"

printf "${GREY}Package Full App for deployment${NC}\n"

${path}/bin/stopAll.sh

printf "*${GREY} clean build folder${NC}\n"
rm -rf ${build_dir}
mkdir -p ${build_dir}/java
mkdir -p ${build_dir}/javascript
mkdir -p ${build_dir}/bin
mkdir -p ${build_dir}/config
mkdir -p ${dist_dir}

printf "*${GREY} copy bin to build folder${NC}\n"
cp -R ${bin_dir}/* ${build_dir}/bin
printf "*${GREY} copy config to build folder${NC}\n"
cp -R ${config_dir}/* ${build_dir}/config

printf "*${GREY} copy JS files to build folder${NC}\n"
cp -R ${javascript_src_dir}/bot ${build_dir}/javascript
cp -R ${javascript_src_dir}/server ${build_dir}/javascript
cp -R ${javascript_src_dir}/modules ${build_dir}/javascript
cp -R ${javascript_src_dir}/main.js ${build_dir}/javascript
cp -R ${javascript_src_dir}/package.json ${build_dir}/javascript

printf "*${GREY} copy Java to build folder${NC}\n"
cp -R ${java_src_dir}/src ${build_dir}/java/src
cp -R ${java_src_dir}/.classpath ${build_dir}/java
cp -R ${java_src_dir}/.project ${build_dir}/java
cp -R ${java_src_dir}/gradlew ${build_dir}/java
cp -R ${java_src_dir}/gradlew.bat ${build_dir}/java
cp -R ${java_src_dir}/build.gradle ${build_dir}/java
cp -R ${java_src_dir}/gradle.properties ${build_dir}/java

printf "${GREY}copy arduino files to build folder${NC}\n"
cp -R ${path}/arduino ${build_dir}

printf "*${GREY} tar the build${NC}\n"
cd ${build_dir}
tar -zcvf ${full_file_name} *

printf "*${GREY} move tar to dist${NC}\n"
mv ${full_file_name} ${dist_dir}/${full_file_name}

printf "${GREEN}Done.${NC}\n"