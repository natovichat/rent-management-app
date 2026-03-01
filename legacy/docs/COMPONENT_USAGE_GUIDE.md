# Property Portfolio Components - Usage Guide

## Quick Start

This guide shows you how to use the new Property Portfolio Management components in your pages.

---

## 📦 Installation

First, install required dependencies:

```bash
cd apps/frontend
npm install recharts xlsx date-fns
```

---

## 🏗️ Component Usage Examples

### 1. PropertyCard - Display Property Summary

**Simple Usage:**
```tsx
import { PropertyCard } from '@/components/properties/PropertyCard';

function PropertiesPage() {
  const properties = []; // Fetch from API

  return (
    <Grid container spacing={2}>
      {properties.map((property) => (
        <Grid item xs={12} md={6} lg={4} key={property.id}>
          <PropertyCard
            property={property}
            onEdit={(property) => console.log('Edit:', property)}
            onViewReport={(property) => console.log('View Report:', property)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

**With Modal Dialog:**
```tsx
import { PropertyCard } from '@/components/properties/PropertyCard';
import { PropertyDetails } from '@/components/properties/PropertyDetails';

function PropertiesPage() {
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

  const handleViewDetails = (property) => {
    setSelectedProperty(property);
    setDetailsOpen(true);
  };

  return (
    <>
      <Grid container spacing={2}>
        {properties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <PropertyCard
              property={property}
              onEdit={handleViewDetails}
              onViewReport={(p) => router.push(`/properties/${p.id}/report`)}
            />
          </Grid>
        ))}
      </Grid>

      <Dialog open={detailsOpen} onClose={() => setDetailsOpen(false)}>
        <PropertyDetails property={selectedProperty} />
      </Dialog>
    </>
  );
}
```

---

### 2. OwnershipPanel - Manage Property Ownership

**Basic Usage:**
```tsx
import { OwnershipPanel } from '@/components/properties/OwnershipPanel';

function PropertyDetailsPage({ propertyId }) {
  const { data: ownerships } = useQuery(
    ['ownerships', propertyId],
    () => api.getPropertyOwnerships(propertyId)
  );

  const handleAddOwnership = () => {
    // Open add ownership dialog
  };

  return (
    <OwnershipPanel
      propertyId={propertyId}
      ownerships={ownerships}
      onAddOwnership={handleAddOwnership}
      onEditOwnership={(ownership) => console.log('Edit:', ownership)}
      onDeleteOwnership={(id) => console.log('Delete:', id)}
    />
  );
}
```

**With Form Dialog:**
```tsx
function PropertyDetailsPage({ propertyId }) {
  const [ownershipDialogOpen, setOwnershipDialogOpen] = useState(false);
  const [editingOwnership, setEditingOwnership] = useState(null);

  const handleEdit = (ownership) => {
    setEditingOwnership(ownership);
    setOwnershipDialogOpen(true);
  };

  return (
    <>
      <OwnershipPanel
        propertyId={propertyId}
        ownerships={ownerships}
        onAddOwnership={() => {
          setEditingOwnership(null);
          setOwnershipDialogOpen(true);
        }}
        onEditOwnership={handleEdit}
      />

      <OwnershipFormDialog
        open={ownershipDialogOpen}
        onClose={() => setOwnershipDialogOpen(false)}
        ownership={editingOwnership}
        propertyId={propertyId}
      />
    </>
  );
}
```

---

### 3. MortgageCard - Display Mortgage Details

**Grid Layout:**
```tsx
import { MortgageCard } from '@/components/properties/MortgageCard';

function MortgagesPage({ propertyId }) {
  const { data: mortgages } = useQuery(
    ['mortgages', propertyId],
    () => api.getPropertyMortgages(propertyId)
  );

  return (
    <Grid container spacing={2}>
      {mortgages.map((mortgage) => (
        <Grid item xs={12} md={6} key={mortgage.id}>
          <MortgageCard
            mortgage={mortgage}
            propertyAddress={property.address}
            onEdit={(mortgage) => console.log('Edit:', mortgage)}
          />
        </Grid>
      ))}
    </Grid>
  );
}
```

---

### 4. FinancialDashboard - Portfolio Overview

**Dashboard Page:**
```tsx
import { FinancialDashboard } from '@/components/properties/FinancialDashboard';

