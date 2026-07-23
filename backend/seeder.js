const { connectDB } = require('./config/db');
const Product = require('./models/Product');

const products = [
  // Grocery (5)
  { name: 'Basmati Rice 5kg', category: 'Grocery', price: 299, stock: 50, description: 'Premium quality long grain basmati rice', image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400&q=80' },
  { name: 'Wheat Flour 10kg', category: 'Grocery', price: 350, stock: 40, description: 'Fresh stone ground chakki atta', image: 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=400&q=80' },
  { name: 'Sugar 1kg', category: 'Grocery', price: 45, stock: 100, description: 'Pure refined white sugar', image: 'https://images.unsplash.com/photo-1559181567-c3190ca9d222?w=400&q=80' },
  { name: 'Salt 1kg', category: 'Grocery', price: 20, stock: 100, description: 'Iodized crystal table salt', image: 'https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?w=400&q=80' },
  { name: 'Sunflower Oil 1L', category: 'Grocery', price: 130, stock: 60, description: 'Refined healthy sunflower cooking oil', image: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&q=80' },

  // Spices (5)
  { name: 'Red Chilli Powder 200g', category: 'Spices', price: 55, stock: 80, description: 'Hot and spicy red chilli powder', image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?w=400&q=80' },
  { name: 'Turmeric Powder 100g', category: 'Spices', price: 35, stock: 80, description: 'Pure organic haldi powder', image: 'https://images.unsplash.com/photo-1615485500704-8e990f9900f7?w=400&q=80' },
  { name: 'Coriander Powder 200g', category: 'Spices', price: 40, stock: 70, description: 'Freshly ground coriander powder', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80' },
  { name: 'Garam Masala 100g', category: 'Spices', price: 60, stock: 60, description: 'Aromatic blend of whole spices', image: 'https://images.unsplash.com/photo-1532336414038-cf19250c5757?w=400&q=80' },
  { name: 'Cumin Seeds 100g', category: 'Spices', price: 45, stock: 75, description: 'Whole aromatic jeera seeds', image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950?w=400&q=80' },

  // Dairy (5)
  { name: 'Full Cream Milk 1L', category: 'Dairy', price: 60, stock: 50, description: 'Fresh full cream pasteurized milk', image: 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=400&q=80' },
  { name: 'Curd 500g', category: 'Dairy', price: 40, stock: 40, description: 'Fresh thick homestyle curd', image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&q=80' },
  { name: 'Paneer 200g', category: 'Dairy', price: 80, stock: 30, description: 'Soft fresh cottage cheese paneer', image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?w=400&q=80' },
  { name: 'Butter 100g', category: 'Dairy', price: 55, stock: 45, description: 'Creamy salted white butter', image: 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400&q=80' },
  { name: 'Cheese Slices 200g', category: 'Dairy', price: 90, stock: 35, description: 'Processed cheddar cheese slices', image: 'https://images.unsplash.com/photo-1486297678162-eb2a19b0a32d?w=400&q=80' },

  // Bakery (4)
  { name: 'White Bread', category: 'Bakery', price: 35, stock: 60, description: 'Soft fresh white sandwich bread', image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80' },
  { name: 'Brown Bread', category: 'Bakery', price: 45, stock: 50, description: 'Healthy whole wheat brown bread', image: 'https://images.unsplash.com/photo-1598373182133-52452f7691ef?w=400&q=80' },
  { name: 'Butter Biscuits 200g', category: 'Bakery', price: 30, stock: 80, description: 'Crispy golden butter biscuits', image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400&q=80' },
  { name: 'Cream Rolls 6pcs', category: 'Bakery', price: 50, stock: 40, description: 'Soft fluffy cream filled rolls', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=400&q=80' },

  // Snacks (4)
  { name: 'Lays Chips 50g', category: 'Snacks', price: 20, stock: 100, description: 'Classic salted crispy potato chips', image: 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400&q=80' },
  { name: 'Kurkure 90g', category: 'Snacks', price: 20, stock: 100, description: 'Crunchy masala flavored snack', image: 'https://images.unsplash.com/photo-1621939514649-280e2ee25f60?w=400&q=80' },
  { name: 'Biscuits Parle-G 200g', category: 'Snacks', price: 15, stock: 120, description: 'Classic sweet glucose biscuits', image: 'https://images.unsplash.com/photo-1590080875515-8a3a8dc5735e?w=400&q=80' },
  { name: 'Popcorn 100g', category: 'Snacks', price: 30, stock: 70, description: 'Light butter flavored popcorn', image: 'https://images.unsplash.com/photo-1585647347483-22b66260dfff?w=400&q=80' },

  // Beverages (4)
  { name: 'Coca Cola 2L', category: 'Beverages', price: 90, stock: 50, description: 'Refreshing chilled cola drink', image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&q=80' },
  { name: 'Mango Juice 1L', category: 'Beverages', price: 80, stock: 60, description: 'Fresh sweet mango fruit juice', image: 'https://images.unsplash.com/photo-1546173159-315724a31696?w=400&q=80' },
  { name: 'Green Tea 25 bags', category: 'Beverages', price: 99, stock: 40, description: 'Healthy antioxidant green tea', image: 'https://images.unsplash.com/photo-1556679343-c7306c1976bc?w=400&q=80' },
  { name: 'Coffee Powder 100g', category: 'Beverages', price: 120, stock: 35, description: 'Rich aromatic instant coffee', image: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=400&q=80' },

  // Household (4)
  { name: 'Detergent Powder 1kg', category: 'Household', price: 110, stock: 50, description: 'Powerful stain removing detergent', image: 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400&q=80' },
  { name: 'Dish Wash Bar', category: 'Household', price: 25, stock: 80, description: 'Grease cutting dish cleaning bar', image: 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400&q=80' },
  { name: 'Floor Cleaner 1L', category: 'Household', price: 85, stock: 45, description: 'Disinfectant pine floor cleaner', image: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=400&q=80' },
  { name: 'Toilet Cleaner 500ml', category: 'Household', price: 70, stock: 40, description: 'Powerful toilet bowl cleaner', image: 'https://images.unsplash.com/photo-1584813470613-5b1c1cad3d69?w=400&q=80' },

  // Personal Care (4)
  { name: 'Shampoo 200ml', category: 'Personal Care', price: 120, stock: 50, description: 'Nourishing moisturizing hair shampoo', image: 'https://images.unsplash.com/photo-1585751119414-ef2636f8aede?w=400&q=80' },
  { name: 'Soap Bar 100g', category: 'Personal Care', price: 35, stock: 80, description: 'Gentle moisturizing bath soap', image: 'https://images.unsplash.com/photo-1600857544200-b2f666a9a2ec?w=400&q=80' },
  { name: 'Toothpaste 150g', category: 'Personal Care', price: 65, stock: 70, description: 'Whitening cavity protection toothpaste', image: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=400&q=80' },
  { name: 'Face Wash 100ml', category: 'Personal Care', price: 99, stock: 45, description: 'Gentle deep cleansing face wash', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&q=80' },

  // Vegetables (4)
  { name: 'Tomato 500g', category: 'Vegetables', price: 25, stock: 60, description: 'Fresh ripe red tomatoes', image: 'https://images.unsplash.com/photo-1546094096-0df4bcaaa337?w=400&q=80' },
  { name: 'Onion 1kg', category: 'Vegetables', price: 30, stock: 70, description: 'Fresh farm onions', image: 'https://images.unsplash.com/photo-1508747703725-719777637510?w=400&q=80' },
  { name: 'Potato 1kg', category: 'Vegetables', price: 25, stock: 80, description: 'Fresh farm potatoes', image: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?w=400&q=80' },
  { name: 'Spinach 250g', category: 'Vegetables', price: 20, stock: 50, description: 'Fresh organic green spinach', image: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?w=400&q=80' },

  // Fruits (4)
  { name: 'Banana 12pcs', category: 'Fruits', price: 40, stock: 50, description: 'Fresh ripe yellow bananas', image: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=400&q=80' },
  { name: 'Apple 6pcs', category: 'Fruits', price: 120, stock: 40, description: 'Fresh crunchy red apples', image: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=400&q=80' },
  { name: 'Mango 4pcs', category: 'Fruits', price: 80, stock: 35, description: 'Sweet juicy Alphonso mangoes', image: 'https://images.unsplash.com/photo-1553279768-865429fa0078?w=400&q=80' },
  { name: 'Grapes 500g', category: 'Fruits', price: 60, stock: 40, description: 'Fresh seedless green grapes', image: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?w=400&q=80' },

  // Clothing (8)
  { name: 'Men Blue Jeans', category: 'Clothing', price: 799, stock: 30, description: 'Slim fit stretchable blue denim jeans', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&q=80' },
  { name: 'Women Floral Dress', category: 'Clothing', price: 599, stock: 25, description: 'Elegant floral print summer dress', image: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&q=80' },
  { name: 'Men Formal Shirt', category: 'Clothing', price: 499, stock: 35, description: 'Classic white formal office shirt', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&q=80' },
  { name: 'Women Kurti', category: 'Clothing', price: 399, stock: 25, description: 'Elegant casual cotton kurti', image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400&q=80' },
  { name: 'Kids Shorts', category: 'Clothing', price: 199, stock: 35, description: 'Comfortable breathable kids shorts', image: 'https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&q=80' },
  { name: 'Men Casual Jacket', category: 'Clothing', price: 999, stock: 20, description: 'Stylish lightweight casual jacket', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&q=80' },
  { name: 'Women Palazzo Pants', category: 'Clothing', price: 349, stock: 30, description: 'Comfortable wide leg palazzo pants', image: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4e5b?w=400&q=80' },
  { name: 'Kids School Uniform', category: 'Clothing', price: 450, stock: 40, description: 'Durable cotton school uniform set', image: 'https://images.unsplash.com/photo-1503919545889-aef636e10ad4?w=400&q=80' },

  // Tea Shirts (8)
  { name: 'Plain White T-Shirt', category: 'Tea Shirts', price: 249, stock: 50, description: 'Classic plain white 100% cotton tee', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&q=80' },
  { name: 'Graphic Print T-Shirt', category: 'Tea Shirts', price: 349, stock: 40, description: 'Trendy graphic printed round neck tee', image: 'https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=400&q=80' },
  { name: 'Polo T-Shirt Navy', category: 'Tea Shirts', price: 399, stock: 35, description: 'Classic navy blue polo collar tee', image: 'https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&q=80' },
  { name: 'Striped T-Shirt', category: 'Tea Shirts', price: 299, stock: 45, description: 'Casual horizontal striped cotton tee', image: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=400&q=80' },
  { name: 'V-Neck T-Shirt Black', category: 'Tea Shirts', price: 279, stock: 50, description: 'Slim fit black v-neck cotton tee', image: 'https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?w=400&q=80' },
  { name: 'Oversized T-Shirt', category: 'Tea Shirts', price: 449, stock: 30, description: 'Trendy oversized drop shoulder tee', image: 'https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&q=80' },
  { name: 'Printed Crop T-Shirt', category: 'Tea Shirts', price: 299, stock: 35, description: 'Stylish printed crop top for women', image: 'https://images.unsplash.com/photo-1554568218-0f1715e72254?w=400&q=80' },
  { name: 'Full Sleeve T-Shirt', category: 'Tea Shirts', price: 349, stock: 40, description: 'Warm full sleeve cotton t-shirt', image: 'https://images.unsplash.com/photo-1516826957135-700dedea698c?w=400&q=80' },

  // Boys Shoes (8)
  { name: 'Boys White Sneakers', category: 'Boys Shoes', price: 699, stock: 25, description: 'Stylish white lace-up sneakers for boys', image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&q=80' },
  { name: 'Boys Black School Shoes', category: 'Boys Shoes', price: 549, stock: 30, description: 'Durable black leather school shoes', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80' },
  { name: 'Boys Sports Shoes', category: 'Boys Shoes', price: 799, stock: 20, description: 'Lightweight cushioned sports shoes', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80' },
  { name: 'Boys Casual Loafers', category: 'Boys Shoes', price: 499, stock: 25, description: 'Comfortable slip-on casual loafers', image: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400&q=80' },
  { name: 'Boys Sandals', category: 'Boys Shoes', price: 349, stock: 35, description: 'Durable velcro strap daily sandals', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80' },
  { name: 'Boys Canvas Shoes', category: 'Boys Shoes', price: 449, stock: 30, description: 'Classic canvas lace-up shoes', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80' },
  { name: 'Boys Running Shoes', category: 'Boys Shoes', price: 899, stock: 20, description: 'High grip sole running shoes for boys', image: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=400&q=80' },
  { name: 'Boys Flip Flops', category: 'Boys Shoes', price: 199, stock: 50, description: 'Soft rubber daily wear flip flops', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80' },

  // Girls Shoes (8)
  { name: 'Girls Pink Sneakers', category: 'Girls Shoes', price: 699, stock: 25, description: 'Cute pink lace-up sneakers for girls', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=400&q=80' },
  { name: 'Girls Ballet Flats', category: 'Girls Shoes', price: 449, stock: 30, description: 'Elegant soft ballet flat shoes', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80' },
  { name: 'Girls School Shoes', category: 'Girls Shoes', price: 549, stock: 30, description: 'Comfortable black strap school shoes', image: 'https://images.unsplash.com/photo-1614252235316-8c857d38b5f4?w=400&q=80' },
  { name: 'Girls Glitter Sandals', category: 'Girls Shoes', price: 399, stock: 35, description: 'Sparkly glitter party sandals', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80' },
  { name: 'Girls Sports Shoes', category: 'Girls Shoes', price: 749, stock: 20, description: 'Lightweight breathable sports shoes', image: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=400&q=80' },
  { name: 'Girls Wedge Sandals', category: 'Girls Shoes', price: 499, stock: 25, description: 'Stylish wedge heel casual sandals', image: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&q=80' },
  { name: 'Girls Canvas Shoes', category: 'Girls Shoes', price: 399, stock: 30, description: 'Colorful canvas lace-up shoes', image: 'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=400&q=80' },
  { name: 'Girls Flip Flops', category: 'Girls Shoes', price: 199, stock: 50, description: 'Soft floral print daily flip flops', image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400&q=80' },

  // Sports Kits (8)
  { name: 'Cricket Bat Full Size', category: 'Sports Kits', price: 1299, stock: 15, description: 'English willow full size cricket bat', image: 'https://images.unsplash.com/photo-1531415074968-036ba1b575da?w=400&q=80' },
  { name: 'Football Size 5', category: 'Sports Kits', price: 599, stock: 20, description: 'Official size 5 synthetic football', image: 'https://images.unsplash.com/photo-1575361204480-aadea25e6e68?w=400&q=80' },
  { name: 'Badminton Racket Set', category: 'Sports Kits', price: 799, stock: 18, description: 'Lightweight aluminum badminton set with shuttles', image: 'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=400&q=80' },
  { name: 'Yoga Mat 6mm', category: 'Sports Kits', price: 499, stock: 25, description: 'Non-slip thick exercise yoga mat', image: 'https://images.unsplash.com/photo-1601925228008-f5e4c5e5b8e8?w=400&q=80' },
  { name: 'Gym Gloves', category: 'Sports Kits', price: 349, stock: 30, description: 'Padded grip gym workout gloves', image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=400&q=80' },
  { name: 'Skipping Rope', category: 'Sports Kits', price: 199, stock: 40, description: 'Adjustable speed skipping rope', image: 'https://images.unsplash.com/photo-1598289431512-b97b0917affc?w=400&q=80' },
  { name: 'Basketball Size 7', category: 'Sports Kits', price: 799, stock: 15, description: 'Rubber grip official size basketball', image: 'https://images.unsplash.com/photo-1546519638-68e109498ffc?w=400&q=80' },
  { name: 'Sports Water Bottle', category: 'Sports Kits', price: 299, stock: 35, description: 'BPA free 1L sports sipper bottle', image: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=400&q=80' },

  // Home Utensils (8)
  { name: 'Non-Stick Frying Pan', category: 'Home Utensils', price: 699, stock: 20, description: 'Granite coated non-stick frying pan 24cm', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
  { name: 'Stainless Steel Kadai', category: 'Home Utensils', price: 549, stock: 25, description: 'Heavy duty stainless steel cooking kadai', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
  { name: 'Pressure Cooker 3L', category: 'Home Utensils', price: 899, stock: 15, description: 'Aluminum ISI marked pressure cooker', image: 'https://images.unsplash.com/photo-1585515320310-259814833e62?w=400&q=80' },
  { name: 'Steel Dinner Set 24pcs', category: 'Home Utensils', price: 1299, stock: 10, description: 'Stainless steel 24 piece dinner set', image: 'https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80' },
  { name: 'Mixing Bowls Set', category: 'Home Utensils', price: 399, stock: 30, description: 'Set of 3 stainless steel mixing bowls', image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80' },
  { name: 'Wooden Spatula Set', category: 'Home Utensils', price: 249, stock: 40, description: 'Natural wood 3-piece spatula set', image: 'https://images.unsplash.com/photo-1590794056226-79ef3a8147e1?w=400&q=80' },
  { name: 'Glass Water Jug 1.5L', category: 'Home Utensils', price: 349, stock: 25, description: 'Borosilicate glass water jug with lid', image: 'https://images.unsplash.com/photo-1544145945-f90425340c7e?w=400&q=80' },
  { name: 'Knife Set 5pcs', category: 'Home Utensils', price: 599, stock: 20, description: 'Stainless steel sharp kitchen knife set', image: 'https://images.unsplash.com/photo-1593618998160-e34014e67546?w=400&q=80' },
];

const seed = async () => {
  await connectDB();
  await Product.destroy({ where: {} });
  await Product.bulkCreate(products);
  console.log(`✅ ${products.length} products seeded successfully!`);
  process.exit(0);
};

seed().catch((err) => {
  console.error('❌ Seeder failed:', err.message);
  process.exit(1);
});
