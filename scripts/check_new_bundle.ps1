$ErrorActionPreference = "Continue"
$file = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/live_ghpages_new.js"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/new_bundle_checks.txt"

if (-not (Test-Path $file)) {
    Write-Output "bundle not found" | Out-File $out -Encoding utf8
    exit 1
}
$c = Get-Content -Raw $file

$lines = @(
    "railway_url:       " + $c.Contains("resumetic-ai-resume-analyzer-production.up.railway.app"),
    "fallback_logic:    " + $c.Contains("retrying "),
    "isProductionHost:  " + $c.Contains("isProductionHost"),
    "real_error_msg:    " + $c.Contains("Network error"),
    "status_in_msg:     " + $c.Contains("HTTP ") + " (413/500 handling)",
    "attempted_url:     " + $c.Contains("attempted")
)
$lines | Out-File $out -Encoding utf8
Write-Output ($lines -join "`n")

