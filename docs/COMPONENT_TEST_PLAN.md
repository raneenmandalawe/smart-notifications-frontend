# Component Test Plan

## Scope
Targeted UI components in the Dashboard page:
- KPI cards
- Overdue invoices table
- Risk badges
- Empty and error states

## Strategy
- Use component-level testing with stable selectors (`data-testid`).
- Verify rendering, sorting/filtering behavior, and visible text.
- Keep tests deterministic and free of external dependencies.

## Assertion Style (Course-Aligned)
Component tests should assert UI state explicitly, for example:

```ts
expect(screen.getByTestId("kpi-total")).toHaveTextContent("3")
```

## Test Cases
1. **KPI cards render values**
   - Verify KPI titles and numerical values are present.
2. **Risk badge styles**
   - Validate HIGH/MEDIUM/LOW badge classes and text.
3. **Empty state**
   - When items list is empty, display empty state.
4. **Error banner**
   - When API fetch fails, show error banner.
5. **Filters**
   - Risk filter updates visible rows.
   - Customer search filters table rows.

## Notes
- Component tests focus on UI behavior; data is injected through test fixtures.
- No mock ERPNext data in integration or E2E tests (component tests use UI-level fixtures only).
