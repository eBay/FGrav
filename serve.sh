#!/usr/bin/env bash
if [[ ! -x "$(command -v docker)" ]]; then
    echo "Could not find docker executable"
    exit 1
fi

# emulate readlink -f in order for the script to work on macOS (which fails to have the -f operand) and not just Linux. sigh.
DIR=./web
cd `dirname $DIR`
DIR=`basename $DIR`
while [ -L "$DIR" ]
do
    DIR=`readlink $DIR`
    cd `dirname $DIR`
    DIR=`basename $DIR`
done
PHYS_DIR=`pwd -P`
ROOT_DIR=$PHYS_DIR/$DIR

if [[ ! -d $ROOT_DIR ]]; then
    echo "Run the deploy.sh script first!"
    exit 1
fi

PORT="9090"

if [[ "$1" != "" ]]; then
    PORT="$1"
fi

echo "Launching FGrav server at http://localhost:$PORT from $ROOT_DIR"
docker container run -v $ROOT_DIR:/usr/share/nginx/html:ro -p $PORT:80 nginx
