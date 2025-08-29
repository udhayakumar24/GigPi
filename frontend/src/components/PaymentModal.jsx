import React from 'react';
import { X, Coins, Shield, Clock } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { useToast } from '../hooks/use-toast';

const PaymentModal = ({ isOpen, onClose, item }) => {
  const { toast } = useToast();

  const handlePayment = () => {
    toast({
      title: "Payment Successful!",
      description: `Payment of ${item?.price} Pi completed successfully.`,
      duration: 3000,
    });
    onClose();
  };

  if (!item) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Coins className="w-5 h-5 text-orange-500" />
            <span>Confirm Payment</span>
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <h4 className="font-semibold text-lg mb-2">{item.title || item.name}</h4>
            <p className="text-sm text-gray-600 mb-3">
              {item.description || item.services}
            </p>
            
            <div className="flex items-center justify-between">
              <span className="text-gray-600">Amount:</span>
              <div className="flex items-center text-xl font-bold text-orange-600">
                <Coins className="w-5 h-5 mr-1" />
                <span>{item.price} Pi</span>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-sm text-green-600 bg-green-50 p-3 rounded-lg">
            <Shield className="w-4 h-4" />
            <span>Secure Pi Network Payment</span>
          </div>

          <div className="flex items-center space-x-2 text-sm text-blue-600 bg-blue-50 p-3 rounded-lg">
            <Clock className="w-4 h-4" />
            <span>Instant confirmation after payment</span>
          </div>
          <div className="flex space-x-3">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handlePayment} className="flex-1 bg-orange-500 hover:bg-orange-600">
              Pay with Pi
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentModal;
