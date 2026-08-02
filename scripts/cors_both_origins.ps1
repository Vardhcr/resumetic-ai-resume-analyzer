$ErrorActionPreference = "Continue"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/cors_both_result.txt"

"=== CORS probe for both deployed origins ===" | Out-File $out -Encoding utf8

$origins = @(
    "https://vardhcr.github.io",
    "https://resumetic.netlify.app"
)

foreach ($origin in $origins) {
    try {
        $resp = Invoke-WebRequest -Uri "https://resumetic-ai-resume-analyzer-production.up.railway.app/resume/upload" -Method Options -Headers @{
            "Origin" = $origin
            "Access-Control-Request-Method" = "POST"
            "Access-Control-Request-Headers" = "content-type"
            "User-Agent" = "Mozilla/5.0 (Linux; Android 13) Chrome/120 Mobile"
        } -UseBasicParsing -TimeoutSec 30

        $aca = $resp.Headers["Access-Control-Allow-Origin"]
        $line = "Origin: $origin -> HTTP $($resp.StatusCode) | ACAO: [$aca]"
        Write-Output $line
        $line | Out-File $out -Append -Encoding utf8
    } catch {
        $code = ""
        try { $code = $_.Exception.Response.StatusCode.value__ } catch {}
        $hdr = $_.Exception.Response.Headers
        $aca = $null
        try { $aca = $hdr["Access-Control-Allow-Origin"] } catch {}
        $line = "Origin: $origin -> ERROR HTTP [$code] | ACAO: [$aca]"
        Write-Output $line
        $line | Out-File $out -Append -Encoding utf8
    }
}

