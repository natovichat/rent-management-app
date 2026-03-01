# Production API Test Report

**Date:** Sat Feb  7 20:03:18 IST 2026
**API URL:** https://rent-app-backend-6s337cqx6a-uc.a.run.app
**Account ID:** 061cf47d-f167-4f5d-8602-6f24792dc008

# Core Entities

## Get All Accounts

**Endpoint:** `GET /accounts`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[
    {
        "id": "061cf47d-f167-4f5d-8602-6f24792dc008",
        "name": "\u05de\u05e9\u05e4\u05d7\u05ea \u05e0\u05d8\u05d5\u05d1\u05d9\u05e5",
        "status": "ACTIVE",
        "createdAt": "2026-02-07T17:24:36.685Z",
        "updatedAt": "2026-02-07T17:24:36.685Z"
    }
]
```

---

## Get Properties (First 5)

**Endpoint:** `GET /properties?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "total": 0,
        "page": 1,
        "limit": 5,
        "totalPages": 0
    }
}
```

---

## Get Tenants (First 5)

**Endpoint:** `GET /tenants?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[]
```

---

## Get Units (First 5)

**Endpoint:** `GET /units?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "total": 0,
        "page": 1,
        "limit": 5,
        "totalPages": 0
    }
}
```

---

## Get Leases (First 5)

**Endpoint:** `GET /leases?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "page": 1,
        "limit": 5,
        "total": 0,
        "totalPages": 0
    }
}
```

---

## Get Owners (First 5)

**Endpoint:** `GET /owners?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "page": 1,
        "limit": 5,
        "total": 0,
        "totalPages": 0
    }
}
```

---

# Financial Data

## Get All Expenses

**Endpoint:** `GET /financials/expenses`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[]
```

---

## Get All Income

**Endpoint:** `GET /financials/income`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[]
```

---

## Get Bank Accounts

**Endpoint:** `GET /bank-accounts?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[]
```

---

## Get Mortgages

**Endpoint:** `GET /mortgages?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "page": 1,
        "limit": 5,
        "total": 0,
        "totalPages": 0
    }
}
```

---

# Dashboard Analytics

## Get ROI Metrics

**Endpoint:** `GET /dashboard/roi`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "portfolioROI": 0,
    "totalIncome": 0,
    "totalExpenses": 0,
    "netIncome": 0,
    "totalPropertyValue": 0
}
```

---

## Get Monthly Cash Flow

**Endpoint:** `GET /dashboard/cash-flow?groupBy=month`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
[]
```

---

## Get Widget Preferences

**Endpoint:** `GET /dashboard/widget-preferences`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "visibleWidgets": [
        "portfolioSummary",
        "propertyDistribution",
        "incomeExpenses",
        "valuationHistory",
        "mortgageSummary",
        "leaseTimeline",
        "roiMetrics",
        "cashFlow"
    ],
    "widgetOrder": [
        "portfolioSummary",
        "propertyDistribution",
        "roiMetrics",
        "incomeExpenses",
        "valuationHistory",
        "cashFlow",
        "leaseTimeline",
        "mortgageSummary"
    ]
}
```

---

# Additional Entities

## Get Investment Companies

**Endpoint:** `GET /investment-companies?page=1&limit=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "meta": {
        "page": 1,
        "limit": 5,
        "total": 0,
        "totalPages": 0
    }
}
```

---

## Get Notifications (pageSize instead of limit)

**Endpoint:** `GET /notifications?page=1&pageSize=5`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "pagination": {
        "page": 1,
        "pageSize": 5,
        "total": 0,
        "totalPages": 0
    }
}
```

---

## Get Upcoming Notifications

**Endpoint:** `GET /notifications/upcoming`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "data": [],
    "pagination": {
        "page": 1,
        "pageSize": 10,
        "total": 0,
        "totalPages": 0
    }
}
```

---

## Get Notification Settings

**Endpoint:** `GET /notifications/settings`

**Status Code:** 200

**Result:** ✅ PASSED

**Response Sample:**
```json
{
    "id": "119d4dcf-c17e-443b-a856-cfa3530eeef1",
    "accountId": "061cf47d-f167-4f5d-8602-6f24792dc008",
    "daysBeforeExpiration": [
        30
    ],
    "createdAt": "2026-02-07T18:03:31.667Z",
    "updatedAt": "2026-02-07T18:03:31.667Z"
}
```

---


# Summary

**Total Tests:** 17
**Passed:** ✅ 17
**Failed:** ❌ 0

**Overall Result:** ✅ All tests passed!
