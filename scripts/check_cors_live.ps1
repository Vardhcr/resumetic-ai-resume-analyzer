$ErrorActionPreference = "Continue"

$url = "https://resumetic-ai-resume-analyzer-production.up.railway.app/resume/upload"
$origin = "https://vardhcr.github.io"

Write-Output "=== CORS preflight OPTIONS to Railway backend ==="
Write-Output ("Origin: " + $origin)
Write-Output ("Target: " + $url)
Write-Output ""

try {
    $resp = Invoke-WebRequest -Uri $url -Method Options -Headers @{
        "Origin" = $origin
        "Access-Control-Request-Method" = "POST"
        "Access-Control-Request-Headers" = "content-type"
        "User-Agent" = "Mozilla/5.0"
    } -UseBasicParsing -TimeoutSec 30

    Write-Output ("HTTP " + $resp.StatusCode)
    Write-Output "Response headers:"
    $resp.Headers.GetEnumerator() | ForEach-Object { Write-Output ("  " + $_.Key + ": " + $_.Value) }
    $acao = $resp.Headers["Access-Control-Allow-Origin"]
    if (-not $acao) {
        Write-Output ""
        Write-Output "!!! NO Access-Control-Allow-Origin header -> CORS STILL BLOCKED (backend not redeployed)"
    } else {
        Write-Output ""
        Write-Output "Access-Control-Allow-Origin = $acao  (FIX IS LIVE)"
    }
} catch {
    $code = $_.Exception.Response.StatusCode.value__
    Write-Output ("Preflight returned HTTP " + $code)
    $hdr = $_.Exception.Response.Headers
    Write-Output "Response headers:"
    try { $hdr.AllKeys | ForEach-Object { Write-Output ("  " + $_ + ": " + $hdr[$_]) } } catch { $hdr.GetEnumerator() | ForEach-Object { Write-Output ("  " + $_.Key + ": " + $_.Value) } }
    if (-not $hdr["Access-Control-Allow-Origin"]) {
        Write-Output ""
        Write-Output "!!! NO Access-Control-Allow-Origin header -> CORS STILL BLOCKED (backend not redeployed)"
    }
}

