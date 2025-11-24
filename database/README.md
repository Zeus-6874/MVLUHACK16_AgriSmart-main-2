# AgriSmart V2: Fresh PostgreSQL Database

This directory contains the complete, from-scratch PostgreSQL schema for the AgriSmart V2 application. This schema is designed to be highly optimized, secure, and scalable, leveraging the full power of PostgreSQL.

## 🐘 `V2_create_fresh_database.sql`

This is the **master script** for creating a fresh AgriSmart database. It is idempotent, meaning it can be run safely on a new or existing database. It will intelligently clean up old objects before creating the new ones.

### How to Use

1.  **Open Supabase SQL Editor**:
    Navigate to your Supabase project and open the SQL Editor.

2.  **Copy & Paste**:
    Copy the *entire content* of the `V2_create_fresh_database.sql` file.

3.  **Execute**:
    Paste the script into the editor and click "Run".

That's it! The script will create all necessary tables, types, functions, indexes, and security policies.

### Key Features of this Schema

-   **PostgreSQL Native**: Uses ENUMs, DOMAINs, JSONB, and other native types for performance and data integrity.
-   **Performance Optimized**: Includes advanced GIN, GiST, and B-tree indexes for lightning-fast queries.
-   **Automated**: Triggers and functions automate timestamps, calculations, and data consistency.
-   **Secure by Default**: All tables are protected with Row Level Security (RLS) policies.
-   **Scalable**: Designed to handle millions of records with ease.

## 📊 Schema Overview

The script sets up the following core tables:

-   `farmer_profiles`: Stores user information.
-   `fields`: Manages farm fields, including location and soil type.
-   `crop_cycles`: Tracks the entire lifecycle of a crop from planting to harvest.
-   `soil_analysis`: Records and analyzes soil health data.
-   `market_prices`: Stores daily market prices for various commodities.
-   `encyclopedia`: A knowledge base for different crops.
-   `schemes`: Information on government agricultural schemes.

## 🚀 Getting Started

After running the script, your database will be fully configured and ready to connect to the AgriSmart application. Make sure your `.env.local` file points to this new Supabase instance.

## 💡 Idempotent Design

This script is designed to be run multiple times without causing errors. The `DROP...CASCADE` statements at the beginning ensure that any existing AgriSmart V2 objects are cleanly removed before the new schema is created, making it perfect for development and testing environments.

## 🌱 Seed Data

The script also includes basic seed data for the `encyclopedia` and `schemes` tables, so you can start using the application with some initial data right away.
