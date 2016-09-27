#!/bin/bash

### Set initial time of file
LTIME=`stat -t %Z test/test.js`
MTIME=`stat -t %Z src/index.js`

npm test

while true
do
   ATIME=`stat -t %Z test/test.js`
   BTIME=`stat -t %Z src/index.js`

   if [ "$ATIME" != "$LTIME" ] || [ "$BTIME" != "$MTIME" ]
   then
       echo "Rebuilding"
       npm run build
       npm test
       LTIME=$ATIME
       MTIME=$BTIME
   fi
   sleep 5
done
