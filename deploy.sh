#!/bin/bash

# Unified System Complete - Deployment Script
# This script handles the complete deployment process

set -e

echo "🚀 Starting deployment of Unified System Complete..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    print_error "Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

print_success "Node.js $(node -v) detected"

# Install dependencies
print_status "Installing dependencies..."
npm ci --only=production

# Build the application
print_status "Building application for production..."
npm run build

if [ $? -eq 0 ]; then
    print_success "Build completed successfully!"
else
    print_error "Build failed!"
    exit 1
fi

# Check if Docker is available
if command -v docker &> /dev/null; then
    print_status "Docker detected. Building Docker image..."
    
    # Build Docker image
    docker build -t unified-system:latest .
    
    if [ $? -eq 0 ]; then
        print_success "Docker image built successfully!"
        
        # Check if docker-compose is available
        if command -v docker-compose &> /dev/null; then
            print_status "Starting application with Docker Compose..."
            docker-compose up -d
            
            if [ $? -eq 0 ]; then
                print_success "Application started successfully!"
                print_status "Application is available at: http://localhost:3000"
            else
                print_error "Failed to start application with Docker Compose"
                exit 1
            fi
        else
            print_warning "Docker Compose not found. You can run the container manually:"
            print_status "docker run -p 3000:80 unified-system:latest"
        fi
    else
        print_error "Docker build failed!"
        exit 1
    fi
else
    print_warning "Docker not found. Using npm preview instead..."
    
    # Start with npm preview
    print_status "Starting application with npm preview..."
    print_status "Application will be available at: http://localhost:4173"
    print_status "Press Ctrl+C to stop the server"
    
    npm run preview
fi

print_success "Deployment completed!"
print_status "Check the application in your browser"