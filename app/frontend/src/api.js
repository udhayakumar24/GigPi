// api.js - central Axios instance
import axios from "axios";

const BASE = process.env.REACT_APP_BACKEND_URL || "http://localhost:8000";
const API = `${BASE}/api`;

export default {
  getGigs: (q) => axios.get(`${API}/gigs`, { params: q ? { search: q } : {} }),
  getGig: (id) => axios.get(`${API}/gigs/${id}`),
  postGig: (payload) => axios.post(`${API}/gigs`, payload),
  getShops: (q) => axios.get(`${API}/shops`, { params: q ? { search: q } : {} }),
  postShop: (payload) => axios.post(`${API}/shops`, payload),
  getDeliveryBlocks: () => axios.get(`${API}/delivery-blocks`),
  postDeliveryBlock: (payload) => axios.post(`${API}/delivery-blocks`, payload),
  postPayment: (payload) => axios.post(`${API}/payments`, payload),
  postRating: (payload) => axios.post(`${API}/ratings`, payload),
  getRatings: (type, id) => axios.get(`${API}/ratings/${type}/${id}`)
};
