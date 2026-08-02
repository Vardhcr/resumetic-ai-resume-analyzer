$ErrorActionPreference = "Continue"

function Check-Bundle($file, $label) {
    Write-Output "=== $label ==="
    if (-not (Test-Path $file)) {
        Write-Output "  not found"
        return
    }
    $c = Get-Content $file -Raw
    Write-Output ("  has railway URL:        " + $c.Contains("resumetic-ai-resume-analyzer-production.up.railway.app"))
    Write-Output ("  has fallback logic:     " + $c.Contains("retrying "))
    Write-Output ("  has isProductionHost:   " + $c.Contains("isProductionHost"))
    Write-Output ("  has local-wifi hint:    " + $c.Contains("same Wi-Fi"))
    Write-Output ("  has prod error message: " + $c.Contains("temporarily unavailable"))
    Write-Output ("  has LAN IP detection:   " + $c.Contains("192.168"))
}

Check-Bundle "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/live_ghpages.js" "LIVE GitHub Pages bundle"
Check-Bundle "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/netlify_bundle.js" "LIVE Netlify bundle"


