# EcoMart — Design System Implementation (Prompt Driven)

## Steps
1. Update `src/index.css` with strict prompt design tokens (colors/typography/radii/shadows/transitions) + font imports.
2. Replace `src/components/common/SplashScreen.js` with the "Volcanic Launch" implementation (particles, hex logo, letter-by-letter EcoMart, PLUS badge, progress bar, countdown ring, Framer Motion timeline).
3. If required, adjust `src/App.js` splash timing to align with the prompt timeline.
4. Replace `src/components/Product/ProductCard.js` with the prompt version (wishlist, discount badge, out-of-stock overlay, add-to-cart states).
5. Replace `src/components/Product/ProductImageZoom.js` with the prompt version (wheel zoom, drag/pan, modal controls, thumbnails).
6. Refactor `src/pages/AdminDashboard.js` by extracting and implementing `AdminStatsCard` + `AdminOrdersTable` (status filter/search/skeleton).
7. Add Toast system: `src/hooks/useToast.js` and `src/components/common/ToastContainer.jsx`, wire into App/Admin flows.
8. Implement `AddressForm` with location detection (Nominatim reverse geocode) and integrate into `CheckoutPage.js`.
9. Add mobile responsive rules in `src/index.css` per prompt.
10. Verify build/tests.

