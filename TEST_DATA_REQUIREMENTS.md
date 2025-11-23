# Test Data Requirements for AgriSmart

This guide shows you exactly what data you need to populate your database for a **test run** of the application.

## 📊 Minimum Data Requirements (For Basic Testing)

### ✅ **REQUIRED** - Core Functionality

#### 1. **Government Schemes** (3-5 records minimum)
- **Purpose**: Display schemes on `/schemes` page and dashboard
- **File**: `data/schemes.sample.json` (3 records included)
- **Command**: `pnpm seed:schemes`
- **Minimum**: 3 schemes
- **Recommended**: 5-10 schemes for better testing
- **What it enables**:
  - Schemes page functionality
  - Scheme search and filtering
  - Admin scheme management

#### 2. **Crop Encyclopedia** (3-5 records minimum)
- **Purpose**: Display crops on `/encyclopedia` page
- **File**: `data/crops.sample.json` (3 records included)
- **Command**: `pnpm seed:crops`
- **Minimum**: 3 crops
- **Recommended**: 5-10 crops for better testing
- **What it enables**:
  - Encyclopedia page functionality
  - Crop search and details
  - Admin crop management

### ⚠️ **OPTIONAL** - Enhanced Features

#### 3. **CROPSAP Alerts** (2-5 records minimum)
- **Purpose**: Show pest/disease alerts on dashboard
- **File**: `data/cropsap.sample.json` (2 records included)
- **Command**: `pnpm seed:cropsap`
- **Minimum**: 2 alerts (for testing)
- **Recommended**: 5-10 alerts
- **What it enables**:
  - Dashboard alerts section
  - Real-time pest/disease warnings
  - District-based filtering

#### 4. **District Statistics** (2-5 records minimum)
- **Purpose**: Calculate KPIs on dashboard (area, yield, rainfall)
- **File**: `data/district_stats.sample.json` (2 records included)
- **Command**: `pnpm seed:district`
- **Minimum**: 2 district records
- **Recommended**: 5-10 records (different districts/crops)
- **What it enables**:
  - Dashboard KPIs (Total Area, Active Crops, Avg Yield, Avg Rainfall)
  - District-based statistics
  - Production data visualization

#### 5. **Market Prices** (Optional - Can use API)
- **Purpose**: Display market prices on dashboard and `/market-prices` page
- **Source**: Agmarknet API (real-time) OR seed data
- **Command**: `pnpm seed:market` (fetches from Agmarknet)
- **Minimum**: 0 (uses API if available)
- **Recommended**: Let API fetch real data
- **What it enables**:
  - Market prices page
  - Dashboard price widgets
  - Price trends and analysis

## 📋 Complete Data Breakdown

### Current Sample Data Files

| Data Type | File | Records | Size | Status |
|-----------|------|---------|------|--------|
| **Schemes** | `data/schemes.sample.json` | 3 | ~2 KB | ✅ Ready |
| **Crops** | `data/crops.sample.json` | 3 | ~3 KB | ✅ Ready |
| **CROPSAP Alerts** | `data/cropsap.sample.json` | 2 | ~1 KB | ✅ Ready |
| **District Stats** | `data/district_stats.sample.json` | 2 | ~1 KB | ✅ Ready |
| **Market Prices** | API (Agmarknet) | Dynamic | N/A | 🔄 Real-time |

**Total Sample Data**: ~7 KB, 10 records across 4 types

## 🚀 Quick Start: Minimum Test Setup

For a **basic test run**, you need at least:

```bash
# 1. Run database migrations (one-time setup)
# In Supabase SQL Editor, run:
# - scripts/005_create_knowledge_schema.sql
# - scripts/007_create_cropsap_schema.sql
# - scripts/fix_scheme_name_column.sql (if needed)
# - scripts/add_schemes_unique_constraint.sql (if needed)

# 2. Seed minimum required data
pnpm seed:schemes    # 3 schemes
pnpm seed:crops      # 3 crops

# 3. Optional but recommended
pnpm seed:cropsap    # 2 alerts (for dashboard)
pnpm seed:district   # 2 stats (for KPIs)
```

