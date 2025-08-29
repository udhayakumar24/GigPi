import React, { useState, useMemo } from "react";
import "./App.css";
import Header from "./components/Header";
import TabNavigation from "./components/TabNavigation";
import GigCard from "./components/GigCard";
import ShopCard from "./components/ShopCard";
import DeliverySection from "./components/DeliverySection";
import PostForms from "./components/PostForms";
import PaymentModal from "./components/PaymentModal";
import { Toaster } from "./components/ui/toaster";
import { mockGigs, mockShops } from "./data/mock";

function App() {
  const [activeTab, setActiveTab] = useState('gigs');
  const [searchQuery, setSearchQuery] = useState('');
  const [paymentModal, setPaymentModal] = useState({ isOpen: false, item: null });

  // Filter function for search
  const filteredGigs = useMemo(() => {
    if (!searchQuery.trim()) return mockGigs;
    return mockGigs.filter(gig =>
      gig.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gig.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const filteredShops = useMemo(() => {
    if (!searchQuery.trim()) return mockShops;
    return mockShops.filter(shop =>
      shop.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.services.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      shop.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery]);

  const handleSearch = () => {
    console.log('Searching for:', searchQuery);
  };

  const handlePayment = (item) => {
    setPaymentModal({ isOpen: true, item });
  };

  const handleVisitShop = (shop) => {
    setPaymentModal({ isOpen: true, item: shop });
  };

  const closePaymentModal = () => {
    setPaymentModal({ isOpen: false, item: null });
  };
  const renderTabContent = () => {
    switch (activeTab) {
      case 'gigs':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                Available Gigs
              </h2>
              <span className="bg-gradient-to-r from-indigo-100 to-purple-100 text-indigo-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                {filteredGigs.length} gigs
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredGigs.map((gig) => (
                <GigCard key={gig.id} gig={gig} onPayment={handlePayment} />
              ))}
            </div>
            {filteredGigs.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-indigo-100 to-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🔍</span>
                  </div>
                  <p className="text-gray-500 text-lg">No gigs found matching your search.</p>
                  <p className="text-gray-400 text-sm mt-2">Try different keywords or browse all gigs.</p>
                </div>
              </div>
            )}
          </div>
        );

      case 'shops':
        return (
          <div className="space-y-8">
            <div className="flex items-center justify-between">
              <h2 className="text-3xl font-bold bg-gradient-to-r from-teal-600 to-cyan-600 bg-clip-text text-transparent">
                Local Shops
              </h2>
              <span className="bg-gradient-to-r from-teal-100 to-cyan-100 text-teal-800 px-4 py-2 rounded-full text-sm font-semibold shadow-md">
                {filteredShops.length} shops
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
              {filteredShops.map((shop) => (
                <ShopCard key={shop.id} shop={shop} onVisit={handleVisitShop} />
              ))}
            </div>
            {filteredShops.length === 0 && (
              <div className="text-center py-16">
                <div className="max-w-md mx-auto">
                  <div className="w-24 h-24 bg-gradient-to-br from-teal-100 to-cyan-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-3xl">🏪</span>
                  </div>
                  <p className="text-gray-500 text-lg">No shops found matching your search.</p>
                  <p className="text-gray-400 text-sm mt-2">Try different keywords or browse all shops.</p>
                </div>
              </div>
            )}
          </div>
        );
case 'delivery':
        return <DeliverySection />;

      case 'post':
        return <PostForms />;

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-indigo-50">
      <Header 
        onSearch={handleSearch}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
      />
      
      <TabNavigation 
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        gigsCount={filteredGigs.length}
        shopsCount={filteredShops.length}
      />

      <main className="container mx-auto px-6 py-8">
        {renderTabContent()}
      </main>

      <PaymentModal
        isOpen={paymentModal.isOpen}
        onClose={closePaymentModal}
        item={paymentModal.item}
      />

      <Toaster />
    </div>
  );
}

export default App;
