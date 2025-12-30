
$files = Get-ChildItem -Filter "*.html"
foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw
    $newContent = $content -replace "11 KM Raiwind Road, Lahore", "Apartment site Lahore villas 11km Raiwind Road Near Adda Plot Lahore"
    $newContent = $newContent -replace "11 KM Raiwind Road, Near Adda Plot, Lahore", "Apartment site Lahore villas 11km Raiwind Road Near Adda Plot Lahore"
    Set-Content -Path $file.FullName -Value $newContent -Encoding UTF8
    Write-Host "Updated $($file.Name)"
}
