import React, { useState } from 'react';
import { Truck, Clock, Coins, Play, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Label } from './ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Input } from './ui/input';
import { useToast } from '../hooks/use-toast';
import { mockDeliveryBlocks } from '../data/mock';

const DeliverySection = () => {
  const [deliveryForm, setDeliveryForm] = useState({
    duration: '',
    startTime: ''
  });

  const { toast } = useToast();

  const handleDeliverySubmit = (e) => {
    e.preventDefault();
    const earnings = deliveryForm.duration === '3h' ? '10 Pi' : '20 Pi';
    toast({
      title: "Delivery Block Started!",
      description: `Your ${deliveryForm.duration} delivery block has been activated. Expected earnings: ${earnings}`,
      duration: 3000,
    });
    setDeliveryForm({ duration: '', startTime: '' });
  };

  const calculateTotalEarnings = () => {
    return mockDeliveryBlocks.reduce((total, block) => total + block.earnings, 0).toFixed(1);
  };

  const calculateTotalDeliveries = () => {
    return mockDeliveryBlocks.reduce((total, block) => total + block.deliveriesCompleted, 0);
  };

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-emerald-50 to-teal-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-emerald-700 font-semibold mb-1">Total Earnings</p>
                <p className="text-3xl font-bold text-emerald-800 flex items-center">
                  <Coins className="w-6 h-6 mr-2 text-amber-500" />
                  {calculateTotalEarnings()} Pi
                </p>
              </div>
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 p-3 rounded-2xl">
                <TrendingUp className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-indigo-700 font-semibold mb-1">Deliveries</p>
                <p className="text-3xl font-bold text-indigo-800">{calculateTotalDeliveries()}</p>
              </div>
              <div className="bg-gradient-to-br from-indigo-500 to-purple-500 p-3 rounded-2xl">
                <Truck className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-pink-50 to-rose-50 border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-pink-700 font-semibold mb-1">Blocks</p>
                <p className="text-3xl font-bold text-pink-800">{mockDeliveryBlocks.length}</p>
              </div>
              <div className="bg-gradient-to-br from-pink-500 to-rose-500 p-3 rounded-2xl">
                <Clock className="w-8 h-8 text-white" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Create Delivery Block */}
      <Card className="shadow-2xl border-0 bg-gradient-to-br from-orange-50 via-amber-50 to-yellow-50 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-orange-500 to-amber-600 text-white">
          <CardTitle className="flex items-center space-x-3 text-xl">
            <div className="bg-white/20 p-2 rounded-lg">
              <Truck className="w-6 h-6" />
            </div>
            <span className="font-bold">Create Delivery Block</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleDeliverySubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="deliveryDuration">Duration</Label>
                <Select 
                  value={deliveryForm.duration} 
                  onValueChange={(value) => setDeliveryForm({...deliveryForm, duration: value})}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3h">3 Hours (10 Pi)</SelectItem>
                    <SelectItem value="6h">6 Hours (20 Pi)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="deliveryStartTime">Start Time</Label>
                <Input
                  id="deliveryStartTime"
                  type="datetime-local"
                  value={deliveryForm.startTime}
                  onChange={(e) => setDeliveryForm({...deliveryForm, startTime: e.target.value})}
                  required
                />
              </div>
            </div>
            <Button type="submit" className="w-full bg-gradient-to-r from-orange-500 to-amber-600 hover:from-orange-600 hover:to-amber-700 text-white font-semibold py-3 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105">
              <Play className="w-5 h-5 mr-2" />
              Start Delivery Block
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Recent Delivery History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Delivery Blocks</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockDeliveryBlocks.map((block) => (
              <div key={block.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <div>
                    <p className="font-medium">{block.duration} Block</p>
                    <p className="text-sm text-gray-500">
                      {new Date(block.startTime).toLocaleDateString()} • {block.deliveriesCompleted} deliveries
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600 flex items-center">
                    <Coins className="w-4 h-4 mr-1" />
                    {block.earnings} Pi
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default DeliverySection;
