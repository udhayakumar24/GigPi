import React, { useState } from 'react';
import { Search, ShoppingCart, User, Menu, Coins } from 'lucide-react';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const Header = ({ onSearch, searchQuery, setSearchQuery }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <header className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white sticky top-0 z-50 shadow-xl backdrop-blur-sm">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-br from-yellow-400 to-orange-500 p-2 rounded-xl">
              <Coins className="h-8 w-8 text-white drop-shadow-lg" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-yellow-200 bg-clip-text text-transparent">
              GigPi
            </h1>
            <Badge className="bg-gradient-to-r from-emerald-400 to-cyan-400 text-gray-800 font-semibold px-3 py-1 shadow-lg">
              Pi Network
            </Badge>
          </div>

          {/* Search Bar */}
          <div className="flex-1 max-w-2xl mx-8">
            <div className="relative">
              <Input
                type="text"
                placeholder="Search gigs, shops, or services..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 rounded-2xl border-0 bg-white/95 backdrop-blur-sm focus:ring-4 focus:ring-cyan-300/50 shadow-lg text-gray-800 placeholder-gray-500"
                onKeyPress={(e) => e.key === 'Enter' && onSearch()}
              />
              <Search 
                className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-500 cursor-pointer hover:text-purple-600 transition-colors" 
                onClick={onSearch}
              />
            </div>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-4">
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg">
              <ShoppingCart className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Cart</span>
            </Button>
            <Button className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 shadow-lg">
              <User className="h-5 w-5" />
              <span className="ml-2 hidden md:inline">Account</span>
            </Button>
            <Button
              variant="ghost"
              className="md:hidden text-white hover:bg-white/20"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden py-4 border-t border-white/20">
            <div className="flex flex-col space-y-2">
              <Button variant="ghost" className="text-white justify-start hover:bg-white/20">
                Gigs
              </Button>
              <Button variant="ghost" className="text-white justify-start hover:bg-white/20">
                Shops
              </Button>
              <Button variant="ghost" className="text-white justify-start hover:bg-white/20">
                Delivery
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
