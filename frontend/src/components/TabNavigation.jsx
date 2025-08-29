import React from 'react';
import { Briefcase, Store, Truck, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

const TabNavigation = ({ activeTab, setActiveTab, gigsCount, shopsCount }) => {
  const tabs = [
    { id: 'gigs', label: 'Gigs', icon: Briefcase, count: gigsCount },
    { id: 'shops', label: 'Shops', icon: Store, count: shopsCount },
    { id: 'delivery', label: 'Delivery', icon: Truck },
    { id: 'post', label: 'Post', icon: Plus }
  ];

  return (
    <div className="bg-gradient-to-r from-slate-50 to-gray-100 border-b border-gray-200 sticky top-16 z-40 shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex space-x-2 overflow-x-auto scrollbar-hide py-3">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            
            return (
              <Button
                key={tab.id}
                className={`flex items-center space-x-2 whitespace-nowrap transition-all duration-300 ${
                  isActive 
                    ? "bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-lg transform scale-105 hover:from-indigo-600 hover:to-purple-700" 
                    : "bg-white text-gray-600 hover:text-indigo-600 hover:bg-gradient-to-r hover:from-indigo-50 hover:to-purple-50 shadow-md border border-gray-200"
                }`}
                onClick={() => setActiveTab(tab.id)}
              >
                <Icon className="w-4 h-4" />
                <span className="font-medium">{tab.label}</span>
                {tab.count !== undefined && (
                  <Badge 
                    className={`ml-1 text-xs ${
                      isActive 
                        ? "bg-white/20 text-white" 
                        : "bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-700"
                    }`}
                  >
                    {tab.count}
                  </Badge>
                )}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default TabNavigation;
