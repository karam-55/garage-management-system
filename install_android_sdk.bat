@echo off
echo ========================================
echo Installing Android SDK
echo ========================================

:: Create Android directory
if not exist "C:\Android" mkdir "C:\Android"

:: Download Android SDK command line tools
echo Downloading Android SDK command line tools...
powershell -Command "Invoke-WebRequest -Uri 'https://dl.google.com/android/repository/commandlinetools-win-9477386_latest.zip' -OutFile 'C:\Android\cmdline-tools.zip'"

:: Extract if download was successful
if exist "C:\Android\cmdline-tools.zip" (
    echo Extracting Android SDK tools...
    powershell -Command "Expand-Archive -Path 'C:\Android\cmdline-tools.zip' -DestinationPath 'C:\Android\temp' -Force"
    
    :: Move to correct location
    if exist "C:\Android\temp\cmdline-tools" (
        move "C:\Android\temp\cmdline-tools" "C:\Android\cmdline-tools\latest"
        rmdir "C:\Android\temp"
    )
    
    del "C:\Android\cmdline-tools.zip"
    echo Android SDK command line tools installed successfully!
) else (
    echo Failed to download Android SDK tools
    echo Please install Android SDK manually through Android Studio
)

:: Set environment variables
echo Setting environment variables...
setx ANDROID_HOME "C:\Android" /M
setx ANDROID_SDK_ROOT "C:\Android" /M

:: Add to PATH
setx PATH "%PATH%;C:\Android\cmdline-tools\latest\bin;C:\Android\platform-tools" /M

echo.
echo ========================================
echo Installation completed!
echo ========================================
echo.
echo Next steps:
echo 1. Open Android Studio
echo 2. Go to Tools > SDK Manager
echo 3. Install Android SDK Platform 33
echo 4. Install required build tools
echo 5. Run: flutter doctor --android-licenses
echo.
pause
