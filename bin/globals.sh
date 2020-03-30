#!/usr/bin/env bash

#file info
FILENAME='BerryRcCar'
INSTALL_FOLDER='BerryRcCar-runtime'
VERSION="3.0.1"

#colors
RED='\033[0;31m'
GREEN='\033[0;32m'
LTGREEN='\033[1;32m'
BLUE='\033[0;34m'
GREY='\033[1;30m'
NC='\033[0m' # No Color

#get system version values
OS_PRETTY_NAME=`cat /etc/os-release | grep PRETTY_NAME | cut -d'=' -f2`
OS_PRETTY_NAME="${OS_PRETTY_NAME%\"}"
OS_PRETTY_NAME="${OS_PRETTY_NAME#\"}"

OS_NAME=$( echo "$OS_PRETTY_NAME" | cut -d' ' -f1 )

OS_VERSION=`cat /etc/os-release | grep VERSION_ID | cut -d'=' -f2`
OS_VERSION="${OS_VERSION%\"}"
OS_VERSION="${OS_VERSION#\"}"

declare -A ipList=(
  [0]="192.168.1.79"
  [1]="192.168.1.65"
  [2]="192.168.0.125"
  [9]="192.168.1.87"
  [23]="192.168.1.66"
)

declare -A startPages=(
    [0]="http://192.168.1.79:8080/"
    [1]="http://192.168.1.65:8080/dash"
    [2]="http://192.168.1.172:8080/"
    [9]="http://192.168.1.82:8080/"
    [23]="http://192.168.1.66:8080/"
)
