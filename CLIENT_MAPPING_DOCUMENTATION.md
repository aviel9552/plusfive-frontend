# 📋 Client Data Mapping Documentation

## Overview

This document describes the **FULL 1:1 mapping** between the backend `customers` table (Prisma) and the frontend client data structure.

## Backend Schema (Prisma `customers` table)

All columns from the production database:

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | text | NO | Primary key |
| `appointmentCount` | int4 | NO | Number of appointments |
| `businessId` | int4 | NO | Business ID |
| `businessName` | text | NO | Business name |
| `coverImage` | text | YES | Cover image URL |
| `createdAt` | timestamp | NO | Creation timestamp |
| `customerFullName` | text | NO | Full name of customer |
| `customerPhone` | text | NO | Customer phone number |
| `documentId` | text | YES | Document ID |
| `documentImage` | text | YES | Document image URL |
| `duration` | text | NO | Duration |
| `email` | text | YES | Email address |
| `employeeId` | int4 | NO | Employee ID |
| `endDate` | timestamp | NO | End date |
| `firstName` | text | NO | First name |
| `lastName` | text | NO | Last name |
| `profileImage` | text | YES | Profile image URL |
| `selectedServices` | text | NO | Selected services |
| `startDate` | timestamp | NO | Start date |
| `updatedAt` | timestamp | NO | Last update timestamp |
| `userId` | text | NO | User ID |

## Frontend Structure

### Backend Fields (1:1 mapping)

All backend fields are preserved exactly as they come from the database:

```javascript
{
  // All 21 backend fields
  id: string,
  appointmentCount: number,
  businessId: number,
  businessName: string,
  coverImage: string | null,
  createdAt: string | null,
  customerFullName: string,
  customerPhone: string,
  documentId: string | null,
  documentImage: string | null,
  duration: string,
  email: string | null,
  employeeId: number,
  endDate: string | null,
  firstName: string,
  lastName: string,
  profileImage: string | null,
  selectedServices: string,
  startDate: string | null,
  updatedAt: string | null,
  userId: string,
}
```

### Derived Frontend Fields

These fields are computed/derived from backend data and don't exist in the database:

```javascript
{
  // Derived fields (computed, not in DB)
  name: string,           // Derived from customerFullName or firstName + lastName
  phone: string,          // Alias for customerPhone
  city: string,           // Not in DB - can be added later
  address: string,        // Not in DB - can be added later
  status: string,         // Not in DB - default 'פעיל', can be added later
  initials: string,       // Computed from name (first + last letter)
  totalRevenue: number,   // Not in DB - can be calculated from appointments
  rating: string,         // Not in DB - can be added later
}
```

## Mapping Functions

### `mapBackendClientToFrontend(backendClient)`

**Purpose**: Converts backend data to frontend format with all fields + derived fields.

**Input**: Backend client object (from Prisma `customers` table)

**Output**: Frontend client object with:
- All 21 backend fields (1:1 mapping)
- All derived frontend fields (computed)

**Key Logic**:
- `name` = `customerFullName` OR `firstName + lastName`
- `phone` = `customerPhone` (alias)
- `initials` = computed from full name
- Other derived fields have defaults

### `mapFrontendClientToBackend(frontendClient, existingBackendClient?)`

**Purpose**: Converts frontend data to backend format for API calls.

**Input**: 
- Frontend client object
- Optional: existing backend client (to preserve unchanged fields)

**Output**: Backend payload with only fields that exist in the database schema.

**Key Logic**:
- Parses `name` into `firstName` and `lastName`
- Maps `phone` to `customerPhone`
- Maps `name` to `customerFullName`
- Preserves existing backend fields if not being updated
- Sets `updatedAt` to current timestamp

## Usage Examples

### Loading Clients

```javascript
import { getAllClients, mapBackendClientToFrontend } from '@/services/clients/clientService';

// Load all clients (automatically mapped)
const clients = await getAllClients();
// Each client has all 21 backend fields + derived fields
```

### Creating a Client

```javascript
import { createClient } from '@/services/clients/clientService';

const newClient = {
  name: "יוסי כהן",
  phone: "0501234567",
  email: "yossi@example.com",
};

// Automatically maps to backend format before sending
const created = await createClient(newClient);
// Returns frontend format with all fields
```

### Updating a Client

```javascript
import { updateClient } from '@/services/clients/clientService';

const updates = {
  name: "יוסי כהן (עודכן)",
  phone: "0507654321",
};

// Automatically maps to backend format, preserves other fields
const updated = await updateClient(clientId, updates);
// Returns frontend format with all fields
```

## Field Mapping Reference

| Frontend Field | Backend Field | Notes |
|----------------|---------------|-------|
| `name` | `customerFullName` OR `firstName + lastName` | Derived |
| `phone` | `customerPhone` | Alias |
| `email` | `email` | Direct 1:1 |
| `profileImage` | `profileImage` | Direct 1:1 |
| `id` | `id` | Direct 1:1 |
| `createdAt` | `createdAt` | Direct 1:1 |
| `updatedAt` | `updatedAt` | Direct 1:1 |
| `city` | ❌ Not in DB | Can be added later |
| `address` | ❌ Not in DB | Can be added later |
| `status` | ❌ Not in DB | Default 'פעיל', can be added later |
| `initials` | ❌ Not in DB | Computed from name |
| `totalRevenue` | ❌ Not in DB | Can be calculated from appointments |
| `rating` | ❌ Not in DB | Can be added later |

## Important Notes

1. **All backend fields are preserved** - No data loss when mapping
2. **Derived fields are computed** - They don't exist in DB but are available in frontend
3. **localStorage fallback** - If backend fails, uses localStorage with same structure
4. **Field preservation** - When updating, existing backend fields are preserved if not provided
5. **Type safety** - All fields maintain their types (string, number, null, etc.)

## Future Enhancements

Fields that can be added to the database later:
- `city` - Customer city
- `address` - Customer address
- `status` - Active/Blocked status
- `totalRevenue` - Calculated revenue
- `rating` - Customer rating

These can be added to the Prisma schema and the mapping will automatically include them.



