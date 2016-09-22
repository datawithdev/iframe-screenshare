#!/bin/bash

### Set initial time of file
LTIME=`stat -t %Z src/index.js`

while true
do
   ATIME=`stat -t %Z src/index.js`

   if [[ "$ATIME" != "$LTIME" ]]
   then
       echo "Rebuilding"
       npm run build
       LTIME=$ATIME
   fi
   sleep 5
done
