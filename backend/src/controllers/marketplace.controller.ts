import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import prisma from '../utils/prisma';
import { generateOrderId } from '../utils/telegram';

// Get all shops
export async function getShops(req: AuthRequest, res: Response) {
  try {
    const shops = await prisma.shop.findMany({
      include: {
        _count: {
          select: { products: true },
        },
      },
    });

    return res.json(shops);
  } catch (error) {
    console.error('Error getting shops:', error);
    return res.status(500).json({ error: 'Failed to get shops' });
  }
}

// Get shop by ID
export async function getShopById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const shop = await prisma.shop.findUnique({
      where: { id: id as string },
      include: {
        products: true,
      },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    return res.json(shop);
  } catch (error) {
    console.error('Error getting shop:', error);
    return res.status(500).json({ error: 'Failed to get shop' });
  }
}

// Get all products
export async function getProducts(req: AuthRequest, res: Response) {
  try {
    const products = await prisma.product.findMany({
      include: {
        shop: {
          select: {
            id: true,
            name: true,
            type: true,
          },
        },
      },
    });

    return res.json(products);
  } catch (error) {
    console.error('Error getting products:', error);
    return res.status(500).json({ error: 'Failed to get products' });
  }
}

// Get product by ID
export async function getProductById(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: {
        shop: true,
      },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    return res.json(product);
  } catch (error) {
    console.error('Error getting product:', error);
    return res.status(500).json({ error: 'Failed to get product' });
  }
}

// Add product (seller only)
export async function addProduct(req: AuthRequest, res: Response) {
  try {
    const { name, description, price, imageUrl, imageHint, delivery, deliveryPrice, pickup } = req.body;

    if (!name || !description || price === undefined) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if user is a seller
    const sellerProfile = await prisma.sellerProfile.findUnique({
      where: { userId: req.user!.id },
    });

    if (!sellerProfile) {
      return res.status(403).json({ error: 'Not registered as seller' });
    }

    // Find user's shop
    const shop = await prisma.shop.findFirst({
      where: { userId: req.user!.id },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const product = await prisma.product.create({
      data: {
        name,
        description,
        price,
        imageUrl: imageUrl || 'https://picsum.photos/seed/product/200/200',
        imageHint: imageHint || 'product image',
        shopId: shop.id,
        delivery: delivery ?? false,
        deliveryPrice: deliveryPrice ?? null,
        pickup: pickup ?? true,
      },
    });

    return res.status(201).json(product);
  } catch (error) {
    console.error('Error adding product:', error);
    return res.status(500).json({ error: 'Failed to add product' });
  }
}

// Update product (seller only)
export async function updateProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;
    const { name, description, price, imageUrl, imageHint, delivery, deliveryPrice, pickup } = req.body;

    // Check if product exists and belongs to user's shop
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { shop: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.shop.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to update this product' });
    }

    const updatedProduct = await prisma.product.update({
      where: { id: id as string },
      data: {
        ...(name && { name }),
        ...(description && { description }),
        ...(price !== undefined && { price }),
        ...(imageUrl && { imageUrl }),
        ...(imageHint && { imageHint }),
        ...(delivery !== undefined && { delivery }),
        ...(deliveryPrice !== undefined && { deliveryPrice }),
        ...(pickup !== undefined && { pickup }),
      },
    });

    return res.json(updatedProduct);
  } catch (error) {
    console.error('Error updating product:', error);
    return res.status(500).json({ error: 'Failed to update product' });
  }
}

// Delete product (seller only)
export async function deleteProduct(req: AuthRequest, res: Response) {
  try {
    const { id } = req.params;

    // Check if product exists and belongs to user's shop
    const product = await prisma.product.findUnique({
      where: { id: id as string },
      include: { shop: true },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (product.shop.userId !== req.user!.id) {
      return res.status(403).json({ error: 'Not authorized to delete this product' });
    }

    await prisma.product.delete({
      where: { id: id as string },
    });

    return res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    console.error('Error deleting product:', error);
    return res.status(500).json({ error: 'Failed to delete product' });
  }
}

// Get cart
export async function getCart(req: AuthRequest, res: Response) {
  try {
    const cartItems = await prisma.cartItem.findMany({
      where: { userId: req.user!.id },
      include: {
        product: {
          include: {
            shop: true,
          },
        },
      },
    });

    return res.json(cartItems);
  } catch (error) {
    console.error('Error getting cart:', error);
    return res.status(500).json({ error: 'Failed to get cart' });
  }
}

// Add to cart
export async function addToCart(req: AuthRequest, res: Response) {
  try {
    const { productId, quantity } = req.body;

    if (!productId || !quantity) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Check if product exists
    const product = await prisma.product.findUnique({
      where: { id: productId },
    });

    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    // Check if item already in cart
    const existingItem = await prisma.cartItem.findUnique({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId,
        },
      },
    });

    let cartItem;
    if (existingItem) {
      cartItem = await prisma.cartItem.update({
        where: { id: existingItem.id },
        data: { quantity: existingItem.quantity + quantity },
        include: { product: true },
      });
    } else {
      cartItem = await prisma.cartItem.create({
        data: {
          userId: req.user!.id,
          productId,
          quantity,
        },
        include: { product: true },
      });
    }

    return res.json(cartItem);
  } catch (error) {
    console.error('Error adding to cart:', error);
    return res.status(500).json({ error: 'Failed to add to cart' });
  }
}

