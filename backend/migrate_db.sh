#!/bin/bash

# Database Migration Script for Budget App
# This script helps migrate the database schema to a new PostgreSQL instance

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_error ".env file not found!"
    echo "Please create a .env file with your database credentials."
    echo "Example:"
    echo "  DATABASE_URL=postgresql://user:password@host:port/database"
    exit 1
fi

# Load environment variables
source .env

# Extract database connection details from DATABASE_URL or individual variables
if [ -n "$DATABASE_URL" ]; then
    print_info "Using DATABASE_URL from .env"
    DB_URL="$DATABASE_URL"
else
    print_error "DATABASE_URL not found in .env file"
    exit 1
fi

# Menu
echo ""
echo "======================================"
echo "  Budget App Database Migration"
echo "======================================"
echo ""
echo "Select an option:"
echo "  1) Create fresh schema (full migration)"
echo "  2) Drop all tables (WARNING: Deletes all data!)"
echo "  3) Drop and recreate (complete reset)"
echo "  4) Run Django migrations"
echo "  5) Exit"
echo ""
read -p "Enter your choice [1-5]: " choice

case $choice in
    1)
        print_info "Creating fresh schema..."
        psql "$DB_URL" -f migrations/full_schema.sql
        print_info "Schema created successfully!"
        print_info "Don't forget to run Django migrations to sync Django's migration table."
        ;;
    2)
        print_warning "This will DELETE ALL TABLES and ALL DATA!"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            print_info "Dropping all tables..."
            psql "$DB_URL" -f migrations/drop_all_tables.sql
            print_info "All tables dropped!"
        else
            print_info "Operation cancelled."
        fi
        ;;
    3)
        print_warning "This will DELETE ALL TABLES and recreate them!"
        read -p "Are you sure? Type 'yes' to confirm: " confirm
        if [ "$confirm" = "yes" ]; then
            print_info "Dropping all tables..."
            psql "$DB_URL" -f migrations/drop_all_tables.sql
            print_info "Creating fresh schema..."
            psql "$DB_URL" -f migrations/full_schema.sql
            print_info "Database reset complete!"
            print_info "Don't forget to run Django migrations to sync Django's migration table."
        else
            print_info "Operation cancelled."
        fi
        ;;
    4)
        print_info "Running Django migrations..."
        python manage.py migrate --fake
        print_info "Django migrations completed!"
        ;;
    5)
        print_info "Exiting..."
        exit 0
        ;;
    *)
        print_error "Invalid choice!"
        exit 1
        ;;
esac

echo ""
print_info "Done! Remember to:"
echo "  - Create a superuser if this is a fresh setup: python manage.py createsuperuser"
echo "  - Load any initial data you may need"
echo ""
