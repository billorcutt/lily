#!/bin/sh

ps -ex | grep -i "java Gateway $1"  | grep -v grep | awk '{print $1;}' | xargs kill 2> /dev/null