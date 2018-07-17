#!/usr/bin/env bash

#include global vars
path=$(pwd)
source ${path}/bin/globals.sh

printf "${RED}Test Servo${NC}

DEVICE=$1
CHANNEL=$2
TARGET=$3

byte() {
  printf "\\x$(printf "%x" $1)"
}

stty raw -F $DEVICE

{
  byte 0x84
  byte $CHANNEL
  byte $((TARGET & 0x7F))
  byte $((TARGET >> 7 & 0x7F))
} > $DEVICE