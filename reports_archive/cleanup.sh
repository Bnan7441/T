#!/bin/bash

# Tondino Project Cleanup Script
# Removes redundant backup, temp, and duplicate environment files
# Preserves active .env files and respects .gitignore patterns

set -e  # Exit on error

# Default values
DRY_RUN=false
CONFIRM=true
LOG_FILE="cleanup.log"
TARGET_DIRS=("tondino-backend" "tondino-frontend" ".")

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --dry-run)
      DRY_RUN=true
      shift
      ;;
    --no-confirm)
      CONFIRM=false
      shift
      ;;
    --log-file)
      LOG_FILE="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [--dry-run] [--no-confirm] [--log-file FILE]"
      echo "  --dry-run: Show what would be deleted without deleting"
      echo "  --no-confirm: Skip confirmation prompts"
      echo "  --log-file: Specify log file (default: cleanup.log)"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage"
      exit 1
      ;;
  esac
done

# Initialize log
echo "Cleanup started at $(date)" > "$LOG_FILE"
echo "Dry run: $DRY_RUN" >> "$LOG_FILE"
echo "Confirmation: $CONFIRM" >> "$LOG_FILE"
echo "Target directories: ${TARGET_DIRS[*]}" >> "$LOG_FILE"
echo "" >> "$LOG_FILE"

# Function to check if file is in .git directory
is_in_git() {
  local file="$1"
  [[ "$file" == *"/.git/"* ]] || [[ "$file" == *"/.git" ]]
}

# Function to check if file matches .gitignore patterns (simplified check)
matches_gitignore() {
  local file="$1"
  # Check for common patterns that should be ignored
  [[ "$file" == *.log ]] || [[ "$file" == node_modules/* ]] || [[ "$file" == dist/* ]] || [[ "$file" == .DS_Store ]] || [[ "$file" == .env* ]] && [[ "$file" != .env ]] && [[ "$file" != .env.local ]] && [[ "$file" != .env.production ]] && [[ "$file" != .env.development ]]
}

# Function to process files
process_files() {
  local pattern="$1"
  local description="$2"
  
  echo "Searching for $description files..." | tee -a "$LOG_FILE"
  
  for dir in "${TARGET_DIRS[@]}"; do
    if [[ -d "$dir" ]]; then
      while IFS= read -r -d '' file; do
        if is_in_git "$file"; then
          echo "Skipping .git file: $file" >> "$LOG_FILE"
          continue
        fi
        
        if matches_gitignore "$file"; then
          echo "Skipping gitignored file: $file" >> "$LOG_FILE"
          continue
        fi
        
        echo "Found: $file" | tee -a "$LOG_FILE"
        
        if [[ "$DRY_RUN" == true ]]; then
          echo "Would delete: $file" | tee -a "$LOG_FILE"
        else
          if [[ "$CONFIRM" == true ]]; then
            read -p "Delete $file? (y/N): " -n 1 -r
            echo
            if [[ ! $REPLY =~ ^[Yy]$ ]]; then
              echo "Skipped: $file" >> "$LOG_FILE"
              continue
            fi
          fi
          
          if rm -f "$file"; then
            echo "Deleted: $file" | tee -a "$LOG_FILE"
          else
            echo "Failed to delete: $file" | tee -a "$LOG_FILE"
          fi
        fi
      done < <(find "$dir" -type f -name "$pattern" -print0 2>/dev/null)
    fi
  done
  echo "" >> "$LOG_FILE"
}

# Process different file types
process_files "*.bak" "backup files (.bak)"
process_files "*.backup" "backup files (.backup)"
process_files "*.tmp" "temporary files (.tmp)"
process_files ".env.bak*" "environment backup files (.env.bak*)"
process_files ".env.backup*" "environment backup files (.env.backup*)"

# Special case: courses.js.backup (if exists)
special_files=("tondino-backend/routes/courses.js.backup")
for file in "${special_files[@]}"; do
  if [[ -f "$file" ]]; then
    echo "Found special file: $file" | tee -a "$LOG_FILE"
    if [[ "$DRY_RUN" == true ]]; then
      echo "Would delete: $file" | tee -a "$LOG_FILE"
    else
      if [[ "$CONFIRM" == true ]]; then
        read -p "Delete $file? (y/N): " -n 1 -r
        echo
        if [[ $REPLY =~ ^[Yy]$ ]]; then
          if rm -f "$file"; then
            echo "Deleted: $file" | tee -a "$LOG_FILE"
          else
            echo "Failed to delete: $file" | tee -a "$LOG_FILE"
          fi
        else
          echo "Skipped: $file" >> "$LOG_FILE"
        fi
      else
        if rm -f "$file"; then
          echo "Deleted: $file" | tee -a "$LOG_FILE"
        else
          echo "Failed to delete: $file" | tee -a "$LOG_FILE"
        fi
      fi
    fi
  fi
done

echo "Cleanup completed at $(date)" >> "$LOG_FILE"
echo "Log saved to $LOG_FILE"
if [[ "$DRY_RUN" == true ]]; then
  echo "This was a dry run. No files were actually deleted."
  echo "Review $LOG_FILE and run without --dry-run to perform actual deletion."
fi