// Update cart item quantity
export async function updateCartItem(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ error: 'Missing quantity' });
    }

    if (quantity <= 0) {
      // Remove from cart
      await prisma.cartItem.delete({
        where: {
          userId_productId: {
            userId: req.user!.id,
            productId: productId as string,
          },
        },
      });
      return res.json({ message: 'Item removed from cart' });
    }

    const cartItem = await prisma.cartItem.update({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId: productId as string,
        },
      },
      data: { quantity },
      include: { product: true },
    });

    return res.json(cartItem);
  } catch (error) {
    console.error('Error updating cart item:', error);
    return res.status(500).json({ error: 'Failed to update cart item' });
  }
}

// Remove from cart
export async function removeFromCart(req: AuthRequest, res: Response) {
  try {
    const { productId } = req.params;

    await prisma.cartItem.delete({
      where: {
        userId_productId: {
          userId: req.user!.id,
          productId: productId as string,
        },
      },
    });

    return res.json({ message: 'Item removed from cart' });
  } catch (error) {
    console.error('Error removing from cart:', error);
    return res.status(500).json({ error: 'Failed to remove from cart' });
  }
}

// Place marketplace order
export async function placeOrder(req: AuthRequest, res: Response) {
  try {
    const { customerName, customerPhone, customerAddress, items } = req.body;

    if (!customerName || !customerPhone || !customerAddress || !items || items.length === 0) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Calculate total
    let total = 0;
    const productIds = items.map((item: any) => item.productId);

    const products = await prisma.product.findMany({
      where: { id: { in: productIds } },
    });

    const productMap = new Map<string, typeof products[0]>(products.map(p => [p.id, p]));

    for (const item of items) {
      const product = productMap.get(item.productId);
      if (!product) {
        return res.status(404).json({ error: `Product ${item.productId} not found` });
      }
      total += product!.price * item.quantity;
    }

    const orderId = generateOrderId('MARKET');

    // Create order with items in transaction
    const order = await prisma.$transaction(async (tx) => {
      const newOrder = await tx.marketplaceOrder.create({
        data: {
          orderId,
          userId: req.user!.id,
          customerName,
          customerPhone,
          customerAddress,
          total,
          status: 'Новый',
        },
      });

      // Create order items
      for (const item of items) {
        const product = productMap.get(item.productId)!;
        await tx.marketplaceOrderItem.create({
          data: {
            orderId: newOrder.id,
            productId: item.productId,
            quantity: item.quantity,
            price: product.price,
          },
        });
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { userId: req.user!.id },
      });

      return newOrder;
    });

    // Fetch complete order with items
    const completeOrder = await prisma.marketplaceOrder.findUnique({
      where: { id: order.id },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    return res.status(201).json(completeOrder);
  } catch (error) {
    console.error('Error placing order:', error);
    return res.status(500).json({ error: 'Failed to place order' });
  }
}

// Get marketplace orders
export async function getMarketplaceOrders(req: AuthRequest, res: Response) {
  try {
    const orders = await prisma.marketplaceOrder.findMany({
      where: { userId: req.user!.id },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          include: {
            product: {
              include: {
                shop: true,
              },
            },
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting marketplace orders:', error);
    return res.status(500).json({ error: 'Failed to get marketplace orders' });
  }
}

// Get seller orders
export async function getSellerOrders(req: AuthRequest, res: Response) {
  try {
    // Get seller's shop
    const shop = await prisma.shop.findFirst({
      where: { userId: req.user!.id },
    });

    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    // Get orders containing products from this shop
    const orders = await prisma.marketplaceOrder.findMany({
      where: {
        items: {
          some: {
            product: {
              shopId: shop.id,
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      include: {
        items: {
          where: {
            product: {
              shopId: shop.id,
            },
          },
          include: {
            product: true,
          },
        },
        user: {
          select: {
            name: true,
            phone: true,
          },
        },
      },
    });

    return res.json(orders);
  } catch (error) {
    console.error('Error getting seller orders:', error);
    return res.status(500).json({ error: 'Failed to get seller orders' });
  }
}
