# UI Flows

## Dashboard Overview
**URL**: `/dashboard`

### Primary Flow
1. Open Dashboard.
2. View KPI cards (overdue count, high risk, notifications sent, failed).
3. Review overdue invoices table.
4. Trigger `Scan Now` to refresh data.
5. Filter by risk level, customer name, and days overdue.
6. Send Email/SMS for an invoice row.

### Error States
- Backend not reachable → banner error.
- No overdue invoices → empty state message.

### Real Data Only
The dashboard consumes real backend data, which in turn consumes real ERPNext data. No mock mode is used.
