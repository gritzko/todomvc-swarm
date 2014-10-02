#!/bin/bash

while [ /bin/true ]; do 
    LOGDATE=`date +%Y.%m.%d_%H:%M:%S`
    node TodoAppServer.js > $LOGDATE.out 2> $LOGDATE.err
    gzip $LOGDATE.out &
    gzip $LOGDATE.err &
    sleep 1; 
done

