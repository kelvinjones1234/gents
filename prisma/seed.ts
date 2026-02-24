// import { PrismaClient, Role, OrderStatus, PaymentStatus } from '@prisma/client';
// import { faker } from '@faker-js/faker';

// const prisma = new PrismaClient();

// // Helper to generate unique slugs
// const generateSlug = (name: string) => {
//   return name.toLowerCase().replace(/ /g, '-') + '-' + faker.string.alphanumeric(5);
// };

// async function main() {
//   console.log('🌱 Starting seed...');

//   // 1. CLEANUP (Delete existing data to avoid conflicts)
//   // Delete in order of dependency (Children first, then Parents)
//   await prisma.review.deleteMany();
//   await prisma.payment.deleteMany();
//   await prisma.orderItem.deleteMany();
//   await prisma.order.deleteMany();
//   await prisma.productVariant.deleteMany();
//   await prisma.product.deleteMany();
//   await prisma.category.deleteMany();
//   await prisma.address.deleteMany();
//   await prisma.profile.deleteMany();
//   await prisma.user.deleteMany();

//   console.log('🧹 Database cleaned.');

//   // 2. CREATE USERS
//   console.log('👤 Creating users...');
  
//   // Create 1 Admin
//   await prisma.user.create({
//     data: {
//       fullName: 'Admin User',
//       email: 'admin@sellexplore.com',
//       password: 'hashed_password_secure', // In real app, hash this!
//       role: Role.ADMIN,
//       location: 'Lagos, Nigeria',
//       profile: {
//         create: {
//           phone: '+2348000000000',
//           avatar: faker.image.avatar(),
//         },
//       },
//     },
//   });

//   // Create 10 Customers
//   const users = [];
//   for (let i = 0; i < 10; i++) {
//     const firstName = faker.person.firstName();
//     const lastName = faker.person.lastName();
//     const user = await prisma.user.create({
//       data: {
//         fullName: `${firstName} ${lastName}`,
//         email: faker.internet.email({ firstName, lastName }),
//         password: 'password123',
//         location: `${faker.location.city()}, ${faker.location.country()}`,
//         role: Role.CUSTOMER,
//         profile: {
//           create: {
//             phone: faker.phone.number(),
//             avatar: faker.image.avatar(),
//             addresses: {
//               create: {
//                 street: faker.location.streetAddress(),
//                 city: faker.location.city(),
//                 state: faker.location.state(),
//                 country: faker.location.country(),
//                 postalCode: faker.location.zipCode(),
//                 isDefault: true,
//               },
//             },
//           },
//         },
//       },
//     });
//     users.push(user);
//   }

//   // 3. CREATE CATEGORIES
//   console.log('wm Creating categories...');
//   const categoryNames = ['Men\'s Fashion', 'Women\'s Fashion', 'Electronics', 'Home & Living', 'Accessories'];
//   const categories = [];

//   for (const name of categoryNames) {
//     const category = await prisma.category.create({
//       data: {
//         name,
//         slug: generateSlug(name),
//         description: faker.commerce.productDescription(),
//         image: faker.image.urlLoremFlickr({ category: 'fashion' }),
//         isFeatured: Math.random() > 0.5,
//       },
//     });
//     categories.push(category);
//   }

//   // 4. CREATE PRODUCTS & VARIANTS
//   console.log('📦 Creating products...');
//   const products = [];

//   for (let i = 0; i < 40; i++) {
//     const name = faker.commerce.productName();
//     const isVariable = Math.random() > 0.7; // 30% chance of being a variable product
//     const category = categories[Math.floor(Math.random() * categories.length)];
    
//     // Base Price
//     const price = parseFloat(faker.commerce.price({ min: 1000, max: 50000 }));
    
//     // Determine Stock Logic
//     const baseStock = isVariable ? 0 : faker.number.int({ min: 0, max: 100 });

