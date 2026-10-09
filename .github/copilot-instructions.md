# Workspace Guidance

## Project

This workspace contains the Vectra Sport undergraduate thesis and a responsive, dependency-light storefront prototype. The frontend uses HTML, CSS, and browser JavaScript. The backend uses Node.js 20+ and the official Mercado Pago Node SDK to create Checkout Pro preferences.

## Payment and Security

- Keep `MP_ACCESS_TOKEN` only in the server-side `.env` file. Never expose or commit it.
- The payment endpoint recalculates catalog prices and accepts only known product IDs, sizes, quantities, and the `VECTRA10` coupon.
- A payment preference is not proof of an approved payment. Do not clear orders or decrement stock based on browser return parameters.
- Checkout is blocked until the merchant supplies test credentials and sets `SHIPPING_COST_BRL`. That value is a fixed demonstration rate, not a CEP-based shipping quote.
- Do not configure webhook notifications until a verified webhook endpoint and persistent order handling exist.
- Catalog imagery, products, inventory, dashboard data, and survey figures are examples or author-provided data; do not present them as independently verified.

## Development

- Start the app with `npm install`, copy `.env.example` to `.env`, configure test values, and run `npm start`.
- Run `npm run check` when Node.js is available.
- `index.html` can be opened directly for a visual preview, but API checkout requires the backend at `http://localhost:4173`.
- Keep the TCC in Brazilian Portuguese and preserve supplied research values. Clearly label missing evidence, assumptions, and prototype limitations.
- Update the README and relevant TCC documentation when application behavior changes.

## Setup Status

- [x] Confirm workspace instructions exist.
- [x] Clarify thesis and prototype requirements.
- [x] Create the storefront and payment-backend structure.
- [x] Implement the requested UI and Mercado Pago preference flow.
- [x] Document setup, requirements, diagrams, and payment limitations.
- [ ] Install dependencies and run syntax checks; Node.js/npm are unavailable in the current environment.
- [ ] Run a Mercado Pago test payment after test credentials and shipping policy are configured.
- [ ] Add webhook verification and persistent order/inventory handling before production.
