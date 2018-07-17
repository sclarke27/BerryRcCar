#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${GREY} do npm install${NC}\n"
(cd javascript
npm install)


# fixme: include version from package.json
    # zip -r swim_sensor_monitor_demo-1.0.0.zip ./javascript/)
