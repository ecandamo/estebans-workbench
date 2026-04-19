#!/bin/bash

INPUT=$(cat)
FILE=$(echo "$INPUT" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d.get('tool_input',{}).get('path',''))" 2>/dev/null)

# Only format relevant file types
if [[ "$FILE" =~ \.(ts|tsx|js|jsx|css|json|md)$ ]]; then
    if [ -f "$FILE" ]; then
        npx prettier --write "$FILE" --log-level silent 2>/dev/null
    fi
fi

exit 0
