while ($true) {
    git add -A
    $msg = "auto-commit $(Get-Date -Format 'yyyy-MM-ddTHH:mm:ss')"
    git commit -m $msg --allow-empty
    git push
    Start-Sleep -Seconds 5
}
