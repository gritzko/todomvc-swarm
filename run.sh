#!/bin/bash

npm install

while [ /bin/true ]; do 
    LOGDATE=`date +%Y.%m.%d_%H:%M:%S`
    echo starting instance $LOGDATE
    node TodoAppServer.js $@ > $LOGDATE.out 2> $LOGDATE.err
    gzip $LOGDATE.out &
    gzip $LOGDATE.err &
    sleep 1; 
done

