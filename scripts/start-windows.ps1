#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$RootDir = Split-Path -Parent $PSScriptRoot
$ImageName = 'prelegal'
$ContainerName = 'prelegal'
$Port = if ($env:PRELEGAL_PORT) { $env:PRELEGAL_PORT } else { '8000' }

Set-Location $RootDir

Write-Host "Building image $ImageName..."
docker build -t $ImageName .
if ($LASTEXITCODE -ne 0) { throw "docker build failed" }

$existing = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq $ContainerName }
if ($existing) {
    Write-Host "Removing existing container $ContainerName..."
    docker rm -f $ContainerName | Out-Null
}

Write-Host "Starting container on http://localhost:$Port ..."
docker run -d --name $ContainerName -p "${Port}:8000" $ImageName
if ($LASTEXITCODE -ne 0) { throw "docker run failed" }

Write-Host "Prelegal is running. Open http://localhost:$Port"
