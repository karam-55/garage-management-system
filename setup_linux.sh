#!/bin/bash

echo "========================================"
echo "Garage Go - Linux Setup Script"
echo "========================================"
echo

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo "Please don't run this script as root!"
    exit 1
fi

# Update package manager
echo "Updating package manager..."
if command -v apt &> /dev/null; then
    sudo apt update
    sudo apt upgrade -y
elif command -v yum &> /dev/null; then
    sudo yum update -y
    sudo yum upgrade -y
elif command -v dnf &> /dev/null; then
    sudo dnf update -y
    sudo dnf upgrade -y
else
    echo "Unsupported package manager!"
    exit 1
fi

# Install Node.js and npm
echo "Installing Node.js..."
if command -v apt &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt install -y nodejs
elif command -v yum &> /dev/null; then
    sudo yum install -y nodejs npm
elif command -v dnf &> /dev/null; then
    sudo dnf install -y nodejs npm
fi

if [[ $? -ne 0 ]]; then
    echo "Failed to install Node.js!"
    exit 1
fi
echo "Node.js installed successfully!"

# Install PostgreSQL
echo "Installing PostgreSQL..."
if command -v apt &> /dev/null; then
    sudo apt install -y postgresql postgresql-contrib
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif command -v yum &> /dev/null; then
    sudo yum install -y postgresql-server postgresql-contrib
    sudo postgresql-setup initdb
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
elif command -v dnf &> /dev/null; then
    sudo dnf install -y postgresql-server postgresql-contrib
    sudo postgresql-setup initdb
    sudo systemctl start postgresql
    sudo systemctl enable postgresql
fi

if [[ $? -ne 0 ]]; then
    echo "Failed to install PostgreSQL!"
    exit 1
fi
echo "PostgreSQL installed successfully!"

# Install Git
echo "Installing Git..."
if command -v apt &> /dev/null; then
    sudo apt install -y git
elif command -v yum &> /dev/null; then
    sudo yum install -y git
elif command -v dnf &> /dev/null; then
    sudo dnf install -y git
fi

if [[ $? -ne 0 ]]; then
    echo "Failed to install Git!"
    exit 1
fi
echo "Git installed successfully!"

# Install Docker (optional)
echo "Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER
rm get-docker.sh

if [[ $? -ne 0 ]]; then
    echo "Warning: Failed to install Docker (optional)"
fi

# Install VS Code (optional)
echo "Installing VS Code..."
if command -v apt &> /dev/null; then
    wget -qO- https://packages.microsoft.com/keys/microsoft.asc | gpg --dearmor > packages.microsoft.gpg
    sudo install -o root -g root -m 644 packages.microsoft.gpg /etc/apt/trusted.gpg.d/
    sudo sh -c 'echo "deb [arch=amd64,arm64,armhf signed-by=/etc/apt/trusted.gpg.d/packages.microsoft.gpg] https://packages.microsoft.com/repos/code stable main" > /etc/apt/sources.list.d/vscode.list'
    sudo apt update
    sudo apt install -y code
elif command -v yum &> /dev/null; then
    sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
    sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
    sudo yum check-update
    sudo yum install -y code
elif command -v dnf &> /dev/null; then
    sudo rpm --import https://packages.microsoft.com/keys/microsoft.asc
    sudo sh -c 'echo -e "[code]\nname=Visual Studio Code\nbaseurl=https://packages.microsoft.com/yumrepos/vscode\nenabled=1\ngpgcheck=1\ngpgkey=https://packages.microsoft.com/keys/microsoft.asc" > /etc/yum.repos.d/vscode.repo'
    sudo dnf check-update
    sudo dnf install -y code
fi

if [[ $? -ne 0 ]]; then
    echo "Warning: Failed to install VS Code (optional)"
fi

# Download Flutter SDK
echo "Downloading Flutter SDK..."
cd ~
wget https://storage.googleapis.com/flutter_infra_release/releases/stable/linux/flutter_linux_3.16.0-stable.tar.xz
tar xf flutter_linux_3.16.0-stable.tar.xz
rm flutter_linux_3.16.0-stable.tar.xz

# Add Flutter to PATH
echo "Adding Flutter to PATH..."
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.bashrc
export PATH="$PATH:$HOME/flutter/bin"

# Install Android dependencies
echo "Installing Android dependencies..."
if command -v apt &> /dev/null; then
    sudo apt install -y unzip openjdk-11-jdk wget
elif command -v yum &> /dev/null; then
    sudo yum install -y unzip java-11-openjdk-devel wget
elif command -v dnf &> /dev/null; then
    sudo dnf install -y unzip java-11-openjdk-devel wget
fi

# Download Android Studio
echo "Downloading Android Studio..."
cd ~
wget https://dl.google.com/dl/android/studio/ide-zips/2023.2.1.21/android-studio-2023.2.1.21-linux.tar.gz
tar -xzf android-studio-2023.2.1.21-linux.tar.gz
rm android-studio-2023.2.1.21-linux.tar.gz

# Create desktop entry for Android Studio
echo "Creating desktop entry for Android Studio..."
cat > ~/.local/share/applications/android-studio.desktop << EOF
[Desktop Entry]
Version=1.0
Type=Application
Name=Android Studio
Comment=Android development environment
Exec=$HOME/android-studio/bin/studio.sh
Icon=$HOME/android-studio/bin/studio.png
Categories=Development;IDE;
Terminal=false
StartupWMClass=jetbrains-android-studio
EOF

# Create project directories
echo "Creating project directories..."
cd "$(dirname "$0")"
mkdir -p garage-go-backend
mkdir -p garage-go-mobile

# Setup Backend
echo "Setting up Backend..."
cd garage-go-backend
npm install
if [[ $? -ne 0 ]]; then
    echo "Failed to install backend dependencies!"
    exit 1
fi

# Copy environment file
if [[ ! -f ".env" ]]; then
    cp .env.example .env
    echo "Please edit .env file with your database credentials!"
fi

# Setup Mobile App
echo "Setting up Mobile App..."
cd ../garage-go-mobile
flutter pub get
if [[ $? -ne 0 ]]; then
    echo "Failed to install mobile dependencies!"
    exit 1
fi

# Run Flutter doctor
echo "Running Flutter doctor..."
flutter doctor

# Create database
echo "Creating database..."
sudo -u postgres createdb garage_go_db 2>/dev/null || echo "Database might already exist"

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Open Android Studio from applications menu"
echo "2. Install Flutter plugin in Android Studio"
echo "3. Configure Android SDK in Android Studio"
echo "4. Run 'flutter doctor' to verify setup"
echo "5. Configure database in backend/.env"
echo "6. Run 'npm run dev' in backend folder"
echo "7. Run 'flutter run' in mobile folder"
echo
echo "Please restart your terminal to use all installed tools!"
