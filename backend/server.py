from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timezone
from pathlib import Path
import os
import uuid
import logging

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
db_name = os.environ.get('DB_NAME', 'gigpi')
client = AsyncIOMotorClient(mongo_url)
db = client[db_name]

# FastAPI app
app = FastAPI(
    title="GigPi API",
    description="Pi Network Marketplace API",
    version="1.0.0"
)

# Router
api_router = APIRouter(prefix="/api")

# ==========================
# MODELS
# ==========================
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class Gig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    price: float
    location: str
    category: str
    description: str
    poster: str
    rating: float = 0.0
    reviews: int = 0
    isUrgent: bool = False
    estimatedTime: str
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class GigCreate(BaseModel):
    title: str
    price: float
    location: str
    category: str
    description: str
    poster: str
    isUrgent: bool = False
    estimatedTime: str

class Shop(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: str
    services: str
    location: str
    description: str = ""
    rating: float = 0.0
    reviews: int = 0
    isOpen: bool = True
    deliveryAvailable: bool = False
    priceRange: str = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class ShopCreate(BaseModel):
    name: str
    category: str
    services: str
    location: str
    description: str = ""
    deliveryAvailable: bool = False
    priceRange: str = ""

# ==========================
# ROUTES
# ==========================

# Root
@api_router.get("/")
async def root():
    return {"message": "GigPi API is running!", "version": "1.0.0"}

# Status routes
@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_obj = StatusCheck(**input.dict())
    await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**sc) for sc in status_checks]

# Gig routes
@api_router.post("/gigs", response_model=Gig)
async def create_gig(gig_data: GigCreate):
    gig_obj = Gig(**gig_data.dict())
    await db.gigs.insert_one(gig_obj.dict())
    return gig_obj

@api_router.get("/gigs", response_model=List[Gig])
async def get_gigs(search: Optional[str] = None):
    query = {}
    if search:
        query = {
            "$or": [
                {"title": {"$regex": search, "$options": "i"}},
                {"description": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}}
            ]
        }
    gigs = await db.gigs.find(query).sort("created_at", -1).to_list(1000)
    return [Gig(**gig) for gig in gigs]

@api_router.get("/gigs/{gig_id}", response_model=Gig)
async def get_gig(gig_id: str):
    gig = await db.gigs.find_one({"id": gig_id})
    if not gig:
        raise HTTPException(status_code=404, detail="Gig not found")
    return Gig(**gig)

# Shop routes
@api_router.post("/shops", response_model=Shop)
async def create_shop(shop_data: ShopCreate):
    shop_obj = Shop(**shop_data.dict())
    await db.shops.insert_one(shop_obj.dict())
    return shop_obj

@api_router.get("/shops", response_model=List[Shop])
async def get_shops(search: Optional[str] = None):
    query = {}
    if search:
        query = {
            "$or": [
                {"name": {"$regex": search, "$options": "i"}},
                {"services": {"$regex": search, "$options": "i"}},
                {"category": {"$regex": search, "$options": "i"}}
            ]
        }
    shops = await db.shops.find(query).sort("created_at", -1).to_list(1000)
    return [Shop(**shop) for shop in shops]

@api_router.get("/shops/{shop_id}", response_model=Shop)
async def get_shop(shop_id: str):
    shop = await db.shops.find_one({"id": shop_id})
    if not shop:
        raise HTTPException(status_code=404, detail="Shop not found")
    return Shop(**shop)

# ==========================
# MIDDLEWARE & ROUTER
# ==========================
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"]
)

# ==========================
# LOGGING
# ==========================
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting GigPi API...")
    logger.info(f"Connected to MongoDB: {db_name}")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down GigPi API...")
    client.close()
    
