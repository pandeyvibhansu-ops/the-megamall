# The Megamall

## Current State
New project, no existing app files.

## Requested Changes (Diff)

### Add
- Product listing grid with 10 default products (name, price, image)
- Shopping cart: add/remove items, update quantities, show total
- WhatsApp checkout: sends order summary to +918303379462
- Admin panel: password-protected (stored in backend), add/delete products
- Fixed social buttons: WhatsApp (wa.me/918303379462) and Instagram (instagram.com/vibhansu_pandit)
- Toast notifications for cart actions
- Responsive layout

### Modify
N/A

### Remove
N/A

## Implementation Plan
1. Backend: store products in stable var, expose getProducts/addProduct/deleteProduct/checkAdminPassword queries/updates
2. Frontend: product grid, cart modal, admin login modal, admin panel, social buttons, toast notifications
3. Cart state managed in React (localStorage for persistence)
