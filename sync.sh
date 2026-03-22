#!/bin/bash

# Sziget Insider 2026 - Grand Sync Script
# This script synchronizes data between the Web scraper and the Android assets.

echo "🔄 Starting Grand Sync..."

# 1. Run enrichment (Vibes & Genres)
echo "🧠 Enriching data with vibes..."
node update_vibes.js

# 2. Sync to Android
echo "📱 Copying data to Android assets..."
mkdir -p android/app/src/main/assets/
cp src/data/*.json android/app/src/main/assets/

echo "✅ Sync Complete! Mobile app is now up to date with the latest lineup data."
