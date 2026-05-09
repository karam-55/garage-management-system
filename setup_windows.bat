@echo off
echo ========================================
echo Garage Go - Windows Setup Script
echo ========================================
echo.

:: Check if running as administrator
net session >nul 2>&1
if %errorLevel% neq 0 (
    echo Please run this script as Administrator!
    pause
    exit /b 1
)

:: Install Chocolatey if not installed
where choco >nul 2>&1
if %errorLevel% neq 0 (
    echo Installing Chocolatey...
    powershell -Command "Set-ExecutionPolicy Bypass -Scope Process -Force; [System.Net.ServicePointManager]::SecurityProtocol = [System.Net.ServicePointManager]::SecurityProtocol -bor 3072; iex ((New-Object System.Net.WebClient).DownloadString('https://community.chocolatey.org/install.ps1'))"
    if %errorLevel% neq 0 (
        echo Failed to install Chocolatey!
        pause
        exit /b 1
    )
    echo Chocolatey installed successfully!
)

:: Install Node.js and npm
echo Installing Node.js...
choco install nodejs -y
if %errorLevel% neq 0 (
    echo Failed to install Node.js!
    pause
    exit /b 1
)
echo Node.js installed successfully!

:: Install PostgreSQL
echo Installing PostgreSQL...
choco install postgresql -y
if %errorLevel% neq 0 (
    echo Failed to install PostgreSQL!
    pause
    exit /b 1
)
echo PostgreSQL installed successfully!

:: Install Git
echo Installing Git...
choco install git -y
if %errorLevel% neq 0 (
    echo Failed to install Git!
    pause
    exit /b 1
)
echo Git installed successfully!

:: Install Docker Desktop (optional)
echo Installing Docker Desktop...
choco install docker-desktop -y
if %errorLevel% neq 0 (
    echo Warning: Failed to install Docker Desktop (optional)
)

:: Install Android Studio
echo Installing Android Studio...
choco install androidstudio -y
if %errorLevel% neq 0 (
    echo Failed to install Android Studio!
    pause
    exit /b 1
)
echo Android Studio installed successfully!

:: Download Flutter SDK
echo Downloading Flutter SDK...
if not exist "C:\" mkdir "C:\flutter"
cd /d C:\
powershell -Command "Invoke-WebRequest -Uri 'https://storage.googleapis.com/flutter_infra_release/releases/stable/windows/flutter_windows_3.16.0-stable.zip' -OutFile 'flutter_sdk.zip'"
powershell -Command "Expand-Archive -Path 'flutter_sdk.zip' -DestinationPath 'C:\'"
del flutter_sdk.zip

:: Add Flutter to PATH
echo Adding Flutter to PATH...
setx PATH "%PATH%;C:\flutter\bin" /M

:: Install VS Code
echo Installing VS Code...
choco install vscode -y
if %errorLevel% neq 0 (
    echo Warning: Failed to install VS Code (optional)
)

:: Create project directories
echo Creating project directories...
cd /d "%~dp0"
if not exist "garage-go-backend" mkdir garage-go-backend
if not exist "garage-go-mobile" mkdir garage-go-mobile

:: Setup Backend
echo Setting up Backend...
cd garage-go-backend
call npm install
if %errorLevel% neq 0 (
    echo Failed to install backend dependencies!
    pause
    exit /b 1
)

:: Copy environment file
if not exist ".env" (
    copy .env.example .env
    echo Please edit .env file with your database credentials!
)

:: Setup Desktop App (Electron)
echo Setting up Desktop App...
cd ..\garage-go-desktop
call npm install
if %errorLevel% neq 0 (
    echo Failed to install desktop dependencies!
    pause
    exit /b 1
)
echo Desktop app dependencies installed!

:: Setup Mobile App
echo Setting up Mobile App...
cd ..\garage-go-mobile
if exist "pubspec.yaml" (
    call flutter pub get
    if %errorLevel% neq 0 (
        echo Warning: Failed to install mobile dependencies
    )
) else (
    echo Mobile app not yet initialized, skipping...
)

:: Run Flutter doctor
echo Running Flutter doctor...
call flutter doctor

echo.
echo ========================================
echo Setup completed successfully!
echo ========================================
echo.
echo Next steps:
echo 1. Restart your computer
echo 2. Configure database in backend/.env
echo 3. Run 'npx prisma migrate dev' in backend folder
echo 4. Run 'npm run dev' in backend folder
echo 5. Run 'npm run electron-dev' in garage-go-desktop folder
echo 6. For mobile: Open Android Studio and run Flutter app
echo.
pause
