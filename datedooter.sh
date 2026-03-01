#!/bin/bash

# datedooter.sh - Update words post timestamp to current time
# Usage: ./datedooter.sh <post-name>
# Example: ./datedooter.sh email-is-hard

set -e

if [ $# -eq 0 ]; then
    echo "Usage: $0 <post-name>"
    echo "Example: $0 email-is-hard"
    exit 1
fi

POST_NAME="$1"
POST_FILE="content/words/${POST_NAME}.md"

# Check if file exists
if [ ! -f "$POST_FILE" ]; then
    echo "Error: File '$POST_FILE' not found"
    exit 1
fi

# Generate current timestamp in ISO 8601 format with timezone
# Format: 2025-11-11T19:18:11-08:00
TIMESTAMP=$(date +"%Y-%m-%dT%H:%M:%S%z" | sed 's/\([+-][0-9][0-9]\)\([0-9][0-9]\)$/\1:\2/')

echo "Updating timestamp in $POST_FILE"
echo "New timestamp: $TIMESTAMP"

# Update the date field in the frontmatter (macOS sed requires -i '' for in-place editing)
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    sed -i '' "s/^date = \".*\"$/date = \"$TIMESTAMP\"/" "$POST_FILE"
else
    # Linux
    sed -i "s/^date = \".*\"$/date = \"$TIMESTAMP\"/" "$POST_FILE"
fi

echo "Done."