param(
    [string]$BaseUrl = "http://127.0.0.1:8765",
    [string[]]$Pages = @("index.html", "404.html", "snake-gameV23.html"),
    [string]$OutputDir = "artifacts/smoke",
    [int]$VirtualTimeBudgetMs = 6000,
    [int]$Width = 1400,
    [int]$Height = 1200
)

$ErrorActionPreference = "Stop"

$repoRoot = Split-Path -Parent $PSScriptRoot
$outputRoot = Join-Path $repoRoot $OutputDir
$harnessUrl = "$BaseUrl/__smoke_harness__.html"

$chromeCandidates = @(
    "C:\Program Files\Google\Chrome\Application\chrome.exe",
    "C:\Program Files (x86)\Microsoft\Edge\Application\msedge.exe",
    "C:\Program Files\Microsoft\Edge\Application\msedge.exe"
)

$browserPath = $chromeCandidates | Where-Object { Test-Path $_ } | Select-Object -First 1
if (-not $browserPath) {
    throw "No supported browser binary found. Checked: $($chromeCandidates -join ', ')"
}

try {
    Invoke-WebRequest -UseBasicParsing -Uri $harnessUrl -TimeoutSec 5 | Out-Null
} catch {
    throw "Smoke harness is not reachable at $harnessUrl. Start a local server first."
}

New-Item -ItemType Directory -Force -Path $outputRoot | Out-Null

$results = @()

foreach ($page in $Pages) {
    $pageName = [System.IO.Path]::GetFileNameWithoutExtension($page)
    if ([string]::IsNullOrWhiteSpace($pageName)) {
        $pageName = $page.Replace(".", "-")
    }

    $safeName = ($pageName -replace "[^a-zA-Z0-9_-]", "-")
    $screenshotPath = Join-Path $outputRoot "$safeName.png"
    $profileDir = Join-Path $env:TEMP "rougesnake-smoke-$safeName"
    $targetUrl = "{0}?page={1}" -f $harnessUrl, [System.Uri]::EscapeDataString($page)

    & $browserPath `
        --headless=new `
        --disable-gpu `
        --disable-background-networking `
        --disable-default-apps `
        --disable-sync `
        --no-default-browser-check `
        --no-first-run `
        "--virtual-time-budget=$VirtualTimeBudgetMs" `
        "--window-size=$Width,$Height" `
        "--user-data-dir=$profileDir" `
        "--screenshot=$screenshotPath" `
        $targetUrl | Out-Null

    if ($LASTEXITCODE -ne 0) {
        throw "Browser smoke run failed for $page"
    }

    $results += [pscustomobject]@{
        page = $page
        screenshot = $screenshotPath
        url = $targetUrl
    }
}

$summaryPath = Join-Path $outputRoot "summary.json"
$results | ConvertTo-Json -Depth 3 | Set-Content -Encoding UTF8 -Path $summaryPath

Write-Host "Smoke screenshots written to $outputRoot"
Write-Host "Summary written to $summaryPath"
