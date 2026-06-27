#!/usr/bin/env pwsh
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Output "Stopping development environment from $root"

Push-Location $root

Write-Output 'Stopping frontend and backend processes (if started by start-dev)'
if (Test-Path "$root\.dev_frontend_pid") {
  $frontendPidValue = (Get-Content "$root\.dev_frontend_pid" | Out-String).Trim()
  if ($frontendPidValue -match '^\d+$') { Stop-Process -Id ([int]$frontendPidValue) -ErrorAction SilentlyContinue }
  Remove-Item "$root\.dev_frontend_pid" -ErrorAction SilentlyContinue
}
if (Test-Path "$root\.dev_backend_pid") {
  $backendPidValue = (Get-Content "$root\.dev_backend_pid" | Out-String).Trim()
  if ($backendPidValue -match '^\d+$') { Stop-Process -Id ([int]$backendPidValue) -ErrorAction SilentlyContinue }
  Remove-Item "$root\.dev_backend_pid" -ErrorAction SilentlyContinue
}

Write-Output 'Stopping PostgreSQL container (docker compose stop db)'
docker compose stop db

Write-Output 'Development environment stopped.'
Pop-Location
