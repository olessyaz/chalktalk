#!/bin/bash
EMAIL='' # edit this
PASS='' # edit this
   
COOKIES='cookies.txt'
USER_AGENT='Firefox/3.5'
    
curl -X GET 'https://www.facebook.com/home.php' --verbose --user-agent $USER_AGENT --cookie $COOKIES --cookie-jar $COOKIES --location # redirects to https://login.facebook.com/login.php
curl -X POST 'https://login.facebook.com/login.php' --verbose --user-agent $USER_AGENT --data-urlencode "davidlobser@yahoo.com" --data-urlencode "puzzly769" --cookie $COOKIES --cookie-jar $COOKIES
echo "" > outinfo
echo "" > outlist5
filename="$1"
while read line
do
    curl -o tstfb 'https://graph.facebook.com/'"$line"'' --verbose --user-agent $USER_AGENT --cookie $COOKIES --cookie-jar $COOKIES; #| grep \"id\":\"42405138\"\,\"name\"\:\".?\"
    echo "$line" >> outlist5
    cat tstfb | sed -e 's/^.*\"name\":\"//g' -e 's/".*//g' >> outlist5
    cat tstfb >> outinfo
    echo "" >> outinfo
done < "$filename"