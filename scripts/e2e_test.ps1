$ErrorActionPreference = "Continue"
$out = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/e2e_result.txt"
"" | Out-File $out -Encoding utf8

# Generate a tiny valid PDF
$pdf = "c:/Users/Jyothi/OneDrive/Documents/ai-resume-analyzer/scripts/test_mobile.pdf"
$pdfContent = @"
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 90 >>
stream
BT /F1 18 Tf 72 700 Td (Resumetic Mobile Test - Jyothi Vardhan Resume) Tj ET
BT /F1 12 Tf 72 670 Td (Software Engineer with Python, React, AWS, FastAPI skills.) Tj ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
0000000245 00000 n 
0000000382 00000 n 
trailer
<< /Size 6 /Root 1 0 R >>
startxref
426
%%EOF
"@ -replace "`n", "`r`n"
[System.IO.File]::WriteAllBytes($pdf, [System.Text.Encoding]::ASCII.GetBytes($pdfContent))

foreach ($origin in @("https://vardhcr.github.io", "https://resumetic.netlify.app")) {
    Write-Output "=== Upload test from origin: $origin ==="
    "-- === Upload test from origin: $origin ===" | Out-File $out -Append -Encoding utf8
    try {
        $resp = curl.exe -s -o - -w "`nHTTP_STATUS_CODE:%{http_code}" "https://resumetic-ai-resume-analyzer-production.up.railway.app/resume/upload" -H "Origin: $origin" -F "file=@$pdf;type=application/pdf"
        $body = $resp -join ""
        $httpMatch = [regex]::Match($body, "HTTP_STATUS_CODE:(\d+)")
        $status = $httpMatch.Groups[1].Value
        $jsonPart = $body -replace "HTTP_STATUS_CODE:\d+$", ""

        $statusLine = "  HTTP: $status"
        $successLine = "  Success: " + ($jsonPart -match '"success":true')
        $scoreLine = "  ATS_score_present: " + ($jsonPart -match '"ats_score"')
        Write-Output $statusLine
        Write-Output $successLine
        Write-Output $scoreLine
        # Save truncate
        if ($jsonPart.Length -gt 300) { $jsonPart = $jsonPart.Substring(0,300) }
        $jsonPart | Out-File $out -Append -Encoding utf8
    } catch {
        $line = "  FAILED: $($_.Exception.Message)"
        Write-Output $line
        $line | Out-File $out -Append -Encoding utf8
    }
}

