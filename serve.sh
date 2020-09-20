#!/usr/bin/env bash
if [[ ! -x "$(command -v docker)" ]]; then
    echo "Could not find docker executable"
    exit 1
fi

if [[ ! -d $(readlink -f ./web) ]]; then
    echo "Run the deploy.sh script first!"
    exit 1
fi

PORT="9090"

if [[ "$1" != "" ]]; then
    PORT="$1"
fi

echo "Launching FGrav server at http://localhost:$PORT"
docker container run -v $(readlink -f ./web):/usr/share/nginx/html:ro -p $PORT:80 nginx
