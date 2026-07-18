export interface Product {
  id: string;
  name: string;
  category: "dog" | "cat" | "fish" | "bird" | "accessories" | "food";
  petType: "dog" | "cat" | "fish" | "bird" | "all";
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  inStock: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  description: string;
  image: string;
}

export const PRODUCTS: Product[] = [
  { id:"prod01", name:"Royal Canin Adult Dog Food 10kg", category:"food", petType:"dog", price:2200, originalPrice:2800, rating:4.8, reviewCount:156, inStock:true, isFeatured:true, description:"Complete nutrition for adult dogs, scientifically formulated for optimal health.", image:"https://images.unsplash.com/photo-1589924691995-400dc9ecc119?w=400&q=80" },
  { id:"prod02", name:"Drools Puppy Starter Kit", category:"food", petType:"dog", price:850, rating:4.5, reviewCount:89, inStock:true, isNew:true, description:"All-in-one starter pack with puppy food, treats and a feeding bowl.", image:"https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=400&q=80" },
  { id:"prod03", name:"Whiskas Adult Cat Food 3kg", category:"food", petType:"cat", price:750, originalPrice:950, rating:4.6, reviewCount:112, inStock:true, isFeatured:true, description:"Balanced nutrition with real tuna flavour for adult cats.", image:"https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80" },
  { id:"prod04", name:"Tetra Flakes Fish Food 200ml", category:"food", petType:"fish", price:320, rating:4.4, reviewCount:67, inStock:true, description:"Premium flake food for all tropical fish species.", image:"https://images.unsplash.com/photo-1583212292454-1fe6229603b7?w=400&q=80" },
  { id:"prod05", name:"Trixie Adjustable Dog Harness", category:"accessories", petType:"dog", price:1200, rating:4.7, reviewCount:203, inStock:true, isFeatured:true, isNew:true, description:"Padded no-pull harness with reflective strips, fits all breeds.", image:"https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&q=80" },
  { id:"prod06", name:"Self-Grooming Cat Corner Brush", category:"accessories", petType:"cat", price:450, rating:4.3, reviewCount:44, inStock:true, description:"Wall-mount rubber brush for cats to self-groom and reduce shedding.", image:"https://images.unsplash.com/photo-1592194996308-7b43878e84a6?w=400&q=80" },
  { id:"prod07", name:"Bird Cage Large 60×40cm", category:"accessories", petType:"bird", price:1800, originalPrice:2200, rating:4.5, reviewCount:31, inStock:true, description:"Powder-coated wrought iron cage with feeding door and perches.", image:"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80" },
  { id:"prod08", name:"Aquarium Starter Kit 30L", category:"accessories", petType:"fish", price:3500, rating:4.6, reviewCount:28, inStock:true, isNew:true, description:"Complete 30L tank with filter, heater, LED light and gravel.", image:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80" },
  { id:"prod09", name:"Himalaya Erina-EP Tick Shampoo", category:"dog", petType:"dog", price:380, rating:4.7, reviewCount:321, inStock:true, isFeatured:true, description:"Anti-tick and flea medicated shampoo, gentle on skin.", image:"https://images.unsplash.com/photo-1583511655826-05700d52f4d9?w=400&q=80" },
  { id:"prod10", name:"Catit Fountain Water Dispenser", category:"cat", petType:"cat", price:2100, originalPrice:2600, rating:4.8, reviewCount:78, inStock:true, description:"1.5L recirculating fountain, keeps water fresh for fussy cats.", image:"https://images.unsplash.com/photo-1526336024174-e58f5cdd8e13?w=400&q=80" },
  { id:"prod11", name:"Budgie & Finch Seed Mix 1kg", category:"bird", petType:"bird", price:280, rating:4.4, reviewCount:55, inStock:true, description:"Balanced seed blend with vitamins for budgerigars and finches.", image:"https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=400&q=80" },
  { id:"prod12", name:"Chewy Rope Toy Set (3 pcs)", category:"dog", petType:"dog", price:499, rating:4.6, reviewCount:144, inStock:true, isNew:true, description:"Braided cotton rope toys, great for teething puppies and adult chewers.", image:"https://images.unsplash.com/photo-1535268647677-300dbf3d78d1?w=400&q=80" },
  { id:"prod13", name:"Pet Heating Pad 30×40cm", category:"accessories", petType:"all", price:890, originalPrice:1100, rating:4.5, reviewCount:62, inStock:false, description:"Self-regulating orthopedic heating pad for cats and small dogs.", image:"https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=400&q=80" },
  { id:"prod14", name:"Stainless Steel Double Bowl Stand", category:"accessories", petType:"dog", price:650, rating:4.3, reviewCount:38, inStock:true, description:"Elevated non-slip stand with two stainless bowls, adjustable height.", image:"https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400&q=80" },
  { id:"prod15", name:"Cat Scratching Post 60cm", category:"cat", petType:"cat", price:950, rating:4.6, reviewCount:91, inStock:true, isFeatured:true, description:"Sisal-wrapped sturdy post with hanging toy — saves your furniture.", image:"https://images.unsplash.com/photo-1574144611937-0df059b5ef3e?w=400&q=80" },
  { id:"prod16", name:"Colorful Cockatiel Toy Pack", category:"bird", petType:"bird", price:399, rating:4.2, reviewCount:17, inStock:true, isNew:true, description:"5-piece acrylic + rope toy set for cockatiels and parakeets.", image:"https://images.unsplash.com/photo-1452570053594-1b985d6ea890?w=400&q=80" },
  { id:"prod17", name:"Tropica Planted Aquarium Fertiliser", category:"fish", petType:"fish", price:550, rating:4.7, reviewCount:23, inStock:true, description:"Liquid fertiliser for planted aquariums, safe for fish.", image:"https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400&q=80" },
  { id:"prod18", name:"Pedigree Dentastix Daily Treats", category:"dog", petType:"dog", price:299, originalPrice:350, rating:4.5, reviewCount:278, inStock:true, isFeatured:true, description:"Daily dental chews clinically proven to reduce tartar build-up.", image:"https://images.unsplash.com/photo-1601758174114-e711c0cbaa69?w=400&q=80" },
];
