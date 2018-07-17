#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY}call stop all script${NC}\n"
${path}/bin/stopAll.sh "$@"

printf "${GREY}remove temp files${NC}\n"
# rm ${path}/java/nohup.out
# rm ${path}/javascript/nohup.out
rm -rf /tmp/sensorMonitorDemo

printf "${GREY}call start all script${NC}\n"
${path}/bin/startAll.sh "$@"

printf "${GREEN}Done.${NC}\n"
