import { createOrderSchema } from './src/lib/validations.js';

const body = {
  items: [
    {
      productId: 'b0d45c1a-086f-4494-b81d-55f89164a93e', // Assuming this is valid
      size: 'M',
      quantity: 1
    }
  ],
  paymentMethod: 'cod',
  customerInfo: {
    name: 'Test User',
    email: 'test@example.com',
    phone: '9876543210',
    address: {
      line1: '123 Main St',
      city: 'Bangalore',
      state: 'Karnataka',
      pincode: '560001'
    }
  }
};

const result = createOrderSchema.safeParse(body);
console.log(JSON.stringify(result, null, 2));
