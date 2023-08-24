@echo off
mkdir skins-webp
for %%I in (skins\*.png) do (
    cwebp -q 80 "%%I" -o "skins-webp\%%~nI.webp"
)