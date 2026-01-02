#!/bin/bash
# Script to generate all recurring financial transactions
# Run this script daily via cron: 0 0 * * * /path/to/backend/generate_all_recurring.sh

echo "=============================================="
echo "🔄 GENERATING RECURRING FINANCIAL TRANSACTIONS"
echo "=============================================="
echo ""

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR"

echo "📍 Working directory: $SCRIPT_DIR"
echo ""

# Generate recurring transactions (income and expenses)
echo "💸 Generating recurring transactions..."
uv run python manage.py generate_recurring_transactions
RECURRING_EXIT_CODE=$?

echo ""
echo "----------------------------------------------"
echo ""

# Generate insurance policy returns
echo "💰 Generating insurance policy returns..."
uv run python manage.py generate_insurance_returns
INSURANCE_EXIT_CODE=$?

echo ""
echo "=============================================="
if [ $RECURRING_EXIT_CODE -eq 0 ] && [ $INSURANCE_EXIT_CODE -eq 0 ]; then
    echo "✅ All processes completed successfully!"
    exit 0
else
    echo "❌ One or more processes failed!"
    echo "   Recurring transactions exit code: $RECURRING_EXIT_CODE"
    echo "   Insurance returns exit code: $INSURANCE_EXIT_CODE"
    exit 1
fi

