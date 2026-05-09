#!/bin/bash

echo "========================================"
echo "Garage Go - macOS Setup Script"
echo "========================================"
echo

# Check if running as root
if [[ $EUID -eq 0 ]]; then
    echo "Please don't run this script as root!"
    exit 1
fi

# Install Homebrew if not installed
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
    if [[ $? -ne 0 ]]; then
        echo "Failed to install Homebrew!"
        exit 1
    fi
    echo "Homebrew installed successfully!"
    
    # Add Homebrew to PATH
    echo 'eval "$(/opt/homebrew/bin/brew shellenv)"' >> ~/.zshrc
    eval "$(/opt/homebrew/bin/brew shellenv)"
fi

# Update Homebrew
echo "Updating Homebrew..."
brew update

# Install Node.js and npm
echo "Installing Node.js..."
brew install node
if [[ $? -ne 0 ]]; then
    echo "Failed to install Node.js!"
    exit 1
fi
echo "Node.js installed successfully!"

# Install PostgreSQL
echo "Installing PostgreSQL..."
brew install postgresql@14
brew services start postgresql@14
if [[ $? -ne 0 ]]; then
    echo "Failed to install PostgreSQL!"
    exit 1
fi
echo "PostgreSQL installed successfully!"

# Install Git
echo "Installing Git..."
brew install git
if [[ $? -ne 0 ]]; then
    echo "Failed to install Git!"
    exit 1
fi
echo "Git installed successfully!"

# Install Docker Desktop (optional)
echo "Installing Docker Desktop..."
brew install --cask docker
if [[ $? -ne 0 ]]; then
    echo "Warning: Failed to install Docker Desktop (optional)"
fi

# Install Android Studio
echo "Installing Android Studio..."
brew install --cask android-studio
if [[ $? -ne 0 ]]; then
    echo "Failed to install Android Studio!"
    exit 1
fi
echo "Android Studio installed successfully!"

# Install VS Code
echo "Installing VS Code..."
brew install --cask visual-studio-code
if [[ $? -ne 0 ]]; then
    echo "Warning: Failed to install VS Code (optional)"
fi

# Download Flutter SDK
echo "Downloading Flutter SDK..."
cd ~
curl -O https://storage.googleapis.com/flutter_infra_release/releases/stable/macos/flutter_macos_3.16.0-stable.zip
unzip flutter_macos_3.16.0-stable.zip
rm flutter_macos_3.16.0-stable.zip

# Add Flutter to PATH
echo "Adding Flutter to PATH..."
echo 'export PATH="$PATH:$HOME/flutter/bin"' >> ~/.zshrc
export PATH="$PATH:$HOME/flutter/bin"

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
createdb garage_go_db 2>/dev/null || echo "Database might already exist"

echo
echo "========================================"
echo "Setup completed successfully!"
echo "========================================"
echo
echo "Next steps:"
echo "1. Open Android Studio and install Flutter plugin"
echo "2. Configure Android SDK in Android Studio"
echo "3. Run 'flutter doctor' to verify setup"
echo "4. Configure database in backend/.env"
echo "5. Run 'npm run dev' in backend folder"
echo "6. Run 'flutter run' in mobile folder"
echo
echo "Please restart your terminal to use all installed tools!"
