@echo off
setlocal enabledelayedexpansion

set "outputFile=skins.json"
echo [ > %outputFile%

set "firstItem=true"
for %%F in (skins\*.png) do (
    set "filename=%%~nF"
    if !firstItem! == true (
        echo   { "name": "!filename!" } >> %outputFile%
        set "firstItem=false"
    ) else (
        echo   ,{ "name": "!filename!" } >> %outputFile%
    )
)

echo ] >> %outputFile%

echo Conversion completed.
