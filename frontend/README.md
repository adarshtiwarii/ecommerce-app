# EcoMart Frontend

React frontend for the EcoMart marketplace application. It includes customer shopping pages, cart and checkout flows, user orders, and admin product management.

## Tech Stack

- React 19
- React Router
- Tailwind CSS
- Axios
- React Icons

## Setup

Install dependencies:

```bash
npm install
```

Create a frontend environment file if needed:

```env
REACT_APP_API_BASE_URL=http://localhost:8080/api
```

Run locally:

```bash
npm start
```

Build for production:

```bash
npm run build
```

## Main Routes

- `/` - Home page with auto-scrolling banner and product sections
- `/product/:id` - Product detail page
- `/category/:category` - Category listing
- `/search` - Search and filter products
- `/login` - Login and register card
- `/cart` - Cart
- `/checkout` - Checkout
- `/orders` - User order history
- `/admin` - Admin dashboard
- `/add-product` - Add product
- `/edit-product/:id` - Edit product

## Notes

- The frontend expects the backend to run at `http://localhost:8080/api` unless `REACT_APP_API_BASE_URL` is set.
- Product images support both `imageUrl` and `images[]`; new product forms send both for compatibility.
- Protected routes require a JWT token stored in `localStorage`.
