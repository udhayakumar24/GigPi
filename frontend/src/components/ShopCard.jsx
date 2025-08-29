import React from 'react';
import { MapPin, Star, Truck, Clock, Coins } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const ShopCard = ({ shop, onVisit }) => {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-0 shadow-lg group">
      <div className="relative overflow-hidden">
        <img 
          src={shop.image} 
          alt={shop.name}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {!shop.isOpen && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <Badge className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-sm px-4 py-2 shadow-lg">
              <Clock className="w-4 h-4 mr-2" />
              Closed Now
            </Badge>
          </div>
        )}
        {shop.deliveryAvailable && (
          <Badge className="absolute top-3 right-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg">
            <Truck className="w-3 h-3 mr-1" />
            Delivery
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg leading-tight mb-2 text-gray-800 group-hover:text-teal-600 transition-colors duration-300">
            {shop.name}
          </h3>
          <Badge className="bg-gradient-to-r from-cyan-100 to-teal-100 text-teal-700 text-xs font-medium px-3 py-1 mb-3">
            {shop.category.charAt(0).toUpperCase() + shop.category.slice(1)}
          </Badge>
        </div>
        
        <p className="text-sm text-gray-600 line-clamp-2 mb-3 leading-relaxed">{shop.services}</p>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-2 text-teal-500" />
          <span>{shop.location}</span>
        </div>
        
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center text-amber-500 text-sm">
            <Star className="w-4 h-4 fill-current" />
            <span className="ml-1 font-semibold">{shop.rating}</span>
            <span className="text-gray-400 ml-1">({shop.reviews})</span>
          </div>
          <div className="flex items-center text-sm font-medium bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
            <Coins className="w-4 h-4 mr-1 text-amber-500" />
            <span>{shop.priceRange}</span>
          </div>
        </div>
        
        {shop.description && (
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed">{shop.description}</p>
        )}
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          className={`w-full font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
            shop.isOpen 
              ? "bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white" 
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
          onClick={() => onVisit(shop)}
          disabled={!shop.isOpen}
        >
          {shop.isOpen ? 'Visit Shop' : 'Shop Closed'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default ShopCard;
