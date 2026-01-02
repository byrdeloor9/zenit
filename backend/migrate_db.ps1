# Database Migration Script for Budget App (PowerShell)
# This script helps migrate the database schema to a new PostgreSQL instance

$ErrorActionPreference = "Stop"

# Colors for output
function Print-Info {
    param([string]$Message)
    Write-Host "[INFO] $Message" -ForegroundColor Green
}

function Print-Warning {
    param([string]$Message)
    Write-Host "[WARNING] $Message" -ForegroundColor Yellow
}

function Print-Error {
    param([string]$Message)
    Write-Host "[ERROR] $Message" -ForegroundColor Red
}

# Check if .env file exists
if (-not (Test-Path ".env")) {
    Print-Error ".env file not found!"
    Write-Host "Please create a .env file with your database credentials."
    Write-Host "Example:"
    Write-Host "  DATABASE_URL=postgresql://user:password@host:port/database"
    exit 1
}

# Load environment variables from .env
Get-Content .env | ForEach-Object {
    if ($_ -match '^([^=]+)=(.*)$') {
        $name = $matches[1].Trim()
        $value = $matches[2].Trim()
        Set-Variable -Name $name -Value $value -Scope Script
    }
}

# Check if DATABASE_URL is set
if (-not $DATABASE_URL) {
    Print-Error "DATABASE_URL not found in .env file"
    exit 1
}

Print-Info "Using DATABASE_URL from .env"

# Menu
Write-Host ""
Write-Host "======================================"
Write-Host "  Budget App Database Migration"
Write-Host "======================================"
Write-Host ""
Write-Host "Select an option:"
Write-Host "  1) Create fresh schema (full migration)"
Write-Host "  2) Drop all tables (WARNING: Deletes all data!)"
Write-Host "  3) Drop and recreate (complete reset)"
Write-Host "  4) Run Django migrations"
Write-Host "  5) Exit"
Write-Host ""

$choice = Read-Host "Enter your choice [1-5]"

switch ($choice) {
    "1" {
        Print-Info "Creating fresh schema..."
        $env:PGPASSWORD = $DATABASE_URL
        psql $DATABASE_URL -f migrations/full_schema.sql
        Print-Info "Schema created successfully!"
        Print-Info "Don't forget to run Django migrations to sync Django's migration table."
    }
    "2" {
        Print-Warning "This will DELETE ALL TABLES and ALL DATA!"
        $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            Print-Info "Dropping all tables..."
            psql $DATABASE_URL -f migrations/drop_all_tables.sql
            Print-Info "All tables dropped!"
        } else {
            Print-Info "Operation cancelled."
        }
    }
    "3" {
        Print-Warning "This will DELETE ALL TABLES and recreate them!"
        $confirm = Read-Host "Are you sure? Type 'yes' to confirm"
        if ($confirm -eq "yes") {
            Print-Info "Dropping all tables..."
            psql $DATABASE_URL -f migrations/drop_all_tables.sql
            Print-Info "Creating fresh schema..."
            psql $DATABASE_URL -f migrations/full_schema.sql
            Print-Info "Database reset complete!"
            Print-Info "Don't forget to run Django migrations to sync Django's migration table."
        } else {
            Print-Info "Operation cancelled."
        }
    }
    "4" {
        Print-Info "Running Django migrations..."
        python manage.py migrate --fake
        Print-Info "Django migrations completed!"
    }
    "5" {
        Print-Info "Exiting..."
        exit 0
    }
    default {
        Print-Error "Invalid choice!"
        exit 1
    }
}

Write-Host ""
Print-Info "Done! Remember to:"
Write-Host "  - Create a superuser if this is a fresh setup: python manage.py createsuperuser"
Write-Host "  - Load any initial data you may need"
Write-Host ""
