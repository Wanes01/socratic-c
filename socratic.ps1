# the script stops immediately if an error occurs in a single statement
$ErrorActionPreference = "Stop"

$COMPOSE_BASE   = "-f docker-compose.yml"
$COMPOSE_OLLAMA = "-f docker-compose.ollama.yml" # ollama local LLM override
$COMPOSE_DEV    = "-f docker-compose.dev.yml" # development override
$COMPOSE_PROD   = "-f docker-compose.prod.yml" # production override
$ENV_FILE       = ".socratic-env" # the file in which the configuration from the last installation will be saved

# command usage
function Show-Usage {
    $name = Split-Path $PSCommandPath -Leaf
    Write-Host @"
Usage: $name <command> [options]

Commands:
  install   Build images and start services (saves configuration)
  start     Start existing services (no build)
  stop      Stop services
  remove    Stop services and remove containers, networks, volumes

Options:
  --ollama  Include local Ollama service
  --dev     Use development configuration (default)
  --prod    Use production configuration

Note: start, stop and remove automatically reuse the configuration
      saved by the last install if no options are provided.

Examples:
  $name install --prod --ollama
  $name start
  $name stop
  $name remove
"@
    exit 1
}

# arguments parsing
$COMMAND = ""
$USE_OLLAMA = $false
$USE_PROD = $false
$FLAGS_PROVIDED = $false

foreach ($arg in $args) {
    switch ($arg) {
        { $_ -in "install","start","stop","remove" } { $COMMAND = $arg }
        "--ollama" { $USE_OLLAMA = $true;  $FLAGS_PROVIDED = $true }
        "--prod"   { $USE_PROD   = $true;  $FLAGS_PROVIDED = $true }
        "--dev"    { $USE_PROD   = $false; $FLAGS_PROVIDED = $true }
        default    { Write-Host "Unknown option: $arg"; Show-Usage }
    }
}

if (-not $COMMAND) { 
    Show-Usage
}

# loads saved config if no flags provided (and does not install)
if (-not $FLAGS_PROVIDED -and $COMMAND -ne "install") {
    if (Test-Path $ENV_FILE) {
        $saved = Get-Content $ENV_FILE | ConvertFrom-StringData
        $USE_OLLAMA = [System.Convert]::ToBoolean($saved.SAVED_OLLAMA)
        $USE_PROD   = [System.Convert]::ToBoolean($saved.SAVED_PROD)
        Write-Host "Using saved configuration from $ENV_FILE"
    } else {
        Write-Host "Warning: no saved configuration found and no options provided."
        Write-Host "Run 'install' first or pass --dev/--prod explicitly."
        exit 1
    }
}

# builds the compose file list
$FILES = $COMPOSE_BASE

if ($USE_OLLAMA) { $FILES = "$FILES $COMPOSE_OLLAMA" }

if ($USE_PROD) {
    $FILES      = "$FILES $COMPOSE_PROD"
    $ENV_LABEL  = "prod"
} else {
    $FILES      = "$FILES $COMPOSE_DEV"
    $ENV_LABEL  = "dev"
}

Write-Host "Environment : $ENV_LABEL"
Write-Host "Ollama      : $USE_OLLAMA"
Write-Host "Command     : $COMMAND"
Write-Host ""

# executes the command
switch ($COMMAND) {
    "install" {
        "SAVED_OLLAMA=$USE_OLLAMA`nSAVED_PROD=$USE_PROD" | Set-Content $ENV_FILE
        Write-Host "Configuration saved to $ENV_FILE"
        Write-Host ""
        Invoke-Expression "docker compose $FILES up -d --build"
    }
    "start"  { Invoke-Expression "docker compose $FILES up -d" }
    "stop"   { Invoke-Expression "docker compose $FILES stop" }
    "remove" {
        Invoke-Expression "docker compose $FILES down -v"
        if (Test-Path $ENV_FILE) { Remove-Item $ENV_FILE }
        Write-Host "Configuration file removed."
    }
}