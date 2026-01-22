import { Router } from 'express';
import { authenticateUser } from '../middleware/auth';
import * as marketplaceController from '../controllers/marketplace.controller';

const router = Router();

// All routes require authentication
router.use(authenticateUser);

// Shops
router.get('/shops', marketplaceController.getShops);
router.get('/shops/:id', marketplaceController.getShopById);

// Products
router.get('/products', marketplaceController.getProducts);
router.get('/products/:id', marketplaceController.getProductById);
router.post('/products', marketplaceController.addProduct);
router.put('/products/:id', marketplaceController.updateProduct);
router.delete('/products/:id', marketplaceController.deleteProduct);

// Cart
router.get('/cart', marketplaceController.getCart);
router.post('/cart', marketplaceController.addToCart);
router.put('/cart/:productId', marketplaceController.updateCartItem);
router.delete('/cart/:productId', marketplaceController.removeFromCart);

// Orders
router.post('/orders', marketplaceController.placeOrder);
router.get('/orders', marketplaceController.getMarketplaceOrders);
router.get('/seller/orders', marketplaceController.getSellerOrders);

export default router;
