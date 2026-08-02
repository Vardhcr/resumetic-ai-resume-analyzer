$ErrorActionPreference = "Continue"
$file = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/netlify_bundle.js"

if (-not (Test-Path $file)) {
    Write-Output "netlify_bundle.js not found"
    exit 1
}

$c = Get-Content $file -Raw

Write-Output "=== Checks on Netlify bundle ==="
Write-Output ("has railway URL:        " + $c.Contains("resumetic-ai-resume-analyzer-production.up.railway.app"))
Write-Output ("has fallback logic:     " + $c.Contains("retrying "))
Write-Output ("has isProductionHost:   " + $c.Contains("isProductionHost"))
Write-Output ("has local-wifi hint:    " + $c.Contains("same Wi-Fi"))
Write-Output ("has prod error message: " + $c.Contains("temporarily unavailable"))
Write-Output ("has LAN IP detection:   " + $c.Contains("192.168"))

