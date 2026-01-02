"""
Database Migration Verification Script
This script verifies that all tables were created correctly after migration
"""

import os
import sys
from pathlib import Path
from typing import List, Tuple

# Add parent directory to path to import Django settings
sys.path.append(str(Path(__file__).parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_project.settings')

import django
django.setup()

from django.db import connection
from django.core.management import call_command


# Expected tables in the database
EXPECTED_TABLES = [
    # Django core
    'django_content_type',
    'django_migrations',
    'django_session',
    'auth_group',
    'auth_permission',
    'auth_group_permissions',
    
    # Users
    'users',
    'users_groups',
    'users_user_permissions',
    'django_admin_log',
    
    # Budget App
    'accounts',
    'categories',
    'transactions',
    'budgets',
    'budget_history',
    'goals',
    'transfers',
    'debts',
    'debt_payments',
    'recurring_transactions',
    'investments',
    'investment_transactions',
]


def get_existing_tables() -> List[str]:
    """Get list of existing tables in the database"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            ORDER BY table_name;
        """)
        return [row[0] for row in cursor.fetchall()]


def get_table_row_count(table_name: str) -> int:
    """Get row count for a specific table"""
    with connection.cursor() as cursor:
        cursor.execute(f"SELECT COUNT(*) FROM {table_name};")
        return cursor.fetchone()[0]


def verify_foreign_keys() -> List[Tuple[str, str, str]]:
    """Verify foreign key constraints"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                tc.table_name,
                kcu.column_name,
                ccu.table_name AS foreign_table_name
            FROM information_schema.table_constraints AS tc
            JOIN information_schema.key_column_usage AS kcu
                ON tc.constraint_name = kcu.constraint_name
                AND tc.table_schema = kcu.table_schema
            JOIN information_schema.constraint_column_usage AS ccu
                ON ccu.constraint_name = tc.constraint_name
                AND ccu.table_schema = tc.table_schema
            WHERE tc.constraint_type = 'FOREIGN KEY'
                AND tc.table_schema = 'public'
            ORDER BY tc.table_name, kcu.column_name;
        """)
        return cursor.fetchall()


def verify_indexes() -> List[Tuple[str, str]]:
    """Get list of indexes"""
    with connection.cursor() as cursor:
        cursor.execute("""
            SELECT
                tablename,
                indexname
            FROM pg_indexes
            WHERE schemaname = 'public'
            ORDER BY tablename, indexname;
        """)
        return cursor.fetchall()


def main():
    print("\n" + "="*60)
    print("  DATABASE MIGRATION VERIFICATION")
    print("="*60 + "\n")
    
    # Check database connection
    try:
        with connection.cursor() as cursor:
            cursor.execute("SELECT version();")
            version = cursor.fetchone()[0]
            print(f"✓ Connected to PostgreSQL")
            print(f"  Version: {version}\n")
    except Exception as e:
        print(f"✗ Failed to connect to database: {e}")
        return
    
    # Check tables
    print("Checking tables...")
    print("-" * 60)
    existing_tables = get_existing_tables()
    missing_tables = set(EXPECTED_TABLES) - set(existing_tables)
    extra_tables = set(existing_tables) - set(EXPECTED_TABLES)
    
    if not missing_tables:
        print(f"✓ All {len(EXPECTED_TABLES)} expected tables exist\n")
    else:
        print(f"✗ Missing tables ({len(missing_tables)}):")
        for table in sorted(missing_tables):
            print(f"  - {table}")
        print()
    
    if extra_tables:
        print(f"ℹ Additional tables found ({len(extra_tables)}):")
        for table in sorted(extra_tables):
            print(f"  - {table}")
        print()
    
    # Show table statistics
    print("\nTable Statistics:")
    print("-" * 60)
    print(f"{'Table Name':<35} {'Row Count':>10}")
    print("-" * 60)
    
    for table in sorted(existing_tables):
        try:
            count = get_table_row_count(table)
            print(f"{table:<35} {count:>10,}")
        except Exception as e:
            print(f"{table:<35} {'ERROR':>10}")
    
    # Check foreign keys
    print("\n\nForeign Key Constraints:")
    print("-" * 60)
    fks = verify_foreign_keys()
    print(f"Total foreign keys: {len(fks)}")
    
    if len(fks) > 0:
        print(f"\n{'Table':<30} {'Column':<25} {'References':<30}")
        print("-" * 85)
        for table, column, ref_table in fks[:10]:  # Show first 10
            print(f"{table:<30} {column:<25} {ref_table:<30}")
        if len(fks) > 10:
            print(f"\n... and {len(fks) - 10} more foreign keys")
    
    # Check indexes
    print("\n\nIndexes:")
    print("-" * 60)
    indexes = verify_indexes()
    print(f"Total indexes: {len(indexes)}")
    
    # Check Django migrations
    print("\n\nDjango Migrations Status:")
    print("-" * 60)
    try:
        call_command('showmigrations', '--list')
    except Exception as e:
        print(f"✗ Error checking migrations: {e}")
    
    # Summary
    print("\n" + "="*60)
    print("  SUMMARY")
    print("="*60)
    
    all_good = True
    
    if missing_tables:
        print(f"✗ Missing {len(missing_tables)} tables")
        all_good = False
    else:
        print(f"✓ All tables present")
    
    print(f"✓ {len(fks)} foreign key constraints")
    print(f"✓ {len(indexes)} indexes")
    
    if all_good:
        print("\n✓ Database migration appears successful!")
        print("\nNext steps:")
        print("  1. If you haven't already, run: python manage.py migrate --fake")
        print("  2. Create a superuser: python manage.py createsuperuser")
        print("  3. Load initial data if needed")
    else:
        print("\n✗ Migration incomplete. Please review missing tables above.")
    
    print("\n" + "="*60 + "\n")


if __name__ == "__main__":
    main()
