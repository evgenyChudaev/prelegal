#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$ImageName = 'prelegal'
$ContainerName = 'prelegal'
$Port = if ($env:PRELEGAL_PORT) { $env:PRELEGAL_PORT } else { '8000' }

Set-Location $RootDir

$EnvArgs = @()
$EnvFile = Join-Path $RootDir '.env'
if (Test-Path $EnvFile) {
    $line = Get-Content $EnvFile | Where-Object { $_ -match '^\s*OPENROUTER_API_KEY\s*=' } | Select-Object -First 1
    if ($line) {
        $value = ($line -replace '^[^=]*=\s*', '').Trim().Trim('"').Trim("'")
        if ($value) { $EnvArgs += @('-e', "OPENROUTER_API_KEY=$value") }
    }
}

Write-Host "Building image $ImageName..."
docker build -t $ImageName .
if ($LASTEXITCODE -ne 0) { throw "docker build failed" }

$existing = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq $ContainerName }
if ($existing) {
    Write-Host "Removing existing container $ContainerName..."
    docker rm -f $ContainerName | Out-Null
}

Write-Host "Starting container on http://localhost:$Port ..."
docker run -d --name $ContainerName -p "${Port}:8000" @EnvArgs $ImageName
if ($LASTEXITCODE -ne 0) { throw "docker run failed" }

Write-Host "Prelegal is running. Open http://localhost:$Port"
