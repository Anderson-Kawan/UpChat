#!/usr/bin/env bash

set -euo pipefail

project_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
source_url="${1:-http://127.0.0.1:5080/}"
output_file="$project_root/wwwroot/index.html"
temporary_file="$output_file.tmp"

curl --fail --silent --show-error "$source_url" --output "$temporary_file"
mv "$temporary_file" "$output_file"

echo "Static page exported to $output_file"
