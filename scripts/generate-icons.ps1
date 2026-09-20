Add-Type -AssemblyName System.Drawing

$iconsDir = Join-Path $PSScriptRoot "..\public\icons"
if (-not (Test-Path $iconsDir)) {
    New-Item -ItemType Directory -Force -Path $iconsDir | Out-Null
}

function Create-DaylogIcon {
    param(
        [int]$Dimensions,
        [string]$FileName,
        [double]$PaddingPct,
        [double]$CornerPct
    )

    $filePath = Join-Path $iconsDir $FileName
    $bmp = New-Object System.Drawing.Bitmap $Dimensions, $Dimensions
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

    # Background canvas: Daylog Warm Parchment #F7F4EE
    $bgBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#F7F4EE'))
    $g.FillRectangle($bgBrush, 0, 0, $Dimensions, $Dimensions)

    # 2x2 grid math
    $pad = [Math]::Round($Dimensions * $PaddingPct)
    $content = $Dimensions - (2 * $pad)
    $gap = [Math]::Round($content * 0.12)
    $sq = [Math]::Round(($content - $gap) / 2)
    $r = [Math]::Round($sq * $CornerPct)
    $d = $r * 2

    $inkBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#18181B'))
    $blueBrush = New-Object System.Drawing.SolidBrush ([System.Drawing.ColorTranslator]::FromHtml('#6284EB'))

    # Helper function to fill rounded rect
    $drawSquare = {
        param([float]$x, [float]$y, [System.Drawing.Brush]$brush)
        $gp = New-Object System.Drawing.Drawing2D.GraphicsPath
        $gp.AddArc($x, $y, $d, $d, 180, 90)
        $gp.AddArc($x + $sq - $d, $y, $d, $d, 270, 90)
        $gp.AddArc($x + $sq - $d, $y + $sq - $d, $d, $d, 0, 90)
        $gp.AddArc($x, $y + $sq - $d, $d, $d, 90, 90)
        $gp.CloseFigure()
        $g.FillPath($brush, $gp)
        $gp.Dispose()
    }

    # Top Left (Deep Ink)
    & $drawSquare $pad $pad $inkBrush
    # Top Right (Deep Ink)
    & $drawSquare ($pad + $sq + $gap) $pad $inkBrush
    # Bottom Left (Deep Ink)
    & $drawSquare $pad ($pad + $sq + $gap) $inkBrush
    # Bottom Right (Signature Royal Blue Accent)
    & $drawSquare ($pad + $sq + $gap) ($pad + $sq + $gap) $blueBrush

    $bmp.Save($filePath, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
    Write-Output "Created: $filePath"
}

Create-DaylogIcon -Dimensions 192 -FileName "icon-192.png" -PaddingPct 0.20 -CornerPct 0.30
Create-DaylogIcon -Dimensions 512 -FileName "icon-512.png" -PaddingPct 0.20 -CornerPct 0.30
Create-DaylogIcon -Dimensions 512 -FileName "icon-maskable.png" -PaddingPct 0.28 -CornerPct 0.30
Create-DaylogIcon -Dimensions 180 -FileName "apple-touch-icon.png" -PaddingPct 0.20 -CornerPct 0.30
