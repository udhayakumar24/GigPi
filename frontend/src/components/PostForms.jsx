import React, { useState } from 'react';
import { Plus, Briefcase, Store } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { useToast } from '../hooks/use-toast';
import { mockShopCategories } from '../data/mock';

const PostForms = () => {
  const [gigForm, setGigForm] = useState({
    title: '',
    price: '',
    location: '',
    category: '',
    description: ''
  });

  const [shopForm, setShopForm] = useState({
    name: '',
    category: '',
    services: '',
    location: '',
    description: ''
  });

  const { toast } = useToast();

  const handleGigSubmit = (e) => {
    e.preventDefault();
    // Simulate posting gig
    toast({
      title: "Gig Posted Successfully!",
      description: `Your gig "${gigForm.title}" has been posted to the marketplace.`,
      duration: 3000,
    });
    setGigForm({ title: '', price: '', location: '', category: '', description: '' });
  };

  const handleShopSubmit = (e) => {
    e.preventDefault();
    // Simulate registering shop
    toast({
      title: "Shop Registered Successfully!",
      description: `${shopForm.name} has been registered in the marketplace.`,
      duration: 3000,
    });
    setShopForm({ name: '', category: '', services: '', location: '', description: '' });
  };
  return (
    <div className="space-y-6">
      {/* Post Gig Form */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="bg-white/20 p-2 rounded-lg">
              <Briefcase className="w-6 h-6" />
            </div>
            <span className="font-bold">Post a Gig</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGigSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gigTitle">Title</Label>
                <Input
                  id="gigTitle"
                  placeholder="e.g., Deliver groceries"
                  value={gigForm.title}
                  onChange={(e) => setGigForm({...gigForm, title: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gigPrice">Price (Pi)</Label>
                <Input
                  id="gigPrice"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 5"
                  value={gigForm.price}
                  onChange={(e) => setGigForm({...gigForm, price: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="gigLocation">Location</Label>
                <Input
                  id="gigLocation"
                  placeholder="e.g., Downtown"
                  value={gigForm.location}
                  onChange={(e) => setGigForm({...gigForm, location: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="gigCategory">Category</Label>
                <Input
                  id="gigCategory"
                  placeholder="e.g., delivery, cleaning"
                  value={gigForm.category}
                  onChange={(e) => setGigForm({...gigForm, category: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="gigDescription">Description</Label>
              <Textarea
                id="gigDescription"
                placeholder="Describe what needs to be done..."
                rows={3}
                value={gigForm.description}
                onChange={(e) => setGigForm({...gigForm, description: e.target.value})}
                required
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
              <Briefcase className="w-5 h-5 mr-2" />
              Post Gig
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Register Shop Form */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-teal-50 via-cyan-50 to-emerald-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-teal-500 to-cyan-600 text-white">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="bg-white/20 p-2 rounded-lg">
              <Store className="w-6 h-6" />
            </div>
            <span className="font-bold">Register Shop</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleShopSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopName">Shop Name</Label>
                <Input
                  id="shopName"
                  placeholder="e.g., Bob's Auto Shop"
                  value={shopForm.name}
                  onChange={(e) => setShopForm({...shopForm, name: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopCategory">Category</Label>
                <Select 
                  value={shopForm.category} 
                  onValueChange={(value) => setShopForm({...shopForm, category: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockShopCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="shopServices">Services</Label>
                <Input
                  id="shopServices"
                  placeholder="e.g., Oil change, tire repair"
                  value={shopForm.services}
                  onChange={(e) => setShopForm({...shopForm, services: e.target.value})}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="shopLocation">Location</Label>
                <Input
                  id="shopLocation"
                  placeholder="e.g., Main Street"
                  value={shopForm.location}
                  onChange={(e) => setShopForm({...shopForm, location: e.target.value})}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="shopDescription">Description (Optional)</Label>
              <Textarea
                id="shopDescription"
                placeholder="Tell customers about your shop..."
                rows={3}
                value={shopForm.description}
                onChange={(e) => setShopForm({...shopForm, description: e.target.value})}
              />
            </div>
            
            <Button type="submit" className="w-full bg-gradient-to-r from-teal-500 to-cyan-600 hover:from-teal-600 hover:to-cyan-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
              <Store className="w-5 h-5 mr-2" />
              Register Shop
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default PostForms;
