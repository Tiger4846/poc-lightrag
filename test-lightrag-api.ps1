param(
    [string]$BaseUrl = "http://localhost:9621",
    [string]$Question = "How many pages are in the OCR test document?"
)

$ErrorActionPreference = "Stop"

Add-Type -AssemblyName System.Net.Http

# Windows PowerShell 5.1 may decode JSON as the system code page.
# Read HTTP response bytes and decode them explicitly as UTF-8.
try {
    if ($PSVersionTable.PSVersion.Major -lt 7) {
        chcp 65001 > $null
    }
    [Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
    $OutputEncoding = New-Object System.Text.UTF8Encoding($false)
} catch {
    # Continue if the shell does not allow changing console encoding.
}

function Invoke-Utf8Json {
    param(
        [ValidateSet("GET", "POST")]
        [string]$Method,
        [string]$Uri,
        [hashtable]$Headers,
        [string]$Body
    )

    $client = New-Object System.Net.Http.HttpClient
    $request = New-Object System.Net.Http.HttpRequestMessage

    try {
        if ($Method -eq "GET") {
            $request.Method = [System.Net.Http.HttpMethod]::Get
        } else {
            $request.Method = [System.Net.Http.HttpMethod]::Post
        }

        $request.RequestUri = [System.Uri]$Uri

        foreach ($header in $Headers.GetEnumerator()) {
            $request.Headers.TryAddWithoutValidation($header.Key, [string]$header.Value) | Out-Null
        }

        if (-not [string]::IsNullOrEmpty($Body)) {
            $request.Content = New-Object System.Net.Http.StringContent -ArgumentList @(
                $Body,
                [System.Text.Encoding]::UTF8,
                "application/json"
            )
        }

        $response = $client.SendAsync($request).GetAwaiter().GetResult()
        $bytes = $response.Content.ReadAsByteArrayAsync().GetAwaiter().GetResult()
        $jsonText = [System.Text.Encoding]::UTF8.GetString($bytes)

        if (-not $response.IsSuccessStatusCode) {
            throw "HTTP $([int]$response.StatusCode): $jsonText"
        }

        return ($jsonText | ConvertFrom-Json)
    } finally {
        $request.Dispose()
        $client.Dispose()
    }
}

$envFile = Join-Path $PSScriptRoot "..\lightrag-server\.env"
if (-not (Test-Path -LiteralPath $envFile)) {
    throw "LightRAG .env was not found at $envFile"
}

$keyLine = Get-Content -LiteralPath $envFile |
    Where-Object { $_ -match "^LIGHTRAG_API_KEY=" } |
    Select-Object -First 1

$apiKey = if ($keyLine) {
    ($keyLine -split "=", 2)[1].Trim()
} else {
    ""
}

if ([string]::IsNullOrWhiteSpace($apiKey)) {
    throw "LIGHTRAG_API_KEY was not found in the LightRAG .env file"
}

$headers = @{ "X-API-Key" = $apiKey }

Write-Host "`n=== 1) Health check ===" -ForegroundColor Cyan
$health = Invoke-Utf8Json -Method GET -Uri "$BaseUrl/health" -Headers $headers
Write-Host "Status: $($health.status)"

Write-Host "`n=== 2) Documents ===" -ForegroundColor Cyan
$documents = Invoke-Utf8Json -Method GET -Uri "$BaseUrl/documents" -Headers $headers
$allDocuments = @(
    $documents.statuses.PSObject.Properties |
    ForEach-Object { $_.Value }
)

if ($allDocuments.Count -eq 0) {
    Write-Host "No documents found"
} else {
    $allDocuments |
        Select-Object id, file_path, status, chunks_count |
        Format-Table -AutoSize
}

Write-Host "`n=== 3) Retrieved chunks ===" -ForegroundColor Cyan
$dataBody = @{
    query = $Question
    mode = "naive"
    include_references = $true
    include_chunk_content = $true
} | ConvertTo-Json -Depth 8

$retrieved = Invoke-Utf8Json `
    -Method POST `
    -Uri "$BaseUrl/query/data" `
    -Headers $headers `
    -Body $dataBody

Write-Host "Question: $Question"
if ($retrieved.data.chunks) {
    $retrieved.data.chunks |
        Select-Object reference_id, file_path, content |
        Format-List
} else {
    Write-Host "No matching chunks found"
}

Write-Host "`n=== 4) Generated answer ===" -ForegroundColor Cyan
$queryBody = @{
    query = $Question
    mode = "naive"
    include_references = $true
} | ConvertTo-Json -Depth 8

$answer = Invoke-Utf8Json `
    -Method POST `
    -Uri "$BaseUrl/query" `
    -Headers $headers `
    -Body $queryBody

Write-Host $answer.response
if ($answer.references) {
    Write-Host "`nReferences:"
    $answer.references |
        Select-Object reference_id, file_path |
        Format-Table -AutoSize
}
