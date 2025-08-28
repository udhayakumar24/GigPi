import React, { useEffect, useState, useRef } from "react";
import api from "./api";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Simple CSS included in index.css (I assume you'll put Tailwind or custom CSS)
import "./App.css";

function App() {
  const [gigs, setGigs] = useState([]);
  const [shops, setShops] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [showGigModal, setShowGigModal] = useState(false);
  const [showShopModal, setShowShopModal] = useState(false);
  const [showDeliveryModal, setShowDeliveryModal] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const mapRef = useRef(null);
  const gigMarkersRef = useRef([]);
  const shopMarkersRef = useRef([]);

  // form states
  const [gigForm, setGigForm] = useState({ title: "", description: "", price: "", location: "", coords: null });
  const [shopForm, setShopForm] = useState({ name: "", category: "supermarket", services: "", location: "", coords: null });

  useEffect(() => {
    fetchAll();
    initMap();
    // eslint-disable-next-line
  }, []);

  useEffect(() => {
    refreshMarkers();
    // eslint-disable-next-line
  }, [gigs, shops, mapReady]);

  async function fetchAll() {
    setLoading(true);
    try {
      const [gRes, sRes] = await Promise.all([api.getGigs(), api.getShops()]);
      setGigs(gRes.data || []);
      setShops(sRes.data || []);
    } catch (e) {
      console.error(e);
      alert("Failed to fetch data from backend.");
    } finally { setLoading(false); }
  }

  function initMap() {
    if (mapRef.current) return;
    const map = L.map("map").setView([20, 0], 2);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png").addTo(map);
    mapRef.current = map;
    setMapReady(true);
    // locate user
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 13);
        L.circle([pos.coords.latitude, pos.coords.longitude], { radius: 60 }).addTo(map);
      }, () => {});
    }
  }

  function clearMarkers() {
    gigMarkersRef.current.forEach(m => m.remove());
    shopMarkersRef.current.forEach(m => m.remove());
    gigMarkersRef.current = [];
    shopMarkersRef.current = [];
  }

  function refreshMarkers() {
    if (!mapRef.current) return;
    clearMarkers();
    const q = search.toLowerCase();
    gigs.forEach(g => {
      if (q && !(g.title?.toLowerCase().includes(q) || g.location?.toLowerCase().includes(q))) return;
      const latlng = (g.coords && g.coords.lat) ? [g.coords.lat, g.coords.lng] : null;
      if (latlng) {
        const m = L.marker(latlng).addTo(mapRef.current).bindPopup(`<b>${g.title}</b><br/>${g.price} Pi`);
        gigMarkersRef.current.push(m);
      }
    });
    shops.forEach(s => {
      if (q && !(s.name?.toLowerCase().includes(q) || s.services?.toLowerCase().includes(q))) return;
      const latlng = (s.coords && s.coords.lat) ? [s.coords.lat, s.coords.lng] : null;
      if (latlng) {
        const m = L.marker(latlng).addTo(mapRef.current).bindPopup(`<b>${s.name}</b><br/>${s.category}`);
        shopMarkersRef.current.push(m);
      }
    });
  }

  // create gig
  async function submitGig(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...gigForm };
      if (payload.price) payload.price = parseFloat(payload.price);
      await api.postGig(payload);
      setShowGigModal(false);
      setGigForm({ title: "", description: "", price: "", location: "", coords: null });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to post gig");
    } finally { setLoading(false); }
  }

  // create shop
  async function submitShop(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await api.postShop(shopForm);
      setShowShopModal(false);
      setShopForm({ name: "", category: "supermarket", services: "", location: "", coords: null });
      fetchAll();
    } catch (err) {
      console.error(err);
      alert("Failed to register shop");
    } finally { setLoading(false); }
  }

  async function doPayment(item, type) {
    if (!window.confirm(`Pay ${item.price} Pi for ${type}?`)) return;
    setLoading(true);
    try {
      await api.postPayment({ item_type: type, item_id: item.id, amount: item.price });
      alert("Payment success (mock)");
      fetchAll();
      // optionally show rating flow here
    } catch (err) {
      console.error(err);
      alert("Payment failed");
    } finally { setLoading(false); }
  }

  return (
    <div className="app-root">
      <header className="header">
        <div className="brand">
          <div className="logo">π</div>
          <h1>GigPi</h1>
        </div>
        <div className="controls">
          <button onClick={() => setShowGigModal(true)}>Post Gig</button>
          <button onClick={() => setShowShopModal(true)}>Register Shop</button>
          <button onClick={() => setShowDeliveryModal(true)}>Delivery</button>
        </div>
      </header>

      <main className="main">
        <section className="map-card">
          <div id="map" style={{ height: 300, borderRadius: 8 }} />
        </section>

        <section className="search-card">
          <input placeholder="Search gigs or shops..." value={search} onChange={e => setSearch(e.target.value)} />
          <button onClick={refreshMarkers}>Search</button>
        </section>

        <section className="grid">
          <div className="card">
            <h3>Available Gigs</h3>
            {gigs.length === 0 ? <p>No gigs</p> : gigs.map(g => (
              <div key={g.id} className="item">
                <div>
                  <div className="title">{g.title}</div>
                  <div className="small">{g.location}</div>
                </div>
                <div>
                  <div className="price">{g.price} Pi</div>
                  <div><button onClick={() => doPayment(g, "gig")}>{g.paid ? "Paid" : "Pay"}</button></div>
                </div>
              </div>
            ))}
          </div>

          <aside className="card">
            <h3>Latest Shop</h3>
            {shops.length === 0 ? <p>No shops</p> : (() => {
              const latest = shops[0];
              return (
                <div>
                  <h4>{latest.name}</h4>
                  <div className="small">{latest.services}</div>
                  <div style={{marginTop:8}}>
                    <button onClick={() => doPayment(latest, "shop_service")}>Hire</button>
                  </div>
                </div>
              );
            })()}
          </aside>
        </section>
      </main>

      {/* Modals */}
      {showGigModal && (
        <div className="modal">
          <form onSubmit={submitGig} className="modal-inner">
            <h3>Post Gig</h3>
            <label>Title<input value={gigForm.title} onChange={e=>setGigForm({...gigForm, title:e.target.value})} required/></label>
            <label>Details<textarea value={gigForm.description} onChange={e=>setGigForm({...gigForm, description:e.target.value})} /></label>
            <label>Price (Pi)<input value={gigForm.price} onChange={e=>setGigForm({...gigForm, price:e.target.value})} type="number" step="0.1" /></label>
            <label>Location<input value={gigForm.location} onChange={e=>setGigForm({...gigForm, location:e.target.value})} /></label>
            <div className="modal-actions">
              <button type="button" onClick={()=>setShowGigModal(false)}>Cancel</button>
              <button type="submit">Post</button>
            </div>
          </form>
        </div>
      )}

      {showShopModal && (
        <div className="modal">
          <form onSubmit={submitShop} className="modal-inner">
            <h3>Register Shop</h3>
            <label>Name<input value={shopForm.name} onChange={e=>setShopForm({...shopForm, name:e.target.value})} required/></label>
            <label>Category
              <select value={shopForm.category} onChange={e=>setShopForm({...shopForm, category:e.target.value})}>
                <option value="supermarket">Supermarket</option>
                <option value="repair">Repair</option>
                <option value="auto">Auto</option>
                <option value="restaurant">Restaurant</option>
                <option value="electronics">Electronics</option>
                <option value="fashion">Fashion</option>
              </select>
            </label>
            <label>Services<input value={shopForm.services} onChange={e=>setShopForm({...shopForm, services:e.target.value})} /></label>
            <label>Location<input value={shopForm.location} onChange={e=>setShopForm({...shopForm, location:e.target.value})} /></label>
            <div className="modal-actions">
              <button type="button" onClick={()=>setShowShopModal(false)}>Cancel</button>
              <button type="submit">Register</button>
            </div>
          </form>
        </div>
      )}

      {showDeliveryModal && (
        <div className="modal">
          <div className="modal-inner">
            <h3>Delivery Block (mock)</h3>
            <p>Use backend to create blocks — handled in UI later.</p>
            <button onClick={()=>setShowDeliveryModal(false)}>Close</button>
          </div>
        </div>
      )}

      <footer className="footer">
        <small>GigPi — Pi-powered gig & shop marketplace (demo)</small>
      </footer>
    </div>
  );
}

export default App;
  
