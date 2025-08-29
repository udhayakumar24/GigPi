from fastapi import FastAPI, APIRouter
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List
import uuid
from datetime import datetime

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'gigpi')]

# Create the main app without a prefix
app = FastAPI(
    title="GigPi API",
    description="Pi Network Marketplace API",
    version="1.0.0"
)

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Define Models
class StatusCheck(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

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
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ShopCreate(BaseModel):
    name: str
    category: str
    services: str
    location: str
    description: str = ""
    deliveryAvailable: bool = False
    priceRange: str = ""

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "GigPi API is running!", "version": "1.0.0"}

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.dict()
    status_obj = StatusCheck(**status_dict)
    _ = await db.status_checks.insert_one(status_obj.dict())
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    status_checks = await db.status_checks.find().to_list(1000)
    return [StatusCheck(**status_check) for status_check in status_checks]

# Gig endpoints
@api_router.post("/gigs", response_model=Gig)
async def create_gig(gig_data: GigCreate):
    gig_dict = gig_data.dict()
    gig_obj = Gig(**gig_dict)
    await db.gigs.insert_one(gig_obj.dict())
    return gig_obj

@api_router.get("/gigs", response_model=List[Gig])
async def get_gigs():
    gigs = await db.gigs.find().to_list(1000)
    return [Gig(**gig) for gig in gigs]

@api_router.get("/gigs/{gig_id}", response_model=Gig)
async def get_gig(gig_id: str):
    gig = await db.gigs.find_one({"id": gig_id})
    if gig:
        return Gig(**gig)
    return {"error": "Gig not found"}

# Shop endpoints
@api_router.post("/shops", response_model=Shop)
async def create_shop(shop_data: ShopCreate):
    shop_dict = shop_data.dict()
    shop_obj = Shop(**shop_dict)
    await db.shops.insert_one(shop_obj.dict())
    return shop_obj
  @api_router.get("/shops", response_model=List[Shop])
async def get_shops():
    shops = await db.shops.find().to_list(1000)
    return [Shop(**shop) for shop in shops]

@api_router.get("/shops/{shop_id}", response_model=Shop)
async def get_shop(shop_id: str):
    shop = await db.shops.find_one({"id": shop_id})
    if shop:
        return Shop(**shop)
    return {"error": "Shop not found"}

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("startup")
async def startup_db_client():
    logger.info("Starting up GigPi API...")
    logger.info("Connected to MongoDB")

@app.on_event("shutdown")
async def shutdown_db_client():
    logger.info("Shutting down GigPi API...")
    client.close()
