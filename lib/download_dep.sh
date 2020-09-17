#!/usr/bin/env bash

cd "$(dirname "$0")"

curl -O https://raw.githubusercontent.com/jasmine/jasmine/v3.5.0/lib/jasmine-core/jasmine.js
curl -O https://raw.githubusercontent.com/jasmine/jasmine/v3.5.0/lib/jasmine-core/jasmine.css
curl -O https://raw.githubusercontent.com/jasmine/jasmine/v3.5.0/lib/jasmine-core/boot.js
curl -O https://raw.githubusercontent.com/jasmine/jasmine/v3.5.0/lib/jasmine-core/jasmine-html.js
curl -O https://raw.githubusercontent.com/jasmine/jasmine-ajax/v4.0.0/lib/mock-ajax.js
curl -O https://raw.githubusercontent.com/jasmine/jasmine/v3.5.0/MIT.LICENSE
