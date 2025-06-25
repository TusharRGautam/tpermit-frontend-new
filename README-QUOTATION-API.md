# Quotation API Documentation

## Overview

The ASW-Frontend project now includes a comprehensive quotation management API system that handles data collection, validation, submission, and retrieval. This system provides a seamless experience for creating and managing vehicle quotations.

## Architecture

### Frontend Components
- **InvoiceCreationPage.tsx** - Main form component for quotation creation
- **quotationService.js** - API service layer for backend communication
- **Dashboard.css** - Enhanced styling for user feedback and animations

### Backend Components
- **quotationRoutes.js** - Express routes for quotation operations
- **SupabaseQuotation.js** - Database model for Supabase operations
- **Quotation.js** - Base model with validation and data mapping

## API Flow

### 1. Data Collection
When the user clicks "Generate Quotation":
```javascript
// Form data is collected from all input fields
const quotationData = mapToQuotationData();
```

**Data Mapping:**
- `showroomCost` → `ex_showroom`
- `noPlate` → `number_plate_crtm_autocard`
- `handlingCharge` → `handling_document_charge`
- `loanInsurance` → `loan_suraksha_insurance`
- `margin` → `margin_down_payment`
- `emiFor5Years` → `monthly_emi`
- `emiInterestRate` → `roi_emi_interest`

### 2. Data Validation
Client-side validation includes:
- Required fields check (vendor_id, car_model, model_variant, ex_showroom)
- Numeric field validation
- Bank rate validation (at least one bank rate required)
- Positive number validation

### 3. API Submission
```javascript
const response = await quotationService.createQuotation(quotationData);
```

**API Endpoint:** `POST /api/quotations`

### 4. Database Storage
Data is saved to Supabase database table `quotation` with columns:
- `vendor_id` (Primary Key)
- `car_model`, `model_variant`
- `roi_emi_interest`
- `sbi_bank`, `union_bank`, `indusind_bank`, `au_bank`
- `ex_showroom`, `tcs`, `registration`, `insurance`
- `number_plate_crtm_autocard`, `gps`, `fastag`, `speed_governor`, `accessories`
- `on_the_road`, `loan_amount`, `margin_down_payment`
- `process_fee`, `stamp_duty`, `handling_document_charge`, `loan_suraksha_insurance`
- `down_payment`, `offers`, `final_down_payment`
- `emi_years`, `monthly_emi`
- `created_at`, `updated_at`

### 5. Data Retrieval
After successful creation:
```javascript
const quotationData = await quotationService.getQuotationByVendor(vendorId);
```

**API Endpoint:** `GET /api/quotations/{vendor_id}`

## Enhanced Features

### Error Handling
- **Network errors** - Detects server connectivity issues
- **Validation errors** - Shows field-specific error messages
- **Server errors** - Displays meaningful error messages to users
- **Visual feedback** - Error banners with close functionality

### User Experience
- **Loading states** - Spinner animation during submission
- **Success feedback** - Animated success modal with quotation details
- **Responsive design** - Works on desktop and mobile devices
- **Form validation** - Real-time validation with visual indicators

### API Service Features
- **Automatic retries** - Handles temporary connection issues
- **Data validation** - Client-side validation before API calls
- **Enhanced logging** - Comprehensive debugging information
- **Error recovery** - Graceful error handling and user feedback

## Usage Examples

### Creating a Quotation
```javascript
import quotationService from '../services/quotationService';

const quotationData = {
  vendor_id: 'V-12345',
  car_model: 'Maruti Ertiga',
  model_variant: 'VXI',
  roi_emi_interest: 8.5,
  sbi_bank: 85,
  ex_showroom: 800000,
  tcs: 8000,
  registration: 50000,
  insurance: 30000,
  // ... other fields
};

try {
  const result = await quotationService.createQuotation(quotationData);
  console.log('Quotation created:', result);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Retrieving a Quotation
```javascript
try {
  const quotation = await quotationService.getQuotationByVendor('V-12345');
  console.log('Quotation details:', quotation);
} catch (error) {
  console.error('Error:', error.message);
}
```

### Getting All Quotations
```javascript
try {
  const quotations = await quotationService.getAllQuotations({
    limit: 10,
    offset: 0,
    orderBy: 'created_at'
  });
  console.log('All quotations:', quotations);
} catch (error) {
  console.error('Error:', error.message);
}
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/quotations` | Create new quotation |
| GET | `/api/quotations` | Get all quotations |
| GET | `/api/quotations/{vendor_id}` | Get quotation by vendor ID |
| PUT | `/api/quotations/{vendor_id}` | Update quotation |
| DELETE | `/api/quotations/{vendor_id}` | Delete quotation |
| GET | `/api/quotations/car/{car_model}` | Get quotations by car model |

## Configuration

### Frontend Configuration
```javascript
// src/config.js
export const API_CONFIG = {
  BASE_URL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:5000/api',
  TIMEOUT: 10000,
};
```

### Backend Configuration
Make sure your backend server is running on port 5000 and has proper Supabase configuration.

## Error Codes

| Code | Description |
|------|-------------|
| 400 | Bad Request - Invalid data |
| 404 | Not Found - Quotation not found |
| 500 | Internal Server Error |
| Network Error | Backend server not reachable |

## Best Practices

1. **Always validate data** before submission
2. **Handle errors gracefully** with user-friendly messages
3. **Provide visual feedback** during operations
4. **Use loading states** for better UX
5. **Log errors** for debugging purposes

## Troubleshooting

### Common Issues
1. **Backend not running** - Ensure server is running on port 5000
2. **Database connection** - Check Supabase configuration
3. **Network issues** - Verify API_BASE_URL configuration
4. **Validation errors** - Check required fields and data types

### Debug Mode
Enable debug logging by setting `DEBUG=true` in your environment variables.

## Support

For issues or questions, please check:
1. Browser console for error messages
2. Network tab for API call details
3. Backend logs for server-side issues
4. Supabase dashboard for database issues 