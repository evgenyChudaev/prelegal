#Requires -Version 5.1
$ErrorActionPreference = 'Stop'

$ContainerName = 'prelegal'

$existing = docker ps -a --format '{{.Names}}' | Where-Object { $_ -eq $ContainerName }
if ($existing) {
    Write-Host "Stopping $ContainerName..."
    docker rm -f $ContainerName | Out-Null
    Write-Host "Stopped."
} else {
    Write-Host "No running container named $ContainerName."
}
