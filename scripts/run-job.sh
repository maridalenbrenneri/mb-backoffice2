#!/bin/sh
set -eu

path="${1:?usage: run-job.sh /api/job-path}"
url="http://app.process.mb-backoffice.internal:8080${path}"

echo "Starting job POST ${url}"
curl -sS -X POST --max-time 1800 -H "x-api-key: ${API_KEY}" "$url"
echo
echo "Finished job POST ${path}"
