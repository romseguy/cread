#!/bin/bash
xenforo-scraper -d "$1" -n -N -t $2
mv "$1/$3" "$1/$3.json"
echo "done"

# dir="$PWD/public"
# xenforo-scraper -d "$dir" -n -N -t $2
# mv "$dir/$1" "$dir/$1.json"
# echo "done"