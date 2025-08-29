import React from 'react';
import { MapPin, Star, Clock, Coins, Zap } from 'lucide-react';
import { Card, CardContent, CardFooter } from './ui/card';
import { Badge } from './ui/badge';
import { Button } from './ui/button';

const GigCard = ({ gig, onPayment }) => {
  return (
    <Card className="overflow-hidden hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 bg-white border-0 shadow-lg group">
      <div className="relative overflow-hidden">
        <img 
          src={gig.image} 
          alt={gig.title}
          className="w-full h-48 object-cover transition-transform duration-500 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        {gig.isUrgent && (
          <Badge className="absolute top-3 left-3 bg-gradient-to-r from-red-500 to-pink-500 text-white shadow-lg animate-pulse">
            <Zap className="w-3 h-3 mr-1" />
            Urgent
          </Badge>
        )}
      </div>
      
      <CardContent className="p-5">
        <div className="mb-3">
          <h3 className="font-bold text-lg leading-tight mb-2 text-gray-800 group-hover:text-indigo-600 transition-colors duration-300">
            {gig.title}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{gig.description}</p>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <MapPin className="w-4 h-4 mr-2 text-indigo-500" />
          <span>{gig.location}</span>
        </div>
        
        <div className="flex items-center text-sm text-gray-500 mb-4">
          <Clock className="w-4 h-4 mr-2 text-purple-500" />
          <span>{gig.estimatedTime}</span>
        </div>
        
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center">
            <div className="flex items-center text-amber-500 text-sm">
              <Star className="w-4 h-4 fill-current" />
              <span className="ml-1 font-semibold">{gig.rating}</span>
              <span className="text-gray-400 ml-1">({gig.reviews})</span>
            </div>
          </div>
          <div className="text-sm text-gray-600 font-medium">
            by {gig.poster}
          </div>
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
            <Coins className="w-5 h-5 mr-2 text-amber-500" />
            <span>{gig.price} Pi</span>
          </div>
        </div>
      </CardContent>
      <CardFooter className="p-5 pt-0">
        <Button 
          className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105"
          onClick={() => onPayment(gig)}
        >
          Book Now
        </Button>
      </CardFooter>
    </Card>
  );
};

export default GigCard;
