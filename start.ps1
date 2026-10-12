$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath $PSScriptRoot
$nodeExecutable = (Get-Command node -ErrorAction Stop).Source
$rsbuildCli = Join-Path $PSScriptRoot 'node_modules\@rsbuild\core\bin\rsbuild.js'
if (-not (Test-Path -LiteralPath $rsbuildCli)) {
    throw '请先在 web 目录运行 npm install。'
}
& $nodeExecutable $rsbuildCli dev
exit $LASTEXITCODE
