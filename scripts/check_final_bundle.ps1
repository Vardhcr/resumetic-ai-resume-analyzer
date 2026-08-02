$ErrorActionPreference = "Continue"
$file = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/final_bundle.js"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/final_bundle_checks.txt"

if (-not (Test-Path $file)) {
    "bundle not found" | Out-File $out -Encoding utf8
    exit 1
}
$c = Get-Content -Raw $file

$lines = @(
    "railway_url:       " + $c.Contains("resumetic-ai-resume-analyzer-production.up.railway.app"),
    "warm_up:           " + $c.Contains("warm"),
    "warmup_ping:       " + $c.Contains("warm-up"),
    "retry_logic:       " + $c.Contains("retrying"),
    "retry_backoff:     " + $c.Contains("2") ,
    "max_attempts:      " + $c.Contains("3"),
    "timeout_90s:       " + $c.Contains("90000"),
    "isProductionHost:  " + $c.Contains("isProductionHost"),
    "autoretried_msg:   " + $c.Contains("we retried automatically")
)
$lines | Out-File $out -Encoding utf8
Write-Output ($lines -join "`n")

