#!/usr/bin/env pwsh
Set-StrictMode -Version Latest

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
Write-Output "Starting development environment from $root"

Push-Location $root

Write-Output 'Starting PostgreSQL (docker compose up -d db)'
docker compose up -d db

# Start backend (uvicorn) and capture PID
Write-Output 'Starting backend uvicorn...'
$backendPython = "$root\backend\.venv\Scripts\python.exe"
$uvicornArgs = "$root\backend\run_server.py"
$backendProc = Start-Process -FilePath $backendPython -ArgumentList $uvicornArgs -WorkingDirectory "$root\backend" -PassThru
if ($backendProc) { $backendProc.Id | Out-File -FilePath "$root\.dev_backend_pid" -Encoding ascii }

# Start frontend (Next.js dev)
Write-Output 'Starting frontend (npm run dev)...'
Push-Location "$root\frontend"
$frontendProc = Start-Process -FilePath npm.cmd -ArgumentList 'run','dev' -WorkingDirectory "$root\frontend" -PassThru
if ($frontendProc) { $frontendProc.Id | Out-File -FilePath "$root\.dev_frontend_pid" -Encoding ascii }
Pop-Location

Write-Output 'Development environment started.'
Pop-Location