function DashboardPage() {
  const { data: financials } = useQuery(['financials'], () => 
    api.getFinancialSummary()
  );

  return (
    <FinancialDashboard
      totalValue={financials.totalValue}
      totalMortgages={financials.totalMortgages}
      monthlyIncome={financials.monthlyIncome}
      netWorth={financials.netWorth}
      activeMortgagesCount={financials.activeMortgagesCount}
      valuationHistory={financials.valuationHistory}
      monthlyFinancials={financials.monthlyFinancials}
      portfolioBreakdown={financials.portfolioBreakdown}
      valueGrowth={financials.valueGrowth}
    />
  );
}
```

---

### 5. PropertyFilter - Advanced Filtering

**With Hook:**
```tsx
import { PropertyFilter } from '@/components/properties/PropertyFilter';
import { usePropertyFilters } from '@/hooks/usePropertyFilters';

function PropertiesPage() {
  const { data: properties } = useQuery(['properties'], api.getProperties);
  const { filters, setFilters, clearFilters, applyFilters } = usePropertyFilters();

  // Apply filters client-side
  const filteredProperties = applyFilters(properties);

  return (
    <>
      <PropertyFilter
        filters={filters}
        onFilterChange={setFilters}
        onClear={clearFilters}
      />

      <Typography variant="body2" color="text.secondary" sx={{ my: 2 }}>
        מציג {filteredProperties.length} מתוך {properties.length} נכסים
      </Typography>

      <Grid container spacing={2}>
        {filteredProperties.map((property) => (
          <Grid item xs={12} md={6} lg={4} key={property.id}>
            <PropertyCard property={property} />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
```

---

### 6. Charts - Data Visualization

**Property Value Trend:**
```tsx
import { PropertyValueChart } from '@/components/charts';

function PropertyReportPage({ propertyId }) {
  const { data: valuations } = useQuery(
    ['valuations', propertyId],
    () => api.getPropertyValuations(propertyId)
  );

  return (
    <PropertyValueChart
      data={valuations}
      title="שווי הנכס לאורך זמן"
      height={400}
      showGrid={true}
    />
  );
}
```

**Portfolio Breakdown:**
```tsx
import { PortfolioBreakdownChart } from '@/components/charts';

function PortfolioPage() {
  const breakdown = [
    { name: 'מגורים', value: 50000000, count: 15 },
    { name: 'מסחרי', value: 20000000, count: 5 },
    { name: 'קרקע', value: 10000000, count: 3 },
  ];

  return (
    <PortfolioBreakdownChart
      data={breakdown}
      title="התפלגות תיק נכסים"
      variant="donut"
      height={350}
    />
  );
}
```

**Mortgage Timeline:**
```tsx
import { MortgageTimelineChart } from '@/components/charts';

function MortgagesOverviewPage() {
  const { data: mortgages } = useQuery(['mortgages'], api.getAllMortgages);

  return (
    <MortgageTimelineChart
      mortgages={mortgages}
      title="לוח סילוק משכנתאות"
      height={400}
    />
  );
}
```

**Income vs Expenses:**
```tsx
import { IncomeExpenseChart } from '@/components/charts';

function FinancialsPage({ propertyId }) {
  const monthlyData = [
    { period: 'ינואר 2024', income: 50000, expenses: 20000 },
    { period: 'פברואר 2024', income: 55000, expenses: 18000 },
    // ... more months
  ];

  return (
    <IncomeExpenseChart
      data={monthlyData}
      title="הכנסות מול הוצאות"
      variant="grouped"
      showNet={true}
      height={350}
    />
  );
}
```

---

### 7. Report Actions - Export & Print

**Toolbar Integration:**
```tsx
import { PropertyReportActions } from '@/components/properties/PropertyReportActions';

function PropertiesPage() {
  const [selectedProperties, setSelectedProperties] = useState([]);
  const { data: allProperties } = useQuery(['properties'], api.getProperties);

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Typography variant="h4">נכסים</Typography>
        <PropertyReportActions
          properties={allProperties}
          selectedProperties={selectedProperties}
        />
      </Box>

      {/* Property list with selection */}
    </Box>
  );
}
```

---

## 🎯 Complete Example - Property Details Page

```tsx
'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import {
  Container,
  Box,
  Typography,
  Tabs,
  Tab,
  Paper,
} from '@mui/material';
import {
  PropertyCard,
  OwnershipPanel,
  MortgageCard,
  FinancialDashboard,
} from '@/components/properties';
import {
  PropertyValueChart,
  IncomeExpenseChart,
} from '@/components/charts';

function PropertyDetailsPage() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState(0);

  // Fetch data
  const { data: property } = useQuery(['property', id], () => api.getProperty(id));
  const { data: ownerships } = useQuery(['ownerships', id], () => api.getOwnerships(id));
  const { data: mortgages } = useQuery(['mortgages', id], () => api.getMortgages(id));
  const { data: financials } = useQuery(['financials', id], () => api.getFinancials(id));

  return (
    <Container maxWidth="xl">
      {/* Header */}
      <Box sx={{ my: 3 }}>
        <Typography variant="h4" gutterBottom>
          {property?.address}
        </Typography>
      </Box>

      {/* Tabs */}
      <Paper sx={{ mb: 3 }}>
        <Tabs
          value={activeTab}
          onChange={(e, v) => setActiveTab(v)}
          variant="scrollable"
          scrollButtons="auto"
        >
          <Tab label="פרטים כלליים" />
          <Tab label="בעלות" />
          <Tab label="משכנתאות" />
          <Tab label="כספים" />
          <Tab label="יחידות" />
          <Tab label="חוזים" />
        </Tabs>
      </Paper>

      {/* Tab Content */}
      <Box>
        {activeTab === 0 && (
          <PropertyCard property={property} />
        )}

        {activeTab === 1 && (
          <OwnershipPanel
            propertyId={id}
            ownerships={ownerships}
            onAddOwnership={() => {}}
          />
        )}

        {activeTab === 2 && (
          <Grid container spacing={2}>
            {mortgages?.map((mortgage) => (
              <Grid item xs={12} md={6} key={mortgage.id}>
                <MortgageCard mortgage={mortgage} />
              </Grid>
            ))}
          </Grid>
        )}

        {activeTab === 3 && (
          <Box>
            <PropertyValueChart
              data={financials?.valuationHistory}
              height={300}
            />
            <Box sx={{ mt: 3 }}>
              <IncomeExpenseChart
                data={financials?.monthlyData}
                height={300}
              />
            </Box>
          </Box>
        )}

        {/* Units and Leases tabs... */}
      </Box>
    </Container>
  );
}

export default PropertyDetailsPage;
```

---

## 🎨 Styling Customization

### Theme Configuration

Add these to your MUI theme:

```typescript
// lib/theme.ts
import { createTheme } from '@mui/material/styles';

const theme = createTheme({
  direction: 'rtl',
  palette: {
    primary: {
      main: '#4A90E2',
    },
    success: {
      main: '#50C878',
    },
    warning: {
      main: '#FFB347',
    },
    error: {
      main: '#FF6B6B',
    },
  },
  components: {
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 8,
        },
      },
    },
  },
});
```

### Custom Colors for Charts

```typescript
// Override default colors
const CUSTOM_COLORS = [
  '#4A90E2', // Primary Blue
  '#50C878', // Success Green
  '#FFB347', // Warning Orange
  '#FF6B6B', // Error Red
  '#9B59B6', // Purple
  '#3498DB', // Light Blue
];
```

---

## 🔌 API Integration Examples

### Backend Service Example

```typescript
// apps/backend/src/modules/ownerships/ownerships.service.ts

