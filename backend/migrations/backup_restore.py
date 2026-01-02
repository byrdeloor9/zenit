"""
Database Backup and Restore Utility
Helps to backup data from old database and restore to new one
"""

import os
import sys
from pathlib import Path
from datetime import datetime
import json

# Add parent directory to path
sys.path.append(str(Path(__file__).parent.parent))

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'budget_project.settings')

import django
django.setup()

from django.core.management import call_command
from django.db import connection


def backup_data(output_dir: str = "backup"):
    """
    Backup all data using Django's dumpdata command
    Creates JSON files for each app
    """
    backup_path = Path(output_dir)
    backup_path.mkdir(exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = backup_path / f"backup_{timestamp}.json"
    
    print(f"\n{'='*60}")
    print("  DATABASE BACKUP")
    print(f"{'='*60}\n")
    
    print(f"Creating backup at: {backup_file}")
    
    try:
        # Backup all data
        with open(backup_file, 'w') as f:
            call_command(
                'dumpdata',
                '--natural-foreign',
                '--natural-primary',
                '--indent', '2',
                stdout=f,
                exclude=[
                    'contenttypes',
                    'auth.permission',
                    'sessions.session',
                ]
            )
        
        print(f"✓ Backup created successfully!")
        print(f"  Size: {backup_file.stat().st_size / 1024:.2f} KB")
        
        # Also create individual app backups
        apps = ['api']  # Add more apps if needed
        
        for app in apps:
            app_backup_file = backup_path / f"backup_{app}_{timestamp}.json"
            print(f"\nBacking up {app} app...")
            
            with open(app_backup_file, 'w') as f:
                call_command(
                    'dumpdata',
                    app,
                    '--natural-foreign',
                    '--natural-primary',
                    '--indent', '2',
                    stdout=f,
                )
            
            print(f"✓ {app} backup created: {app_backup_file}")
        
        print(f"\n{'='*60}")
        print("  BACKUP COMPLETE")
        print(f"{'='*60}\n")
        
        return str(backup_file)
        
    except Exception as e:
        print(f"\n✗ Backup failed: {e}")
        return None


def restore_data(backup_file: str):
    """
    Restore data from a backup JSON file
    """
    backup_path = Path(backup_file)
    
    if not backup_path.exists():
        print(f"✗ Backup file not found: {backup_file}")
        return False
    
    print(f"\n{'='*60}")
    print("  DATABASE RESTORE")
    print(f"{'='*60}\n")
    
    print(f"Restoring from: {backup_file}")
    print(f"File size: {backup_path.stat().st_size / 1024:.2f} KB\n")
    
    # Ask for confirmation
    confirm = input("⚠️  This will restore data. Continue? (yes/no): ")
    if confirm.lower() != 'yes':
        print("Restore cancelled.")
        return False
    
    try:
        # Load data
        call_command('loaddata', backup_file, verbosity=2)
        
        print(f"\n{'='*60}")
        print("  RESTORE COMPLETE")
        print(f"{'='*60}\n")
        
        return True
        
    except Exception as e:
        print(f"\n✗ Restore failed: {e}")
        return False


def list_backups(backup_dir: str = "backup"):
    """
    List available backup files
    """
    backup_path = Path(backup_dir)
    
    if not backup_path.exists():
        print(f"No backup directory found at: {backup_dir}")
        return []
    
    backups = sorted(backup_path.glob("backup_*.json"), reverse=True)
    
    print(f"\n{'='*60}")
    print("  AVAILABLE BACKUPS")
    print(f"{'='*60}\n")
    
    if not backups:
        print("No backups found.")
        return []
    
    print(f"{'#':<4} {'Filename':<40} {'Size (KB)':<12} {'Date':<20}")
    print("-" * 80)
    
    for i, backup in enumerate(backups, 1):
        size_kb = backup.stat().st_size / 1024
        mod_time = datetime.fromtimestamp(backup.stat().st_mtime)
        print(f"{i:<4} {backup.name:<40} {size_kb:>10.2f}  {mod_time.strftime('%Y-%m-%d %H:%M:%S')}")
    
    print()
    return backups


def main():
    import argparse
    
    parser = argparse.ArgumentParser(description='Database Backup and Restore Utility')
    parser.add_argument(
        'action',
        choices=['backup', 'restore', 'list'],
        help='Action to perform'
    )
    parser.add_argument(
        '--file',
        '-f',
        help='Backup file to restore (for restore action)'
    )
    parser.add_argument(
        '--dir',
        '-d',
        default='backup',
        help='Backup directory (default: backup)'
    )
    
    args = parser.parse_args()
    
    if args.action == 'backup':
        backup_data(args.dir)
    
    elif args.action == 'restore':
        if not args.file:
            # List backups and let user choose
            backups = list_backups(args.dir)
            if backups:
                choice = input("\nEnter backup number to restore (or 'q' to quit): ")
                if choice.lower() == 'q':
                    print("Restore cancelled.")
                    return
                try:
                    backup_file = backups[int(choice) - 1]
                    restore_data(str(backup_file))
                except (ValueError, IndexError):
                    print("Invalid choice.")
        else:
            restore_data(args.file)
    
    elif args.action == 'list':
        list_backups(args.dir)


if __name__ == "__main__":
    main()
