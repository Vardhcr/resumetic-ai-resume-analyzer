$ErrorActionPreference = "Continue"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/upload_test_result.txt"

"=== Full Upload Test to Railway ===" | Out-File $out -Encoding utf8

# Create a minimal but valid PDF via base64 (small, opens with PyMuPDF)
$b64 = "JVBERi0xLjQKJcOjw6MKMCAwIG9iago8PC9UeXBlL0NhdGFsb2cvUGFnZXMgMSAwIFIvT3V0bGluZXMgMiAwIFIvTWV0YWRhdGEgMyAwIFI+PgplbmRvYmoKMSAwIG9iago8PC9UeXBlL1BhZ2VzL0NvdW50IDEvS2lkcyBbNCAwIFJdPj4KZW5kb2JqCjIgMCBvYmoKPDwvVHlwZS9PdXRsaW5lcy9Db3VudCAwPj4KZW5kb2JqCjMgMCBvYmoKPDwvTGVuZ3RoIDMxMS9UeXBlL01ldGFkYXRhL1N1YnR5cGUvWE1ML0xlbmd0aCAzMTE+PgokJVBBUFBFRDAtTU5CVS1DSwplbmRvYmoKNCAwIG9iago8PC9UeXBlL1BhZ2UvUGFyZW50IDEgMCBSL01lZGlhQm94IFswIDAgNjEyIDc5Ml0vQ29udGVudHMgNSAwIFIvUmVzb3VyY2VzPDwvRm9udDw8L0YxIDYgMCBSPj4vUHJvY1NldCBbL1BERi9UZXh0XSA+PgplbmRvYmoKNSAwIG9iago8PC9MZW5ndGggNTgvRmlsdGVyL0ZsYXRlRGVjb2RlPj4Kc3RyZWFtCngKSfQ1NDRT0FAwslIoyUhRSEksz6tUyCxW4AAA4lMFqAplbmRzdHJlYW0KZW5kb2JqCjYgMCBvYmoKPDwvVHlwZS9Gb250L1N1YnR5cGUvVHlwZTEvQmFzZUZvbnQvSGVsdmV0aWNhL0VuY29kaW5nL1dpbkFuc2lFbmNvZGluZz4+CmVuZG9iagp4cmVmCjAgNwowMDAwMDAwMDAwIDY1NTM1IGYKMDAwMDAwMDAxNSAwMDAwMCBuCjAwMDAwMDAwNTcgMDAwMDAgbgowMDAwMDAwMTE2IDAwMDAwIG4KMDAwMDAwMDIxNiAwMDAwMCBuCjAwMDAwMDAzNTIgMDAwMDAgbgowMDAwMDAwNDU3IDAwMDAwIG4KdHJhaWxlcgo8PC9TaXplIDcvUm9vdCAwIDAgUj4+CnN0YXJ0eHJlZgo1MDUKJSVFT0YK"
$pdfPath = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/test_sample.pdf"
try {
    [System.IO.File]::WriteAllBytes($pdfPath, [Convert]::FromBase64String($b64))
    "Created test PDF: $pdfPath" | Out-File $out -Append -Encoding utf8
} catch {
    "Failed to write PDF: $($_.Exception.Message)" | Out-File $out -Append -Encoding utf8
}

try {
    $resp = Invoke-WebRequest -Uri "https://resumetic-ai-resume-analyzer-production.up.railway.app/resume/upload" -Method Post -Form @{
        file = Get-Item $pdfPath
    } -Headers @{
        "Origin" = "https://vardhcr.github.io"
        "User-Agent" = "Mozilla/5.0 (Linux; Android 13) AppleWebKit/537.36 Chrome/120 Mobile Safari/537.36"
    } -UseBasicParsing -TimeoutSec 90

    "HTTP: $($resp.StatusCode)" | Out-File $out -Append -Encoding utf8
    "ACAO: $($resp.Headers['Access-Control-Allow-Origin'])" | Out-File $out -Append -Encoding utf8
    "Body(300): $($resp.Content.Substring(0, [Math]::Min(300, $resp.Content.Length)))" | Out-File $out -Append -Encoding utf8
    "RESULT: UPLOAD REACHED BACKEND" | Out-File $out -Append -Encoding utf8
} catch {
    "ERROR: $($_.Exception.Message)" | Out-File $out -Append -Encoding utf8
    try { "HTTP Status: $($_.Exception.Response.StatusCode.value__)" | Out-File $out -Append -Encoding utf8 } catch {}
    "RESULT: UPLOAD FAILED TO REACH BACKEND" | Out-File $out -Append -Encoding utf8
}

Get-Content $out

