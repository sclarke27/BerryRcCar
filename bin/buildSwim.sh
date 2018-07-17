#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY}Build Swim${NC}\n"

(cd $path;
    cd java/
	gradle build -P"$@"
	echo 'untar swim'
    rm -rf dist/
    mkdir dist/
	tar -xf build/distributions/java.tar -C dist/)

printf "${GREEN}Done.${NC}\n"