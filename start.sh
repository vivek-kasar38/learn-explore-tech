#!/bin/bash

# Quick start script for Authentication Learning Environment

echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║     Authentication Learning Environment - Quick Start             ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
echo ""
echo "This script will help you explore three authentication methods:"
echo "  1. Basic Authentication (Simple username/password)"
echo "  2. JWT Authentication (Token-based)"
echo "  3. Certificate Authentication (mTLS)"
echo ""
echo "Choose an option:"
echo "  [1] Run all examples (recommended for first time)"
echo "  [2] Run Basic Authentication only"
echo "  [3] Run JWT Authentication only"
echo "  [4] Run Certificate Authentication only"
echo "  [5] Stop all services"
echo "  [6] Clean up everything (remove containers and volumes)"
echo ""
read -p "Enter your choice [1-6]: " choice

case $choice in
  1)
    echo ""
    echo "Starting all authentication examples..."
    echo "This will run all three demos simultaneously."
    echo ""
    docker-compose up --build
    ;;
  2)
    echo ""
    echo "Starting Basic Authentication demo..."
    echo "Server will be available at http://localhost:3000"
    echo ""
    docker-compose up --build simple-auth-server simple-auth-client
    ;;
  3)
    echo ""
    echo "Starting JWT Authentication demo..."
    echo "Server will be available at http://localhost:3001"
    echo ""
    docker-compose up --build jwt-auth-server jwt-auth-client
    ;;
  4)
    echo ""
    echo "Starting Certificate Authentication (mTLS) demo..."
    echo "Server will be available at https://localhost:3002"
    echo ""
    docker-compose up --build cert-auth-server cert-auth-client
    ;;
  5)
    echo ""
    echo "Stopping all services..."
    docker-compose down
    echo "✓ All services stopped"
    ;;
  6)
    echo ""
    echo "Cleaning up everything..."
    docker-compose down -v
    docker system prune -f
    echo "✓ Cleanup complete"
    ;;
  *)
    echo ""
    echo "Invalid choice. Please run the script again and choose 1-6."
    exit 1
    ;;
esac

echo ""
echo "╔════════════════════════════════════════════════════════════════════╗"
echo "║                         Useful Commands                            ║"
echo "╠════════════════════════════════════════════════════════════════════╣"
echo "║  docker-compose logs [service]  - View logs                        ║"
echo "║  docker-compose ps              - List running services            ║"
echo "║  docker-compose down            - Stop all services                ║"
echo "║  ./start.sh                     - Run this script again            ║"
echo "╚════════════════════════════════════════════════════════════════════╝"
