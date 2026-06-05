@echo off
setlocal
title ThanhVinhStudio - Download Models
set "TVS_APP_DIR=%~dp0"

powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference='Stop'; $source=Get-Content -Raw -LiteralPath '%~f0'; $marker='### POWERSHELL ###'; $idx=$source.LastIndexOf($marker); if ($idx -lt 0) { throw 'PowerShell payload not found.' }; $script=$source.Substring($idx + $marker.Length); Invoke-Expression $script"
if errorlevel 1 (
  echo.
  echo Download failed. Please check your internet connection and run this file again.
  pause
  exit /b 1
)
echo.
echo Done. You can open ThanhVinhStudio now.
pause
exit /b 0

### POWERSHELL ###

$ProgressPreference = 'SilentlyContinue'
$appData = $env:TVS_APP_DIR.TrimEnd('\')
$modelsDir = Join-Path $appData 'models'
$baseDir = Join-Path $modelsDir 'base\VieNeu-TTS-v2-gguf'
$omnivoiceDir = Join-Path $modelsDir 'omnivoice'

New-Item -ItemType Directory -Force -Path $baseDir | Out-Null
New-Item -ItemType Directory -Force -Path $omnivoiceDir | Out-Null

function Download-File($url, $dest) {
  $parent = Split-Path -Parent $dest
  New-Item -ItemType Directory -Force -Path $parent | Out-Null
  if (Test-Path $dest -PathType Leaf) {
    $existing = Get-Item $dest
    if ($existing.Length -gt 0) {
      Write-Host "Exists: $dest"
      return
    }
  }
  Write-Host "Downloading: $url"
  $tmp = "$dest.partial"
  if (Test-Path $tmp) { Remove-Item -Force $tmp }
  Invoke-WebRequest -Uri $url -OutFile $tmp -UseBasicParsing
  Move-Item -Force $tmp $dest
}

function Download-HfRepo($repo, $target, $allowPatterns) {
  $api = "https://huggingface.co/api/models/$repo"
  Write-Host "Reading model file list: $repo"
  $meta = Invoke-RestMethod -Uri $api -UseBasicParsing
  foreach ($sibling in $meta.siblings) {
    $name = [string]$sibling.rfilename
    $allowed = $false
    foreach ($pattern in $allowPatterns) {
      if ($name -like $pattern) {
        $allowed = $true
        break
      }
    }
    if (-not $allowed) { continue }
    $encodedParts = ($name -split '/') | ForEach-Object { [uri]::EscapeDataString($_) }
    $encodedName = $encodedParts -join '/'
    $url = "https://huggingface.co/$repo/resolve/main/$encodedName"
    $dest = Join-Path $target $name
    Download-File $url $dest
  }
}

Write-Host "ThanhVinhStudio model directory:"
Write-Host $modelsDir
Write-Host ""

Download-HfRepo 'pnnbao-ump/VieNeu-TTS-v2' $baseDir @('*.gguf', 'voices.json')

$gguf = Join-Path $baseDir 'VieNeu-TTS-v2-Q4-K-M.gguf'
if (-not (Test-Path $gguf)) {
  throw "Base model was not downloaded: $gguf"
}

$answer = Read-Host "Download OmniVoice too? This can be large. Type Y to download, anything else to skip"
if ($answer -match '^[Yy]') {
  Download-HfRepo 'k2-fsa/OmniVoice' $omnivoiceDir @('*')
}

Write-Host ""
Write-Host "Models are ready in:"
Write-Host $modelsDir
