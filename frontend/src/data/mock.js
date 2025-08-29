// Mock data for GigPi - Pi Network Marketplace

export const mockGigs = [
  {
    id: 1,
    title: "Grocery Delivery Service",
    price: 8.5,
    location: "Downtown Center",
    category: "delivery",
    description: "Fast and reliable grocery delivery within 2 hours. Fresh items guaranteed.",
    poster: "Sarah Johnson",
    rating: 4.8,
    reviews: 127,
    image: "https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=200&fit=crop",
    isUrgent: true,
    estimatedTime: "2-3 hours"
  },
  {
    id: 2,
    title: "Home Cleaning Service",
    price: 25.0,
    location: "North Valley",
    category: "cleaning",
    description: "Professional deep cleaning service for homes and apartments. Eco-friendly products.",
    poster: "Mike Chen",
    rating: 4.9,
    reviews: 89,
    image: "https://images.unsplash.com/photo-1558618047-3c8c76ca7d13?w=300&h=200&fit=crop",
    isUrgent: false,
    estimatedTime: "3-4 hours"
  },
  {
    id: 3,
    title: "Pet Walking & Sitting",
    price: 12.0,
    location: "East District",
    category: "pets",
    description: "Experienced pet care service. Daily walks, feeding, and companionship for your pets.",
    poster: "Emma Rodriguez",
    rating: 5.0,
    reviews: 156,
    image: "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=300&h=200&fit=crop",
    isUrgent: false,
    estimatedTime: "1-2 hours"
  },
  {
    id: 4,
    title: "Tech Support & Setup",
    price: 15.0,
    location: "Tech Hub",
    category: "technology",
    description: "Computer repair, software installation, and tech support for homes and small businesses.",
    poster: "Alex Thompson",
    rating: 4.7,
    reviews: 94,
    image: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=300&h=200&fit=crop",
    isUrgent: true,
    estimatedTime: "1-3 hours"
  }
];
export const mockShops = [
  {
    id: 1,
    name: "Pi Fresh Market",
    category: "supermarket",
    services: "Fresh groceries, organic produce, daily essentials",
    location: "Main Street Plaza",
    description: "Your neighborhood supermarket with the freshest produce and best prices in town.",
    rating: 4.6,
    reviews: 234,
    image: "https://images.unsplash.com/photo-1578916171728-46686eac8d58?w=300&h=200&fit=crop",
    isOpen: true,
    deliveryAvailable: true,
    priceRange: "Pi 5-50"
  },
  {
    id: 2,
    name: "AutoFix Pro",
    category: "auto",
    services: "Oil change, tire repair, engine diagnostics, brake service",
    location: "Industrial District",
    description: "Professional auto repair services with certified mechanics and quality parts.",
    rating: 4.8,
    reviews: 167,
    image: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?w=300&h=200&fit=crop",
    isOpen: true,
    deliveryAvailable: false,
    priceRange: "Pi 20-200"
  },
  {
    id: 3,
    name: "TechNova Electronics",
    category: "electronics",
    services: "Smartphones, laptops, accessories, repair services",
    location: "Shopping Center",
    description: "Latest electronics and gadgets with competitive prices and warranty.",
    rating: 4.5,
    reviews: 312,
    image: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&h=200&fit=crop",
    isOpen: true,
    deliveryAvailable: true,
    priceRange: "Pi 10-500"
  },
  {
    id: 4,
    name: "Bella's Boutique",
    category: "fashion",
    services: "Women's clothing, accessories, personal styling",
    location: "Fashion District",
    description: "Trendy fashion boutique with curated collections and personal styling services.",
    rating: 4.7,
    reviews: 189,
    image: "https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?w=300&h=200&fit=crop",
    isOpen: false,
    deliveryAvailable: true,
    priceRange: "Pi 15-150"
  }
];
export const mockDeliveryBlocks = [
  {
    id: 1,
    duration: "3h",
    earnings: 45.5,
    startTime: "2024-01-15T14:00:00",
    endTime: "2024-01-15T17:00:00",
    status: "completed",
    deliveriesCompleted: 8
  },
  {
    id: 2,
    duration: "6h",
    earnings: 120.0,
    startTime: "2024-01-14T09:00:00",
    endTime: "2024-01-14T15:00:00",
    status: "completed",
    deliveriesCompleted: 15
  }
];

export const mockCategories = [
  { name: "All Categories", icon: "grid-3x3", count: 42 },
  { name: "Delivery", icon: "truck", count: 15 },
  { name: "Cleaning", icon: "spray-can", count: 8 },
  { name: "Technology", icon: "laptop", count: 12 },
  { name: "Pets", icon: "heart", count: 7 }
];

export const mockShopCategories = [
  { value: "supermarket", label: "Supermarket" },
  { value: "repair", label: "Repair Shop" },
  { value: "auto", label: "Auto Shop" },
  { value: "restaurant", label: "Restaurant" },
  { value: "electronics", label: "Electronics" },
  { value: "fashion", label: "Fashion" }
];
