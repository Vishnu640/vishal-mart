const swaggerJsdoc = require('swagger-jsdoc');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Vishal Mart API',
      version: '1.0.0',
      description: 'Full Stack Grocery Delivery Platform — REST API Documentation',
      contact: { name: 'Vishal Mart' },
    },
    servers: [
      { url: 'http://localhost:5001/api', description: 'Local Development' },
      { url: 'https://vishal-mart-backend.vercel.app/api', description: 'Production' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter your JWT token from /auth/login',
        },
      },
      schemas: {
        SuccessResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: true },
            data: { type: 'object' },
          },
        },
        ErrorResponse: {
          type: 'object',
          properties: {
            success: { type: 'boolean', example: false },
            message: { type: 'string', example: 'Something went wrong' },
          },
        },
        User: {
          type: 'object',
          properties: {
            id: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            name: { type: 'string', example: 'Vishal Kumar' },
            email: { type: 'string', example: 'vishal@example.com' },
            role: { type: 'string', enum: ['user', 'admin'], example: 'user' },
          },
        },
        Product: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            name: { type: 'string', example: 'Basmati Rice 5kg' },
            category: { type: 'string', example: 'Grocery' },
            price: { type: 'number', example: 299 },
            stock: { type: 'number', example: 50 },
            image: { type: 'string', example: 'https://example.com/rice.jpg' },
            description: { type: 'string', example: 'Premium quality basmati rice' },
          },
        },
        OrderItem: {
          type: 'object',
          properties: {
            product: { type: 'string', example: '64a1b2c3d4e5f6a7b8c9d0e1' },
            quantity: { type: 'number', example: 2 },
            price: { type: 'number', example: 299 },
          },
        },
        Order: {
          type: 'object',
          properties: {
            _id: { type: 'string' },
            userId: { type: 'string' },
            items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
            totalAmount: { type: 'number', example: 638 },
            street: { type: 'string', example: 'MG Road, Sector 5' },
            city: { type: 'string', example: 'Pune' },
            pincode: { type: 'string', example: '411001' },
            status: {
              type: 'string',
              enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'],
              example: 'placed',
            },
            paymentMethod: { type: 'string', enum: ['cod', 'prepaid'], example: 'cod' },
            paymentStatus: { type: 'string', enum: ['pending', 'paid'], example: 'pending' },
            estimatedDelivery: { type: 'string', format: 'date-time' },
            createdAt: { type: 'string', format: 'date-time' },
          },
        },
      },
    },
    tags: [
      { name: 'Auth', description: 'Authentication & user management' },
      { name: 'Products', description: 'Product catalogue management' },
      { name: 'Orders', description: 'Order placement & lifecycle' },
    ],
    paths: {
      // ─── AUTH ────────────────────────────────────────────────────────────
      '/auth/register': {
        post: {
          tags: ['Auth'],
          summary: 'Register a new customer account',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['name', 'email', 'password'],
                  properties: {
                    name: { type: 'string', example: 'Vishal Kumar' },
                    email: { type: 'string', example: 'vishal@example.com' },
                    password: { type: 'string', example: 'Secure@123' },
                    phone: { type: 'string', example: '9876543210' },
                    street: { type: 'string', example: 'MG Road' },
                    city: { type: 'string', example: 'Pune' },
                    pincode: { type: 'string', example: '411001' },
                  },
                },
              },
            },
          },
          responses: {
            201: {
              description: 'Account created successfully',
              content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } }] } } },
            },
            400: { description: 'Validation error or email already registered', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/login': {
        post: {
          tags: ['Auth'],
          summary: 'Login and receive a JWT token',
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['email', 'password'],
                  properties: {
                    email: { type: 'string', example: 'vishal@example.com' },
                    password: { type: 'string', example: 'Secure@123' },
                  },
                },
              },
            },
          },
          responses: {
            200: { description: 'Login successful', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { properties: { token: { type: 'string' }, user: { $ref: '#/components/schemas/User' } } } } }] } } } },
            401: { description: 'Invalid credentials', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            423: { description: 'Account locked after too many failed attempts', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/ErrorResponse' }, { properties: { locked: { type: 'boolean', example: true } } }] } } } },
          },
        },
      },
      '/auth/send-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Send OTP to a phone number for verification',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['phone'], properties: { phone: { type: 'string', example: '9876543210' } } } } },
          },
          responses: {
            200: { description: 'OTP sent successfully', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Invalid phone number', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/verify-otp': {
        post: {
          tags: ['Auth'],
          summary: 'Verify OTP for phone number',
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['phone', 'otp'], properties: { phone: { type: 'string', example: '9876543210' }, otp: { type: 'string', example: '482910' } } } } },
          },
          responses: {
            200: { description: 'OTP verified', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            400: { description: 'Invalid or expired OTP', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/profile': {
        get: {
          tags: ['Auth'],
          summary: 'Get logged-in user profile',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'User profile', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/User' } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        put: {
          tags: ['Auth'],
          summary: 'Update logged-in user profile',
          security: [{ bearerAuth: [] }],
          requestBody: {
            content: { 'application/json': { schema: { type: 'object', properties: { name: { type: 'string' }, phone: { type: 'string' }, street: { type: 'string' }, city: { type: 'string' }, pincode: { type: 'string' }, notificationsEnabled: { type: 'boolean' } } } } },
          },
          responses: {
            200: { description: 'Profile updated', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/change-password': {
        put: {
          tags: ['Auth'],
          summary: 'Change password for logged-in user',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['currentPassword', 'newPassword'], properties: { currentPassword: { type: 'string' }, newPassword: { type: 'string', example: 'NewSecure@456' } } } } },
          },
          responses: {
            200: { description: 'Password changed', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            401: { description: 'Current password incorrect', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/auth/users': {
        get: {
          tags: ['Auth'],
          summary: 'Get all registered users (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'List of users', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/User' } } } }] } } } },
            403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      // ─── PRODUCTS ────────────────────────────────────────────────────────
      '/products': {
        get: {
          tags: ['Products'],
          summary: 'Get all products (public)',
          responses: {
            200: { description: 'Product list', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Product' } } } }] } } } },
          },
        },
        post: {
          tags: ['Products'],
          summary: 'Add a new product (Admin only)',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          responses: {
            201: { description: 'Product created', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Product' } } }] } } } },
            400: { description: 'Validation error', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/products/{id}': {
        put: {
          tags: ['Products'],
          summary: 'Update a product (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            content: { 'application/json': { schema: { $ref: '#/components/schemas/Product' } } },
          },
          responses: {
            200: { description: 'Product updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Product' } } }] } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
        delete: {
          tags: ['Products'],
          summary: 'Delete a product (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Product deleted', content: { 'application/json': { schema: { $ref: '#/components/schemas/SuccessResponse' } } } },
            404: { description: 'Product not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },

      // ─── ORDERS ──────────────────────────────────────────────────────────
      '/orders': {
        post: {
          tags: ['Orders'],
          summary: 'Place a new order',
          security: [{ bearerAuth: [] }],
          requestBody: {
            required: true,
            content: {
              'application/json': {
                schema: {
                  type: 'object',
                  required: ['items', 'totalAmount', 'city', 'pincode'],
                  properties: {
                    items: { type: 'array', items: { $ref: '#/components/schemas/OrderItem' } },
                    totalAmount: { type: 'number', example: 638 },
                    street: { type: 'string', example: 'MG Road' },
                    city: { type: 'string', example: 'Pune' },
                    pincode: { type: 'string', example: '411001' },
                    paymentMethod: { type: 'string', enum: ['cod', 'prepaid'], example: 'cod' },
                  },
                },
              },
            },
          },
          responses: {
            201: { description: 'Order placed', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Order' } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/my': {
        get: {
          tags: ['Orders'],
          summary: 'Get orders for the logged-in customer',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'Customer orders', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } }] } } } },
            401: { description: 'Unauthorized', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/all': {
        get: {
          tags: ['Orders'],
          summary: 'Get all orders (Admin only)',
          security: [{ bearerAuth: [] }],
          responses: {
            200: { description: 'All orders', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { type: 'array', items: { $ref: '#/components/schemas/Order' } } } }] } } } },
            403: { description: 'Access denied', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/{id}/status': {
        put: {
          tags: ['Orders'],
          summary: 'Update order status (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          requestBody: {
            required: true,
            content: { 'application/json': { schema: { type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['placed', 'confirmed', 'packed', 'out_for_delivery', 'delivered', 'cancelled', 'return_requested', 'returned'] } } } } },
          },
          responses: {
            200: { description: 'Status updated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Order' } } }] } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/{id}/cancel': {
        put: {
          tags: ['Orders'],
          summary: 'Cancel an order (customer, placed/confirmed only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Order cancelled', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Order' } } }] } } } },
            400: { description: 'Cannot cancel at this stage', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/{id}/return': {
        put: {
          tags: ['Orders'],
          summary: 'Request a return (customer, delivered orders only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Return requested', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { $ref: '#/components/schemas/Order' } } }] } } } },
            400: { description: 'Only delivered orders can be returned', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
      '/orders/{id}/coupon': {
        post: {
          tags: ['Orders'],
          summary: 'Generate a 5% discount coupon for a prepaid order (Admin only)',
          security: [{ bearerAuth: [] }],
          parameters: [{ name: 'id', in: 'path', required: true, schema: { type: 'string' } }],
          responses: {
            200: { description: 'Coupon generated', content: { 'application/json': { schema: { allOf: [{ $ref: '#/components/schemas/SuccessResponse' }, { properties: { data: { properties: { couponCode: { type: 'string', example: 'VMXYZ123' }, couponDiscount: { type: 'number', example: 31 } } } } }] } } } },
            400: { description: 'Not a prepaid order', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
            404: { description: 'Order not found', content: { 'application/json': { schema: { $ref: '#/components/schemas/ErrorResponse' } } } },
          },
        },
      },
    },
  },
  apis: [], // all paths defined inline above
};

const swaggerSpec = swaggerJsdoc(options);
module.exports = swaggerSpec;
