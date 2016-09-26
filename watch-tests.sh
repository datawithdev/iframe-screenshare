#!/bin/bash

### Set initial time of file
LTIME=`stat -t %Z test/test.js`

npm test

while true
do
   ATIME=`stat -t %Z test/test.js`

   if [[ "$ATIME" != "$LTIME" ]]
   then
       echo "Rebuilding"
       npm test
       LTIME=$ATIME
   fi
   sleep 5
done