//     const product = await prisma.product.create({
//       data: {
//         name,
//         slug: generateSlug(name),
//         description: faker.commerce.productDescription(),
//         basePrice: price,
//         discountPrice: Math.random() > 0.5 ? price * 0.8 : null,
//         stock: baseStock,
//         sku: faker.string.alphanumeric(10).toUpperCase(),
//         images: [
//           faker.image.urlLoremFlickr({ category: 'product' }),
//           faker.image.urlLoremFlickr({ category: 'fashion' }),
//         ],
//         hasVariants: isVariable,
//         isFeatured: Math.random() > 0.8,
//         isHotDeal: Math.random() > 0.9,
//         isNewArrival: Math.random() > 0.7,
//         categories: {
//           connect: { id: category.id },
//         },
//         // If variable, create variants inline
//         variants: isVariable ? {
//           create: [
//             {
//               sku: `${faker.string.alphanumeric(6).toUpperCase()}-S`,
//               size: 'S',
//               color: faker.color.human(),
//               price: price,
//               stock: faker.number.int({ min: 5, max: 20 }),
//             },
//             {
//               sku: `${faker.string.alphanumeric(6).toUpperCase()}-M`,
//               size: 'M',
//               color: faker.color.human(),
//               price: price + 200, // Slightly more expensive
//               stock: faker.number.int({ min: 5, max: 20 }),
//             },
//             {
//               sku: `${faker.string.alphanumeric(6).toUpperCase()}-L`,
//               size: 'L',
//               color: faker.color.human(),
//               price: price + 400,
//               stock: faker.number.int({ min: 5, max: 20 }),
//             }
//           ]
//         } : undefined
//       },
//       include: { variants: true } // Return variants so we can use them in orders
//     });
//     products.push(product);
//   }

//   // 5. CREATE ORDERS
//   console.log('🛍️ Creating orders...');
  
//   for (let i = 0; i < 15; i++) {
//     const user = users[Math.floor(Math.random() * users.length)];
//     const numItems = faker.number.int({ min: 1, max: 5 });
    
//     let totalAmount = 0;
//     const orderItemsData = [];

//     for (let j = 0; j < numItems; j++) {
//       const product = products[Math.floor(Math.random() * products.length)];
//       const quantity = faker.number.int({ min: 1, max: 3 });
      
//       let price = product.discountPrice || product.basePrice;
//       let variantId = null;

//       // If product has variants, pick one
//       if (product.hasVariants && product.variants.length > 0) {
//         const variant = product.variants[Math.floor(Math.random() * product.variants.length)];
//         price = variant.price;
//         variantId = variant.id;
//       }

//       totalAmount += price * quantity;

//       orderItemsData.push({
//         productId: product.id,
//         variantId: variantId,
//         quantity: quantity,
//         price: price
//       });
//     }

//     await prisma.order.create({
//       data: {
//         orderNumber: `ORD-${faker.string.numeric(8)}`,
//         userId: user.id,
//         status: faker.helpers.enumValue(OrderStatus),
//         totalAmount: totalAmount,
//         shippingAddress: {
//           street: faker.location.streetAddress(),
//           city: faker.location.city(),
//           state: faker.location.state(),
//           country: faker.location.country(),
//           postalCode: faker.location.zipCode(),
//         },
//         items: {
//           create: orderItemsData
//         },
//         payment: {
//           create: {
//             amount: totalAmount,
//             provider: 'Paystack',
//             reference: `REF-${faker.string.alphanumeric(12)}`,
//             status: faker.helpers.enumValue(PaymentStatus),
//           }
//         }
//       }
//     });
//   }

//   // 6. CREATE REVIEWS
//   console.log('⭐ Creating reviews...');
//   for (let i = 0; i < 30; i++) {
//     const user = users[Math.floor(Math.random() * users.length)];
//     const product = products[Math.floor(Math.random() * products.length)];

//     await prisma.review.create({
//       data: {
//         userId: user.id,
//         productId: product.id,
//         rating: faker.number.int({ min: 3, max: 5 }),
//         comment: faker.lorem.sentence(),
//       }
//     });
//   }

//   console.log('✅ Seeding completed!');
// }

// main()
//   .then(async () => {
//     await prisma.$disconnect();
//   })
//   .catch(async (e) => {
//     console.error(e);
//     await prisma.$disconnect();
//     process.exit(1);
//   });