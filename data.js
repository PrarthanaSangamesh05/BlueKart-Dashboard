// BlueKart mock data (INR)
const MOCK_PRODUCTS = [
  {id:1,name:'Cotton Kurta',price:899.00,stock:120},
  {id:2,name:'Masala Chai Set',price:499.00,stock:60},
  {id:3,name:'Handicraft Diya Lamp',price:349.50,stock:210},
  {id:4,name:'4K Smart TV',price:34999.00,stock:18},
  {id:5,name:'Punjab Sweets Box',price:799.00,stock:40},
  {id:6,name:'Brass Pooja Thali',price:1199.00,stock:25},
  {id:7,name:'Reusable Jute Bag',price:249.00,stock:300},
  {id:8,name:'Ayurvedic Oil 200ml',price:399.00,stock:85},
  {id:9,name:'Classic Saree',price:2499.00,stock:50},
  {id:10,name:'Stainless Tiffin (3-tier)',price:699.00,stock:110}
];

const MOCK_ORDERS = [
  {id:3001,customer:'Amit Sharma',total:1299.00,status:'Shipped',date:'2025-11-27'},
  {id:3002,customer:'Pooja Verma',total:749.00,status:'Processing',date:'2025-11-29'},
  {id:3003,customer:'Rohit Singh',total:41999.00,status:'Delivered',date:'2025-11-30'},
  {id:3004,customer:'Sunita Rao',total:3499.00,status:'Out for Delivery',date:'2025-11-30'},
  {id:3005,customer:'Karan Mehta',total:1898.00,status:'Processing',date:'2025-12-01'}
];

const MOCK_CUSTOMERS = [
  {id:801,name:'Amit Sharma',email:'amit@example.in',orders:3,status:'VIP'},
  {id:802,name:'Pooja Verma',email:'pooja@example.in',orders:1,status:'Active'},
  {id:803,name:'Rohit Singh',email:'rohit@example.in',orders:4,status:'Active'},
  {id:804,name:'Sunita Rao',email:'sunita@example.in',orders:2,status:'Active'},
  {id:805,name:'Karan Mehta',email:'karan@example.in',orders:1,status:'Blocked'}
];

// initialize localStorage if empty
if(!localStorage.getItem('bk_products')) localStorage.setItem('bk_products', JSON.stringify(MOCK_PRODUCTS));
if(!localStorage.getItem('bk_orders')) localStorage.setItem('bk_orders', JSON.stringify(MOCK_ORDERS));
if(!localStorage.getItem('bk_customers')) localStorage.setItem('bk_customers', JSON.stringify(MOCK_CUSTOMERS));
