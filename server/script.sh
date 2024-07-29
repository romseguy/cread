#!/bin/bash
dir="$PWD/public"
xenforo-scraper -d "$dir" -n -N -t $2
mv "$dir/$1" "$dir/$1.json"
echo "done"