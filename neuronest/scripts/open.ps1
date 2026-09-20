$ErrorActionPreference = "SilentlyContinue"

function Test-Url($url) {
    try {
        $r = Invoke-WebRequest -Uri $url -TimeoutSec 1 -UseBasicParsing
        return $r.StatusCode -eq 200
    } catch { return $false }
}

if (Test-Url "http://localhost:5173") {
    Start-Process "http://localhost:5173"
    exit
}

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $root

$backendDir = Join-Path $root "backend"
$frontendDir = Join-Path $root "frontend"

Start-Process cmd.exe "/c cd /d `"$backendDir`" & npm run dev" -WindowStyle Hidden
Start-Sleep -Seconds 2
Start-Process cmd.exe "/c cd /d `"$frontendDir`" & npm run dev" -WindowStyle Hidden

$timeout = 30
$elapsed = 0
while ($elapsed -lt $timeout) {
    Start-Sleep -Seconds 1
    $elapsed++
    if (Test-Url "http://localhost:5173") {
        Start-Process "http://localhost:5173"
        exit
    }
}

Start-Process "http://localhost:5173"