**Minimum Test Data**: 6 records (3 schemes + 3 crops)

## 📈 Recommended Test Data (Full Features)

For **comprehensive testing** of all features:

```bash
# All seed scripts
pnpm seed:schemes    # 3-10 schemes
pnpm seed:crops      # 3-10 crops
pnpm seed:cropsap    # 5-10 alerts
pnpm seed:district   # 5-10 district records
pnpm seed:market     # Fetches real-time from Agmarknet
```

**Recommended Test Data**: 20-40 records across all types

## 🎯 What Each Data Type Enables

### 1. Schemes (3 records minimum)
- ✅ `/schemes` page displays schemes
- ✅ Scheme search and filtering
- ✅ Admin can manage schemes
- ✅ Dashboard can show scheme recommendations

### 2. Crops (3 records minimum)
- ✅ `/encyclopedia` page displays crops
- ✅ Crop search and details
- ✅ Admin can manage crops
- ✅ Crop recommendation API works

### 3. CROPSAP Alerts (2 records minimum)
- ✅ Dashboard shows alerts section
- ✅ Alerts filtered by user's district
- ✅ Severity-based alert styling
- ✅ Alert details with advisory

### 4. District Statistics (2 records minimum)
- ✅ Dashboard KPIs show real numbers:
  - Total Area (from district stats)
  - Active Crops (unique crop count)
  - Average Yield (calculated from stats)
  - Average Rainfall (calculated from stats)
- ✅ District-based filtering

### 5. Market Prices (Optional)
- ✅ `/market-prices` page shows prices
- ✅ Dashboard price widgets
- ✅ Real-time price data from Agmarknet
- ✅ Price trends and analysis

## 📝 Data Structure Examples

### Scheme Record Structure
```json
{
  "name": "PM-KISAN",
  "name_local": "प्रधानमंत्री किसान सम्मान निधि",
  "category": "Income Support",
  "state": "All India",
  "description": "...",
  "eligibility": "...",
  "benefits": "..."
}
```

### Crop Record Structure
```json
{
  "common_name": "Pomegranate",
  "local_name": "डाळिंब",
  "scientific_name": "Punica granatum",
  "category": "Horticulture",
  "climate": "...",
  "soil_type": "...",
  "planting_season": "..."
}
```

### CROPSAP Alert Structure
```json
{
  "district": "Pune",
  "crop": "Pomegranate",
  "pest": "Fruit Borer",
  "severity": "High",
  "advisory": "Spray Spinosad..."
}
```

### District Stat Structure
```json
{
  "district": "Pune",
  "crop": "Sugarcane",
  "area_ha": 61250,
  "production_mt": 4950000,
  "yield_mt_per_ha": 80.8,
  "rainfall_mm": 735
}
```

## 🔄 Data Sources

| Data Type | Source | Update Frequency |
|-----------|--------|------------------|
| Schemes | Manual entry / Seed scripts | Manual |
| Crops | Manual entry / Seed scripts | Manual |
| CROPSAP Alerts | CROPSAP API / Seed scripts | Weekly/Monthly |
| District Stats | Maharashtra Data Bank / Seed scripts | Annual |
| Market Prices | Agmarknet API | Daily (real-time) |

## ✅ Testing Checklist

After seeding data, verify:

- [ ] `/schemes` page shows schemes
- [ ] `/encyclopedia` page shows crops
- [ ] Dashboard shows KPIs (if district stats seeded)
- [ ] Dashboard shows alerts (if CROPSAP alerts seeded)
- [ ] Dashboard shows market prices (if market data available)
- [ ] Admin panel can manage schemes
- [ ] Admin panel can manage crops
- [ ] Search functionality works
- [ ] Filters work correctly

## 🎯 Summary

**Minimum for Basic Test**: 
- 3 schemes + 3 crops = **6 records**

**Recommended for Full Test**:
- 5-10 schemes + 5-10 crops + 5-10 alerts + 5-10 district stats = **20-40 records**

**Total Storage**: ~10-50 KB for sample data (very lightweight!)

---

**Note**: Market prices are fetched in real-time from Agmarknet API, so you don't need to seed them manually unless you want historical data.

