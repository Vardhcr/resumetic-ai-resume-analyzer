$ErrorActionPreference = "Continue"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/cors_probe_result.txt"

"=== CORS Probe ===" | Out-File $out -Encoding utf8

try {
    $resp = Invoke-WebRequest -Uri "https://resumetic-ai-resume-analyzer-production.up.railway.app/resume/upload" -Method Options -Headers @{
        "Origin" = "https://vardhcr.github.io"
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
        "User-Agent" = "Mozilla/5.0"
    } -UseBasicParsing -TimeoutSec 30

    "HTTP: $($resp.StatusCode)" | Out-File $out -Append -Encoding utf8
    $aca = $resp.Headers["Access-Control-Allow-Origin"]
    "Access-Control-Allow-Origin: [$aca]" | Out-File $out -Append -Encoding utf8
    if ($aca -match "vardhcr\.github\.io") {
        "RESULT: CORS FIX IS LIVE" | Out-File $out -Append -Encoding utf8
    } else {
        "RESULT: CORS STILL BLOCKED - backend NOT redeployed" | Out-File $out -Append -Encoding utf8
    }
} catch {
    $code = ""
    try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
    "ERROR HTTP: $code" | Out-File $out -Append -Encoding utf8
    $hdr = $_.Exception.Response.Headers
    $aca = $null
    try { $aca = $hdr["Access-Control-Allow-Origin"] } catch {}
    if (-not $aca) {
        "Access-Control-Allow-Origin: [NONE]" | Out-File $out -Append -Encoding utf8
        "RESULT: CORS STILL BLOCKED - backend NOT redeployed" | Out-File $out -Append -Encoding utf8
    }
}

Get-Content $out

