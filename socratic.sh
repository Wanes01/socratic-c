#!/usr/bin/env bash

# the script stops immediately if an error occurs in a single statement or in a pipe.
# It treats variables as errors.
set -euo pipefail

COMPOSE_BASE="-f docker-compose.yml"
COMPOSE_OLLAMA="-f docker-compose.ollama.yml" # ollama local LLM override
COMPOSE_DEV="-f docker-compose.dev.yml" # development override
COMPOSE_PROD="-f docker-compose.prod.yml" # production override
ENV_FILE=".socratic-env" # the file in which the configuration from the last installation will be saved

# command usage
usage() {
  cat <<USAGE
Usage: $(basename "$0") <command> [options]

Commands:
  install   Build images and start services (saves configuration for future use)
            [installation options]
              --dev / --prod     Use development or production configuration (defaults to development)
              --ollama           Include local Ollama service

  start     Start existing services (no build)
  stop      Stop services
  remove    Stop services and remove containers, networks, volumes

Note: start, stop, and remove automatically reuse the configuration
      saved by the last install.

Examples:
  $(basename "$0") install                  # dev mode, no Ollama
  $(basename "$0") install --prod --ollama  # prod mode, with Ollama
  $(basename "$0") start
  $(basename "$0") stop
  $(basename "$0") remove
USAGE
  exit 1
}

# colors for output
GREEN='\033[0;32m'
CYAN='\033[0;36m'
BOLD='\033[1m'
NC='\033[0m' # no color

# app url
APP_URL="http://localhost"

# shows
appReadyMessage() {
  echo ""
  printf "${GREEN}App ready!${NC}\n"
  printf "Service available at ${BOLD}${CYAN}$APP_URL${NC}\n"
}

# check that the user is not running as root
if [ "$EUID" -eq 0 ]; then
  echo "Error: do not run this script as root or with sudo."
  echo "Add your user to the Docker group instead:"
  echo "  sudo usermod -aG docker \$USER"
  echo "Then open a new terminal and try again."
  exit 1
fi

# check that the user is in the docker group (Linux only)
if [[ "$(uname)" == "Linux" ]] && ! groups | grep -q docker; then
  echo "Error: your user is not in the docker group."
  echo "Run the following command, then open a new terminal and try again:"
  echo "  sudo usermod -aG docker \$USER"
  exit 1
fi

# arguments parsing
COMMAND=""
USE_OLLAMA=false
USE_PROD=false
FLAGS_PROVIDED=false

for arg in "$@"; do
  case "$arg" in
    install|start|stop|remove) COMMAND="$arg" ;;
    --ollama) USE_OLLAMA=true;  FLAGS_PROVIDED=true ;;
    --prod)   USE_PROD=true;    FLAGS_PROVIDED=true ;;
    --dev)    USE_PROD=false;   FLAGS_PROVIDED=true ;;
    *) echo "Unknown option: $arg"; usage ;;
  esac
done

[ -z "$COMMAND" ] && usage

# loads saved config if no flags provided (and does not install)
if [ "$FLAGS_PROVIDED" = false ] && [ "$COMMAND" != "install" ]; then
  if [ -f "$ENV_FILE" ]; then
    source "$ENV_FILE"
    USE_OLLAMA=$SAVED_OLLAMA
    USE_PROD=$SAVED_PROD
    echo "Using saved configuration from $ENV_FILE"
  else
    echo "Warning: no saved configuration found and no options provided."
    echo "Run 'install' first or pass --dev/--prod explicitly."
    exit 1
  fi
fi

# builds the compose file list
FILES="$COMPOSE_BASE"

if $USE_OLLAMA; then
  FILES="$FILES $COMPOSE_OLLAMA"
fi

if $USE_PROD; then
  FILES="$FILES $COMPOSE_PROD"
  ENV_LABEL="prod"
  APP_URL="${APP_URL}:8080"
else
  FILES="$FILES $COMPOSE_DEV"
  ENV_LABEL="dev"
  APP_URL="${APP_URL}:5173"
fi

# validates required environment variables
if $USE_OLLAMA; then
  if [ -f ".env" ]; then
    source .env
  fi
  if [ -z "${OLLAMA_MODEL:-}" ]; then
    echo "Error: OLLAMA_MODEL is not set. Add it to your .env file."
    echo "Example: OLLAMA_MODEL=qwen2.5-coder:3b"
    exit 1
  fi
fi

echo "Environment : $ENV_LABEL"
echo "Ollama      : $USE_OLLAMA"
echo "Command     : $COMMAND"
echo ""

# executes the command
case "$COMMAND" in
  install)
    echo "SAVED_OLLAMA=$USE_OLLAMA" > "$ENV_FILE"
    echo "SAVED_PROD=$USE_PROD"    >> "$ENV_FILE"
    echo "Configuration saved to $ENV_FILE"
    echo ""
    mkdir -p exercises
    docker compose $FILES build --no-cache
    docker compose $FILES up -d
    appReadyMessage
    ;;
  start)
    docker compose $FILES up -d
    appReadyMessage
    ;;
  stop)
    docker compose $FILES stop
    ;;
  remove)
    docker compose $FILES down -v
    rm -f "$ENV_FILE"
    echo "Configuration file removed."
    ;;
esac