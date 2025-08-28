# server.py
from fastapi import FastAPI, APIRouter, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from typing import List, Optional
from enum import Enum
from pathlib import Path
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient
from datetime import datetime, timezone, timedelta
import os, uuid, logging, asyncio

ROOT = Path(__file__).parent
load_dotenv(ROOT / ".env")

MONGO_URL = os.environ.get("MONGO_URL", "mongodb://mongo:27017")
DB_NAME = os.environ.get("DB_NAME", "gigpi_database")
CORS_ORIGINS = os.environ.get("CORS_ORIGINS", "*").split(",")

client = AsyncIOMotorClient(MONGO_URL)
db = client[DB_NAME]

app = FastAPI(title="GigPi API")
api = APIRouter(prefix="/api")

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("gigpi")

# Enums
class ShopCategory(str, Enum):
    supermarket = "supermarket"
    repair = "repair"
    auto = "auto"
    restaurant = "restaurant"
    electronics = "electronics"
    fashion = "fashion"
    other = "other"

class DeliveryBlockDuration(str, Enum):
    three_hours = "3h"
    six_hours = "6h"

# Models
class GigCreate(BaseModel):
    title: str
    description: Optional[str] = ""
    price: float
    location: Optional[str] = ""
    category: Optional[str] = "general"

class Gig(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    title: str
    description: Optional[str] = ""
    price: float
    location: Optional[str] = ""
    category: Optional[str] = "general"
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    poster_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    coords: Optional[dict] = None
    paid: Optional[bool] = False
    rating: Optional[int] = None

class ShopCreate(BaseModel):
    name: str
    category: ShopCategory
    services: str
    location: Optional[str] = ""
    description: Optional[str] = ""

class Shop(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    category: ShopCategory
    services: str
    location: Optional[str] = ""
    description: Optional[str] = ""
    rating: float = 0.0
    total_ratings: int = 0
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    owner_id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    coords: Optional[dict] = None

class DeliveryBlockCreate(BaseModel):
    duration: DeliveryBlockDuration
    start_time: datetime

class DeliveryBlock(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    duration: DeliveryBlockDuration
    price: float
    start_time: datetime
    end_time: datetime
    status: str = "active"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    driver_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class PaymentCreate(BaseModel):
    item_type: str
    item_id: str
    amount: float

class Payment(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_type: str
    item_id: str
    amount: float
    status: str = "pending"
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    payer_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

class RatingCreate(BaseModel):
    item_type: str
    item_id: str
    rating: int = Field(ge=1, le=5)
    comment: Optional[str] = ""

class Rating(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    item_type: str
    item_id: str
    rating: int
    comment: Optional[str] = ""
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    reviewer_id: str = Field(default_factory=lambda: str(uuid.uuid4()))

# Helpers
def _prepare(obj: dict):
    out = {}
    for k,v in obj.items():
        if isinstance(v, datetime):
            out[k] = v.isoformat()
        else:
            out[k] = v
    return out

def _parse(doc: dict):
    if not doc: 
        return doc
    doc.pop("_id", None)
    # parse iso datetimes back to strings (frontend will handle formatting)
    return doc

# Routes
@api.get("/")
async def root():
    return {"message": "GigPi API up"}

# Gigs
@api.post("/gigs", response_model=Gig)
async def create_gig(g: GigCreate):
    gig = Gig(**g.dict())
    await db.gigs.insert_one(_prepare(gig.dict()))
    logger.info(f"Created gig {gig.id}")
    return gig

@api.get("/gigs", response_model=List[Gig])
async def list_gigs(search: Optional[str] = None):
    q = {}
    if search:
        q = {"$or": [
            {"title": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]}
    docs = await db.gigs.find(q).sort("created_at", -1).to_list(200)
    return [Gig(**_parse(d)) for d in docs]

@api.get("/gigs/{gid}", response_model=Gig)
async def get_gig(gid: str):
    doc = await db.gigs.find_one({"id": gid})
    if not doc:
        raise HTTPException(status_code=404, detail="Gig not found")
    return Gig(**_parse(doc))

# Shops
@api.post("/shops", response_model=Shop)
async def create_shop(s: ShopCreate):
    shop = Shop(**s.dict())
    await db.shops.insert_one(_prepare(shop.dict()))
    logger.info(f"Created shop {shop.id}")
    return shop

@api.get("/shops", response_model=List[Shop])
async def list_shops(search: Optional[str] = None):
    q = {}
    if search:
        q = {"$or": [
            {"name": {"$regex": search, "$options": "i"}},
            {"services": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
        ]}
    docs = await db.shops.find(q).sort("created_at", -1).to_list(200)
    return [Shop(**_parse(d)) for d in docs]

@api.get("/shops/{sid}", response_model=Shop)
async def get_shop(sid: str):
    doc = await db.shops.find_one({"id": sid})
    if not doc:
        raise HTTPException(status_code=404, detail="Shop not found")
    return Shop(**_parse(doc))

# Delivery blocks
@api.post("/delivery-blocks", response_model=DeliveryBlock)
async def create_delivery_block(d: DeliveryBlockCreate):
    start = d.start_time
    if d.duration == DeliveryBlockDuration.three_hours:
        price = 10.0
        end = start + timedelta(hours=3)
    else:
        price = 20.0
        end = start + timedelta(hours=6)
    block = DeliveryBlock(duration=d.duration, price=price, start_time=start, end_time=end)
    await db.delivery_blocks.insert_one(_prepare(block.dict()))
    logger.info(f"Created delivery block {block.id}")
    return block

@api.get("/delivery-blocks", response_model=List[DeliveryBlock])
async def list_delivery_blocks():
    docs = await db.delivery_blocks.find({}).sort("created_at", -1).to_list(200)
    return [DeliveryBlock(**_parse(d)) for d in docs]

# Payments (mock)
@api.post("/payments", response_model=Payment)
async def create_payment(p: PaymentCreate):
    pay = Payment(**p.dict())
    await db.payments.insert_one(_prepare(pay.dict()))
    # Mock processing
    await asyncio.sleep(2)
    await db.payments.update_one({"id": pay.id}, {"$set": {"status": "completed"}})
    # Mark related item as paid (if gig)
    if pay.item_type == "gig":
        await db.gigs.update_one({"id": pay.item_id}, {"$set": {"paid": True}})
    return pay

# Ratings
@api.post("/ratings", response_model=Rating)
async def create_rating(r: RatingCreate):
    rating = Rating(**r.dict())
    await db.ratings.insert_one(_prepare(rating.dict()))
    # If shop rating, update average
    if r.item_type == "shop":
        all_ratings = await db.ratings.find({"item_type": "shop", "item_id": r.item_id}).to_list(1000)
        avg = sum([int(x.get("rating", 0)) for x in all_ratings]) / len(all_ratings)
        await db.shops.update_one({"id": r.item_id}, {"$set": {"rating": round(avg, 1), "total_ratings": len(all_ratings)}})
    return rating

@api.get("/ratings/{item_type}/{item_id}", response_model=List[Rating])
async def get_ratings(item_type: str, item_id: str):
    docs = await db.ratings.find({"item_type": item_type, "item_id": item_id}).sort("created_at", -1).to_list(200)
    return [Rating(**_parse(d)) for d in docs]

# Include router & middleware
app.include_router(api)
app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"]
)

@app.on_event("shutdown")
async def shutdown():
    client.close()
  
