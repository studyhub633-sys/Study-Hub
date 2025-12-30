# PowerShell script to reorganize project into Frontend and Backend folders
# Run this from the project root: .\reorganize.ps1

Write-Host "Starting project reorganization..." -ForegroundColor Green

# Create Frontend and Backend directories
Write-Host "Creating Frontend and Backend directories..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path "Frontend" | Out-Null
New-Item -ItemType Directory -Force -Path "Backend" | Out-Null

# Move frontend files to Frontend/
Write-Host "Moving frontend files..." -ForegroundColor Yellow
$frontendFiles = @(
    "src",
    "public",
    "index.html",
    "vite.config.ts",
    "tailwind.config.ts",
    "postcss.config.js",
    "tsconfig.json",
    "tsconfig.app.json",
    "tsconfig.node.json",
    "components.json",
    "eslint.config.js"
)

foreach ($file in $frontendFiles) {
    if (Test-Path $file) {
        Move-Item -Path $file -Destination "Frontend\" -Force
        Write-Host "  Moved: $file" -ForegroundColor Gray
    }
}

# Move backend files to Backend/
Write-Host "Moving backend files..." -ForegroundColor Yellow
if (Test-Path "server") {
    Move-Item -Path "server" -Destination "Backend\" -Force
    Write-Host "  Moved: server/" -ForegroundColor Gray
}

if (Test-Path "api") {
    Move-Item -Path "api" -Destination "Backend\" -Force
    Write-Host "  Moved: api/" -ForegroundColor Gray
}

# Copy package.json to Frontend (will be updated separately)
if (Test-Path "package.json") {
    Copy-Item -Path "package.json" -Destination "Frontend\package.json" -Force
    Write-Host "  Copied: package.json to Frontend/" -ForegroundColor Gray
}

# Copy package-lock.json if exists
if (Test-Path "package-lock.json") {
    Copy-Item -Path "package-lock.json" -Destination "Frontend\package-lock.json" -Force
    Write-Host "  Copied: package-lock.json to Frontend/" -ForegroundColor Gray
}

Write-Host "`nReorganization complete!" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Update Frontend/package.json (remove backend dependencies)" -ForegroundColor White
Write-Host "2. Update Backend/package.json (create new one for backend)" -ForegroundColor White
Write-Host "3. Update vercel.json paths" -ForegroundColor White
Write-Host "4. Run 'cd Frontend && npm install' to install frontend dependencies" -ForegroundColor White
Write-Host "5. Run 'cd Backend && npm install' to install backend dependencies" -ForegroundColor White






