#!/bin/bash
# random_tree.sh — generates a randomized nested directory structure
# Usage: ./random_tree.sh [base_dir] [max_depth] [max_dirs_per_level] [recurse_pct] [max_total]

BASE_DIR="${1:-./random_maze}"
MAX_DEPTH="${2:-8}"
MAX_DIRS="${3:-4}"
RECURSE_PCT="${4:-80}"    # % chance a directory gets children (0-100)
MAX_TOTAL="${5:-2000}"    # hard cap on total directories created

WORDS=(alpha bravo charlie delta echo foxtrot golf hotel india juliet
       kilo lima mike november oscar papa quebec romeo sierra tango
       uniform victor whiskey xray yankee zulu)

COUNT=0

random_name() {
  echo "${WORDS[$RANDOM % ${#WORDS[@]}]}_$RANDOM"
}

build_level() {
  local current_path="$1"
  local depth_remaining="$2"
  local force_deep="$3"      # 1 = this branch must reach max depth
  local i                    # IMPORTANT: local, since we recurse

  (( depth_remaining <= 0 )) && return

  local num_dirs=$(( (RANDOM % MAX_DIRS) + 1 ))

  for ((i = 0; i < num_dirs; i++)); do
    (( COUNT >= MAX_TOTAL )) && return

    local new_path="$current_path/$(random_name)"
    mkdir -p "$new_path"
    (( COUNT++ ))

    # Randomly drop a harmless decoy file
    if (( RANDOM % 3 == 0 )); then
      echo "nothing to see here" > "$new_path/notes.txt"
    fi

    # The first child of a forced level continues the guaranteed deep path
    local child_force=0
    (( force_deep == 1 && i == 0 )) && child_force=1

    if (( child_force )) || (( RANDOM % 100 < RECURSE_PCT )); then
      build_level "$new_path" $(( depth_remaining - 1 )) "$child_force"
    fi
  done
}

mkdir -p "$BASE_DIR"
build_level "$BASE_DIR" "$MAX_DEPTH" 1

echo "Tree created at: $BASE_DIR"
echo "Directories created: $COUNT"
echo "Deepest path depth: $(find "$BASE_DIR" -type d | awk -F/ '{print NF}' | sort -n | tail -1)"