@Injectable()
export class OwnershipsService {
  constructor(private prisma: PrismaService) {}

  async findAllByProperty(propertyId: string, accountId: string) {
    return this.prisma.propertyOwnership.findMany({
      where: {
        propertyId,
        accountId,
      },
      include: {
        owner: true,
      },
      orderBy: {
        ownershipPercentage: 'desc',
      },
    });
  }

  async create(data: CreateOwnershipDto, accountId: string) {
    // Validate total percentage doesn't exceed 100%
    const existing = await this.findAllByProperty(data.propertyId, accountId);
    const currentTotal = existing.reduce(
      (sum, o) => sum + Number(o.ownershipPercentage),
      0
    );
    
    if (currentTotal + Number(data.ownershipPercentage) > 100) {
      throw new BadRequestException('Total ownership cannot exceed 100%');
    }

    return this.prisma.propertyOwnership.create({
      data: {
        ...data,
        accountId,
      },
      include: {
        owner: true,
      },
    });
  }
}
```

### Frontend API Service

```typescript
// apps/frontend/src/services/ownerships.ts

export const ownershipsApi = {
  getPropertyOwnerships: async (propertyId: string) => {
    const response = await fetch(`/api/ownerships/property/${propertyId}`);
    return response.json();
  },

  createOwnership: async (data: CreateOwnershipDto) => {
    const response = await fetch('/api/ownerships', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  updateOwnership: async (id: string, data: UpdateOwnershipDto) => {
    const response = await fetch(`/api/ownerships/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return response.json();
  },

  deleteOwnership: async (id: string) => {
    const response = await fetch(`/api/ownerships/${id}`, {
      method: 'DELETE',
    });
    return response.json();
  },
};
```

---

## 📊 Chart Data Preparation

### Property Value History

```typescript
// Transform Prisma data to chart format
const prepareValueChartData = (valuations: PropertyValuation[]) => {
  return valuations
    .sort((a, b) => new Date(a.valuationDate).getTime() - new Date(b.valuationDate).getTime())
    .map((valuation) => ({
      date: valuation.valuationDate,
      value: Number(valuation.estimatedValue),
    }));
};

// Usage
<PropertyValueChart data={prepareValueChartData(valuations)} />
```

### Portfolio Breakdown

```typescript
// Group properties by type and calculate totals
const preparePortfolioData = (properties: Property[]) => {
  const breakdown = properties.reduce((acc, property) => {
    const type = property.type || 'OTHER';
    if (!acc[type]) {
      acc[type] = { name: getTypeLabel(type), value: 0, count: 0 };
    }
    acc[type].value += Number(property.estimatedValue || 0);
    acc[type].count += 1;
    return acc;
  }, {} as Record<string, any>);

  return Object.values(breakdown);
};

// Usage
<PortfolioBreakdownChart data={preparePortfolioData(properties)} />
```

### Income vs Expenses

```typescript
// Group transactions by month
const prepareFinancialData = (
  income: PropertyIncome[],
  expenses: PropertyExpense[]
) => {
  const monthlyData: Record<string, any> = {};

  income.forEach((item) => {
    const month = format(new Date(item.incomeDate), 'MMM yyyy', { locale: he });
    if (!monthlyData[month]) {
      monthlyData[month] = { period: month, income: 0, expenses: 0 };
    }
    monthlyData[month].income += Number(item.amount);
  });

  expenses.forEach((item) => {
    const month = format(new Date(item.expenseDate), 'MMM yyyy', { locale: he });
    if (!monthlyData[month]) {
      monthlyData[month] = { period: month, income: 0, expenses: 0 };
    }
    monthlyData[month].expenses += Number(item.amount);
  });

  return Object.values(monthlyData).sort((a: any, b: any) => {
    return new Date(a.period).getTime() - new Date(b.period).getTime();
  });
};

// Usage
<IncomeExpenseChart data={prepareFinancialData(income, expenses)} />
```

---

## 🔄 State Management with React Query

```typescript
// hooks/useProperty.ts
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

export const useProperty = (propertyId: string) => {
  const queryClient = useQueryClient();

  const property = useQuery(['property', propertyId], () => 
    api.getProperty(propertyId)
  );

  const ownerships = useQuery(['ownerships', propertyId], () =>
    api.getOwnerships(propertyId)
  );

  const mortgages = useQuery(['mortgages', propertyId], () =>
    api.getMortgages(propertyId)
  );

  const updateProperty = useMutation({
    mutationFn: (data: UpdatePropertyDto) => 
      api.updateProperty(propertyId, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['property', propertyId]);
    },
  });

  return {
    property: property.data,
    ownerships: ownerships.data,
    mortgages: mortgages.data,
    isLoading: property.isLoading || ownerships.isLoading || mortgages.isLoading,
    updateProperty: updateProperty.mutate,
  };
};
```

---

## 🎭 Loading States

```tsx
import { Skeleton } from '@mui/material';

function PropertiesPage() {
  const { data: properties, isLoading } = useQuery(['properties'], api.getProperties);

  if (isLoading) {
    return (
      <Grid container spacing={2}>
        {[1, 2, 3, 4, 5, 6].map((n) => (
          <Grid item xs={12} md={6} lg={4} key={n}>
            <Card>
              <CardContent>
                <Skeleton variant="text" height={30} />
                <Skeleton variant="text" />
                <Skeleton variant="rectangular" height={100} sx={{ my: 2 }} />
                <Skeleton variant="text" />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    );
  }

  return (
    <Grid container spacing={2}>
      {properties.map((property) => (
        <Grid item xs={12} md={6} lg={4} key={property.id}>
          <PropertyCard property={property} />
        </Grid>
      ))}
    </Grid>
  );
}
```

---

## 🚨 Error Handling

```tsx
function PropertiesPage() {
  const { data, isLoading, isError, error } = useQuery(
    ['properties'],
    api.getProperties
  );

  if (isError) {
    return (
      <Alert severity="error">
        שגיאה בטעינת נכסים: {error.message}
      </Alert>
    );
  }

  // ... rest of component
}
```

---

## 📱 Responsive Design

All components are responsive by default. Use MUI Grid breakpoints:

```tsx
<Grid container spacing={2}>
  {/* Mobile: 1 column, Tablet: 2 columns, Desktop: 3 columns */}
  <Grid item xs={12} sm={6} md={4}>
    <PropertyCard property={property} />
  </Grid>
</Grid>
```

---

## 🎨 Customization Examples

### Custom PropertyCard Colors

```tsx
<PropertyCard
  property={property}
  sx={{
    '&:hover': {
      borderColor: 'primary.main',
    },
  }}
/>
```

### Custom Chart Height

```tsx
<PropertyValueChart
  data={data}
  height={500} // Larger chart
/>
```

### Custom Filter Quick Actions

```tsx
<PropertyFilter
  filters={filters}
  onFilterChange={setFilters}
  customQuickFilters={[
    { label: 'גרמניה בלבד', onClick: () => setFilters({ country: 'Germany' }) },
    { label: 'שווי גבוה', onClick: () => setFilters({ valueRange: [5000000, 10000000] }) },
  ]}
/>
```

---

## 🐛 Common Issues & Solutions

### Issue 1: Charts Not Rendering
**Solution:** Ensure recharts is installed and ResponsiveContainer has explicit dimensions

### Issue 2: RTL Layout Issues
**Solution:** Wrap app with RTL theme provider and cache provider

### Issue 3: Filter Not Working
**Solution:** Ensure data structure matches filter expectations (check _count fields)

### Issue 4: Export Fails
**Solution:** Check that xlsx library is installed and browser allows downloads

---

## 📚 Additional Resources

- [Recharts Documentation](https://recharts.org/)
- [Material-UI Components](https://mui.com/material-ui/getting-started/)
- [React Query Guide](https://tanstack.com/query/latest)
- [date-fns Documentation](https://date-fns.org/)

---

**Last Updated:** February 2, 2026  
**Version:** 1.0.0
