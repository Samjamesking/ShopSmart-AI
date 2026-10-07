import json
import random
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from app.models import User, Product, Review, Wishlist, PriceHistory, SearchHistory, Order
from app.auth import get_password_hash

# High quality Unsplash imagery per category
IMAGE_COLLECTIONS = {
    "Electronics": [
        "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80", # MacBook
        "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80", # Smartphone
        "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80", # Headphones
        "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800&auto=format&fit=crop&q=80", # Watch
        "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80", # Gaming Laptop
        "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80", # Dell Laptop
        "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80", # Headset
        "https://images.unsplash.com/photo-1579586337278-3befd40fd17a?w=800&auto=format&fit=crop&q=80", # Smartwatch
        "https://images.unsplash.com/photo-1546868871-7041f2a55e12?w=800&auto=format&fit=crop&q=80", # Smart watch
        "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=800&auto=format&fit=crop&q=80", # Monitor
        "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80", # Laptop work
        "https://images.unsplash.com/photo-1563206767-5b18f218e8de?w=800&auto=format&fit=crop&q=80", # Camera
        "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80", # Mobile phone
    ],
    "Fashion": [
        "https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=800&auto=format&fit=crop&q=80", # Nike Red shoe
        "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80", # Vans Shoes
        "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=800&auto=format&fit=crop&q=80", # Jacket
        "https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=800&auto=format&fit=crop&q=80", # Shoes
        "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=800&auto=format&fit=crop&q=80", # Backpack
        "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=800&auto=format&fit=crop&q=80", # White T-Shirt
        "https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=800&auto=format&fit=crop&q=80", # Denim Jacket
        "https://images.unsplash.com/photo-1539185441755-769473a23570?w=800&auto=format&fit=crop&q=80", # Running Shoes
        "https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=800&auto=format&fit=crop&q=80", # Puma Shoes
        "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=800&auto=format&fit=crop&q=80", # Summer Dress
    ],
    "Books": [
        "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=800&auto=format&fit=crop&q=80", # Open Book
        "https://images.unsplash.com/photo-1512820790803-83ca734da794?w=800&auto=format&fit=crop&q=80", # Book on table
        "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&auto=format&fit=crop&q=80", # Stack of books
        "https://images.unsplash.com/photo-1532012164546-f432f2e3777f?w=800&auto=format&fit=crop&q=80", # Book reading
        "https://images.unsplash.com/photo-1589829085413-56de8ae18c73?w=800&auto=format&fit=crop&q=80", # Library books
    ],
    "Home Appliances": [
        "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=800&auto=format&fit=crop&q=80", # Coffee maker
        "https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=800&auto=format&fit=crop&q=80", # Kitchen appliance
        "https://images.unsplash.com/photo-1585338107529-13afc5f02586?w=800&auto=format&fit=crop&q=80", # Smart TV
        "https://images.unsplash.com/photo-1574269909862-7e1d70bb8078?w=800&auto=format&fit=crop&q=80", # Blender
        "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=800&auto=format&fit=crop&q=80", # Washing machine
        "https://images.unsplash.com/photo-1588854337236-6889d631faa8?w=800&auto=format&fit=crop&q=80", # Microwave
    ],
    "Sports Equipment": [
        "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=800&auto=format&fit=crop&q=80", # Gym weights
        "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=800&auto=format&fit=crop&q=80", # Dumbbells
        "https://images.unsplash.com/photo-1575052814086-f385e2e2ad1b?w=800&auto=format&fit=crop&q=80", # Yoga mat
        "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&auto=format&fit=crop&q=80", # Fitness gym
        "https://images.unsplash.com/photo-1517649763962-0c623266ddc0?w=800&auto=format&fit=crop&q=80", # Running cycle
        "https://images.unsplash.com/photo-1622163642998-1ea32b0bbc67?w=800&auto=format&fit=crop&q=80", # Badminton racket
    ]
}

# Specific showcase products featured in design mockups
FEATURED_PRODUCTS = [
    {
        "name": "ASUS TUF Gaming A15",
        "brand": "ASUS",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": 78990.0,
        "original_price": 99990.0,
        "discount_percent": 21,
        "description": "High-performance gaming laptop with AMD Ryzen 7 7735HS, 16GB DDR5 RAM, 512GB NVMe SSD, and NVIDIA GeForce RTX 4050 6GB GDDR6 graphics with 144Hz FHD display.",
        "rating": 4.6,
        "rating_count": 1820,
        "image_url": "https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Processor": "AMD Ryzen 7 7735HS",
            "RAM": "16GB DDR5 4800MHz",
            "Storage": "512GB PCIe 4.0 NVMe M.2 SSD",
            "Display": "15.6' FHD (1920 x 1080) 144Hz IPS",
            "Graphics": "NVIDIA GeForce RTX 4050 6GB",
            "Battery": "90WHrs 4-cell Li-ion",
            "Weight": "2.20 kg",
            "OS": "Windows 11 Home"
        },
        "tags": ["gaming", "laptop", "rtx 4050", "ryzen 7", "high refresh rate", "bestseller"]
    },
    {
        "name": "Apple iPhone 16 128GB",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Smartphones",
        "price": 79900.0,
        "original_price": 89900.0,
        "discount_percent": 11,
        "description": "Featuring Camera Control, 48MP Fusion camera, 2x Telephoto, 5 vibrant colors, and the blazingly fast Apple A18 Bionic chip with Apple Intelligence.",
        "rating": 4.8,
        "rating_count": 3410,
        "image_url": "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Display": "6.1' Super Retina XDR OLED",
            "Processor": "Apple A18 Bionic (3nm)",
            "RAM": "8GB Unified Memory",
            "Storage": "128GB NVMe",
            "Camera": "48MP Fusion + 12MP Ultra Wide",
            "Battery": "3561 mAh All-Day Battery",
            "Weight": "170 grams",
            "OS": "iOS 18"
        },
        "tags": ["smartphone", "apple", "iphone 16", "5g", "flagship", "camera phone", "bestseller"]
    },
    {
        "name": "Samsung Galaxy S25 5G",
        "brand": "Samsung",
        "category": "Electronics",
        "subcategory": "Smartphones",
        "price": 74999.0,
        "original_price": 82999.0,
        "discount_percent": 10,
        "description": "Next-gen Galaxy AI experience with Qualcomm Snapdragon 8 Elite, 50MP triple camera system, Dynamic AMOLED 2X 120Hz display, and Armor Aluminum build.",
        "rating": 4.7,
        "rating_count": 2150,
        "image_url": "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Display": "6.2' Dynamic AMOLED 2X 120Hz",
            "Processor": "Snapdragon 8 Elite / Exynos 2500",
            "RAM": "12GB LPDDR5X",
            "Storage": "256GB UFS 4.0",
            "Camera": "50MP Main + 12MP Ultra-wide + 10MP Telephoto",
            "Battery": "4000 mAh 25W Fast Charging",
            "Weight": "167 grams",
            "OS": "Android 15 One UI 7"
        },
        "tags": ["smartphone", "samsung", "galaxy s25", "ai phone", "flagship", "amoled"]
    },
    {
        "name": "Sony WH-1000XM5 Wireless Headphones",
        "brand": "Sony",
        "category": "Electronics",
        "subcategory": "Headphones",
        "price": 26990.0,
        "original_price": 34990.0,
        "discount_percent": 23,
        "description": "Industry Leading Noise Canceling with 2 processors, 8 microphones, Auto NC Optimizer, and 30 hours of playback with quick charge.",
        "rating": 4.8,
        "rating_count": 4200,
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Type": "Over-Ear Wireless",
            "Noise Cancellation": "Active Noise Canceling (Integrated Processor V1)",
            "Battery Life": "30 Hours (NC On) / 40 Hours (NC Off)",
            "Driver Unit": "30mm Carbon Fiber Composite",
            "Weight": "250 grams",
            "Connectivity": "Bluetooth 5.2, Multipoint, 3.5mm AUX"
        },
        "tags": ["headphones", "sony", "noise canceling", "anc", "wireless", "audiophile", "bestseller"]
    },
    {
        "name": "Apple MacBook Air M3 15-inch",
        "brand": "Apple",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": 134900.0,
        "original_price": 144900.0,
        "discount_percent": 7,
        "description": "Impossibly thin and fast with Apple M3 8-core CPU, 10-core GPU, up to 18 hours of battery life, and gorgeous Liquid Retina display.",
        "rating": 4.9,
        "rating_count": 1420,
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Processor": "Apple M3 Chip 8-Core CPU",
            "RAM": "16GB Unified Memory",
            "Storage": "512GB SSD Storage",
            "Display": "15.3' Liquid Retina Display 500 nits",
            "Battery": "Up to 18 hours battery life",
            "Weight": "1.51 kg",
            "OS": "macOS Sonoma / Sequoia"
        },
        "tags": ["laptop", "apple", "macbook", "m3", "lightweight", "coding", "student", "battery life"]
    },
    {
        "name": "Acer Nitro V Gaming Laptop",
        "brand": "Acer",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": 74990.0,
        "original_price": 89999.0,
        "discount_percent": 17,
        "description": "Intel Core i5 13th Gen, 16GB DDR5 RAM, 512GB SSD, NVIDIA RTX 4050 6GB graphics, 15.6' 144Hz FHD IPS display.",
        "rating": 4.4,
        "rating_count": 940,
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Processor": "Intel Core i5-13420H",
            "RAM": "16GB DDR5",
            "Storage": "512GB NVMe SSD",
            "Display": "15.6' 144Hz FHD IPS",
            "Graphics": "NVIDIA GeForce RTX 4050 6GB",
            "Battery": "57Wh Li-ion",
            "Weight": "2.1 kg"
        },
        "tags": ["gaming", "laptop", "budget gaming", "acer", "rtx 4050"]
    },
    {
        "name": "Lenovo LOQ 15 Gaming Laptop",
        "brand": "Lenovo",
        "category": "Electronics",
        "subcategory": "Laptops",
        "price": 76490.0,
        "original_price": 92990.0,
        "discount_percent": 18,
        "description": "AMD Ryzen 7 7435HS, 16GB DDR5, 512GB SSD, RTX 4050 6GB graphics, 100% sRGB 144Hz display, AI Engine+ cooling.",
        "rating": 4.5,
        "rating_count": 1120,
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Processor": "AMD Ryzen 7 7435HS",
            "RAM": "16GB DDR5 4800MHz",
            "Storage": "512GB SSD",
            "Display": "15.6' FHD 144Hz 100% sRGB",
            "Graphics": "NVIDIA GeForce RTX 4050",
            "Battery": "60Wh with Super Rapid Charge Pro",
            "Weight": "2.38 kg"
        },
        "tags": ["gaming", "laptop", "lenovo", "ryzen 7", "rtx 4050", "students"]
    },
    {
        "name": "Nike Air Force 1 '07",
        "brand": "Nike",
        "category": "Fashion",
        "subcategory": "Men's Shoes",
        "price": 8195.0,
        "original_price": 9695.0,
        "discount_percent": 15,
        "description": "The radiance lives on in the Nike Air Force 1 '07, the b-ball icon that puts a fresh spin on crisp leather, bold colors, and the perfect amount of flash.",
        "rating": 4.8,
        "rating_count": 3200,
        "image_url": "https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Material": "Genuine Leather Upper",
            "Sole": "Non-marking Rubber Sole with Pivot Points",
            "Cushioning": "Encapsulated Nike Air-Sole unit",
            "Closure": "Lace-up",
            "Style": "Low Cut Heritage"
        },
        "tags": ["shoes", "sneakers", "nike", "streetwear", "white sneakers", "bestseller"]
    },
    {
        "name": "boAt Airdopes 141 ANC",
        "brand": "boAt",
        "category": "Electronics",
        "subcategory": "Headphones",
        "price": 1699.0,
        "original_price": 5990.0,
        "discount_percent": 72,
        "description": "True Wireless Earbuds with 32dB Active Noise Cancellation, 42 hours playback, BEAST mode low latency for gaming, and ENx quad mics.",
        "rating": 4.3,
        "rating_count": 8900,
        "image_url": "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=800&auto=format&fit=crop&q=80",
        "specs": {
            "Type": "In-Ear TWS",
            "Playback": "Up to 42 Hours",
            "ANC": "Up to 32dB Active Noise Cancellation",
            "Latency": "50ms BEAST Mode",
            "Water Resistance": "IPX5 Sweat Resistant"
        },
        "tags": ["earbuds", "boat", "anc", "budget", "calling", "students", "under 2000"]
    }
]

# Generators for large-scale 1000+ dataset
ELECTRONICS_TEMPLATES = [
    ("Dell Inspiron 15 {ver}", "Dell", "Laptops", 54990, 68990, ["Intel Core i5 13th Gen", "16GB RAM", "512GB SSD", "15.6' FHD 120Hz"]),
    ("HP Victus Gaming {ver}", "HP", "Laptops", 69990, 84990, ["AMD Ryzen 5 7640HS", "16GB DDR5", "512GB SSD", "RTX 3050 6GB"]),
    ("Lenovo IdeaPad Slim 5 {ver}", "Lenovo", "Laptops", 68990, 82990, ["Intel Core Ultra 5", "16GB LPDDR5X", "1TB SSD", "OLED Display"]),
    ("OnePlus 13 {ver}", "OnePlus", "Smartphones", 64999, 72999, ["Snapdragon 8 Elite", "16GB RAM", "512GB Storage", "50MP Hasselblad"]),
    ("boAt Wave Call Smartwatch {ver}", "boAt", "Smartwatches", 1499, 4999, ["1.83' HD Display", "Bluetooth Calling", "HR & SpO2", "IP68"]),
    ("Noise ColorFit Pro 5 {ver}", "Noise", "Smartwatches", 2799, 6999, ["1.85' AMOLED", "BT Calling", "Rapid Health Monitor", "Always-on Display"]),
    ("Sony Alpha 7 IV {ver}", "Sony", "Cameras", 189990, 219990, ["33MP Full-Frame Exmor R", "4K 60p 10-bit", "BIONZ XR Engine", "Real-time Eye AF"]),
    ("Samsung Galaxy Watch 7 {ver}", "Samsung", "Smartwatches", 28999, 34999, ["Super AMOLED Display", "BioActive Sensor", "Dual GPS", "Wear OS 5"]),
    ("JBL Flip 6 Portable Bluetooth Speaker {ver}", "JBL", "Audio", 8999, 13999, ["2-way Speaker System", "IP67 Waterproof", "12H Playtime", "PartyBoost"]),
    ("Apple iPad Air 11-inch {ver}", "Apple", "Tablets", 59900, 64900, ["Apple M2 Chip", "Liquid Retina Display", "Apple Pencil Pro Support", "128GB Storage"]),
    ("Logitech MX Master 3S Wireless Mouse {ver}", "Logitech", "Accessories", 8495, 10995, ["8K DPI Any-surface Tracking", "Quiet Clicks", "MagSpeed Scroll", "USB-C Fast Charge"]),
    ("SanDisk Extreme Portable SSD 1TB {ver}", "SanDisk", "Storage", 8999, 15999, ["Up to 1050MB/s Read", "USB 3.2 Gen 2", "IP55 Water/Dust Resistant", "Drop Protection"]),
]

FASHION_TEMPLATES = [
    ("Nike Revolution 7 Running Shoes {ver}", "Nike", "Men's Shoes", 3495, 4295, ["Soft Foam Midsole", "Breathable Mesh", "Durable Traction", "Padded Collar"]),
    ("Adidas Ultraboost Light {ver}", "Adidas", "Men's Shoes", 13999, 18999, ["Light BOOST Cushioning", "PRIMEKNIT+ Textile Upper", "Continental Rubber Outsole", "Linear Energy Push"]),
    ("Puma Smash V2 Leather Sneakers {ver}", "Puma", "Men's Shoes", 2499, 4499, ["Soft Leather Upper", "SoftFoam+ Sockliner", "Rubber Cupsole", "Classic Formstrip"]),
    ("Levi's 511 Slim Fit Stretch Jeans {ver}", "Levi's", "Men's Apparel", 2899, 4599, ["99% Cotton 1% Elastane", "Slim Leg Cut", "Zip Fly with Button", "Signature 5-Pocket"]),
    ("Zara Structured Trench Coat {ver}", "Zara", "Women's Apparel", 6990, 9990, ["Water-repellent Fabric", "Double-breasted Lapel", "Adjustable Belt", "Storm Flap"]),
    ("Fossil Grant Chronograph Watch {ver}", "Fossil", "Watches", 8995, 14995, ["Roman Numerals", "Genuine Leather Strap", "50m Water Resistant", "Stainless Steel Case"]),
    ("American Tourister Luggage Trolley 68cm {ver}", "American Tourister", "Luggage", 3899, 8500, ["Scratch Resistant Polypropylene", "360-degree Spinner Wheels", "TSA Number Lock", "Expandable"]),
    ("Ray-Ban Aviator Classic Sunglasses {ver}", "Ray-Ban", "Eyewear", 7990, 10990, ["100% UV400 Protection", "Gold Metal Frame", "G-15 Green Crystal Lenses", "Iconic Teardrop Shape"]),
    ("Woodland Casual Rugged Leather Boots {ver}", "Woodland", "Men's Shoes", 4295, 5995, ["Nubuck Leather", "Deep Cleated Rubber Outsole", "Shock Absorption", "High Durability"]),
    ("H&M Relaxed Fit Heavyweight Hoodie {ver}", "H&M", "Men's Apparel", 1999, 2999, ["100% Organic Cotton Terry", "Kangaroo Pocket", "Double-layered Drawstring Hood", "Ribbed Cuffs"]),
]

BOOKS_TEMPLATES = [
    ("Atomic Habits by James Clear {ver}", "Penguin", "Self-Help", 499, 799, ["Paperback / Hardcover", "Proven framework for improving every day", "320 pages", "English"]),
    ("Designing Data-Intensive Applications {ver}", "O'Reilly", "Tech & AI", 1699, 2499, ["Martin Kleppmann", "Distributed Systems & Storage", "Reliable & Scalable architectures", "616 pages"]),
    ("Psychology of Money by Morgan Housel {ver}", "Jaico", "Finance", 349, 499, ["Timeless lessons on wealth and greed", "Paperback", "256 pages", "Bestseller"]),
    ("Deep Learning with Python 2nd Edition {ver}", "Manning", "Tech & AI", 2899, 3999, ["François Chollet (Creator of Keras)", "Computer Vision & Transformers", "Hands-on PyTorch & TF", "504 pages"]),
    ("System Design Interview – Volume 2 {ver}", "Independently Published", "Tech & AI", 2299, 3299, ["Alex Xu & Sahn Lam", "Distributed systems case studies", "Ad Click Event, S3, Hotel Reservation", "480 pages"]),
    ("Ikigai: The Japanese Secret to a Long and Happy Life {ver}", "Penguin", "Self-Help", 399, 599, ["Hardcover", "Inspiring Longevity & Meaning", "208 pages", "English"]),
    ("Clean Code: Agile Software Craftsmanship {ver}", "Pearson", "Tech & AI", 1899, 2799, ["Robert C. Martin (Uncle Bob)", "Refactoring and testing principles", "464 pages", "English"]),
    ("Rich Dad Poor Dad by Robert Kiyosaki {ver}", "Plata", "Finance", 380, 550, ["Personal finance classic", "Mindset of financial independence", "336 pages", "English"]),
]

HOME_TEMPLATES = [
    ("Philips Air Fryer HD9252 Digital {ver}", "Philips", "Kitchen Appliances", 7999, 12999, ["Rapid Air Technology", "4.1L Capacity", "7 Preset Menus", "Touch Screen Control"]),
    ("Dyson V12 Detect Slim Vacuum Cleaner {ver}", "Dyson", "Home Appliances", 48900, 58900, ["Laser Slim Fluffy cleaner head", "Piezo sensor particle counts", "Up to 60 min runtime", "Hyperdymium Motor"]),
    ("LG 55-inch 4K OLED Smart TV {ver}", "LG", "Television", 99990, 149990, ["OLED evo Self-lit Pixels", "α9 AI Processor 4K Gen7", "Dolby Vision & Atmos", "120Hz Refresh Rate"]),
    ("Instant Pot Duo 7-in-1 Multi Cooker {ver}", "Instant Pot", "Kitchen Appliances", 6499, 9999, ["Pressure Cooker & Slow Cooker", "5.7L Stainless Steel Inner Pot", "13 Smart Programs", "1000W"]),
    ("Mi Smart Air Purifier 4 {ver}", "Xiaomi", "Home Appliances", 12999, 16999, ["True HEPA Filter", "CADR 400m³/h", "OLED Touch Display", "Negative Ion Generator"]),
    ("Bosch 8kg Front Load Washing Machine {ver}", "Bosch", "Appliances", 36990, 48990, ["EcoSilence Drive Motor", "Anti-Vibration Design", "1400 RPM Spin Speed", "ActiveWater Plus"]),
    ("Prestige Iris 750W Mixer Grinder {ver}", "Prestige", "Kitchen Appliances", 2999, 4995, ["3 Stainless Steel Jars + 1 Juicer Jar", "750 Watt Heavy Duty Motor", "Ergonomic Handles", "Safety Lock"]),
]

SPORTS_TEMPLATES = [
    ("Decathlon Domyos Hex Dumbbells Pair {ver}", "Decathlon", "Fitness", 1899, 2999, ["Durable Rubber Coating", "Ergonomic Knurled Chrome Handle", "Anti-roll Hexagonal Shape", "Commercial Grade"]),
    ("Yonex Nanoray 18i Graphite Badminton Racket {ver}", "Yonex", "Racquet Sports", 1999, 3490, ["Full Carbon Graphite", "Ultra Lightweight 77g", "Tension up to 30 lbs", "Head-Light Balance"]),
    ("Strauss Anti-Skid Yoga Mat 6mm {ver}", "Strauss", "Yoga & Pilates", 799, 1499, ["Eco-friendly TPE Material", "Non-slip Textured Surface", "Carrying Strap Included", "Water & Sweat Proof"]),
    ("Nivia Storm Football Size 5 {ver}", "Nivia", "Team Sports", 699, 999, ["32 Panel Construction", "Rubberized Molded Exterior", "Butyl Bladder Air Retention", "All-Weather Play"]),
    ("PowerMax Fitness Motorized Treadmill {ver}", "PowerMax", "Cardio Equipment", 24990, 39990, ["2.0 HP Peak DC Motor", "12 Preset Programs", "Anti-bacterial Diamond Grass Texture Deck", "Manual Incline"]),
    ("Spalding NBA Highlight Basketball {ver}", "Spalding", "Team Sports", 1299, 1999, ["Durable Outdoor Rubber", "Deep Channel Design", "Full Ball Peppling", "Official Size 7"]),
]

def seed_database(db: Session):
    # Check if already seeded with >= 1000 products
    count = db.query(Product).count()
    if count >= 1000:
        print(f"Database already has {count} products. Skipping generation.")
        return

    print("Generating comprehensive dataset of 1,000+ realistic products...")

    # 1. Create or ensure Demo Users
    admin_user = db.query(User).filter(User.email == "admin@shopsmart.ai").first()
    if not admin_user:
        admin_user = User(
            name="Admin ShopSmart",
            email="admin@shopsmart.ai",
            password=get_password_hash("admin123"),
            role="admin",
            preferences=json.dumps({"favorite_brands": ["Apple", "Sony", "Nike"], "dark_mode": True, "currency": "INR"})
        )
        db.add(admin_user)

    demo_user = db.query(User).filter(User.email == "sammya@shopsmart.ai").first()
    if not demo_user:
        demo_user = User(
            name="Sammya Kar Gupta",
            email="sammya@shopsmart.ai",
            password=get_password_hash("password123"),
            role="user",
            preferences=json.dumps({
                "favorite_brands": ["Apple", "Sony", "ASUS", "Nike"],
                "budget_range": {"min": 1000, "max": 100000},
                "categories": ["Electronics", "Fashion"],
                "dark_mode": False,
                "currency": "INR"
            })
        )
        db.add(demo_user)
    db.commit()
    db.refresh(demo_user)

    # 2. Add Featured Products
    created_products = []
    for fp in FEATURED_PRODUCTS:
        prod = Product(
            name=fp["name"],
            brand=fp["brand"],
            category=fp["category"],
            subcategory=fp["subcategory"],
            price=fp["price"],
            original_price=fp["original_price"],
            discount_percent=fp["discount_percent"],
            description=fp["description"],
            rating=fp["rating"],
            rating_count=fp["rating_count"],
            image_url=fp["image_url"],
            additional_images=json.dumps([fp["image_url"]]),
            specs=json.dumps(fp["specs"]),
            tags=json.dumps(fp["tags"]),
            in_stock=True
        )
        db.add(prod)
        created_products.append(prod)

    db.commit()

    # 3. Generate remaining products to reach >= 1,050
    category_generators = [
        ("Electronics", ELECTRONICS_TEMPLATES, 280),
        ("Fashion", FASHION_TEMPLATES, 280),
        ("Books", BOOKS_TEMPLATES, 200),
        ("Home Appliances", HOME_TEMPLATES, 200),
        ("Sports Equipment", SPORTS_TEMPLATES, 160),
    ]

    for cat_name, templates, target_count in category_generators:
        images_pool = IMAGE_COLLECTIONS.get(cat_name, IMAGE_COLLECTIONS["Electronics"])
        for i in range(target_count):
            tpl = random.choice(templates)
            template_name, brand, subcategory, base_price, base_orig_price, spec_hints = tpl
            
            variant_num = i + 1
            edition_names = ["Pro", "Plus", "Max", "Ultra", "Slim", "Lite", "Edition", "2026 Edition", "Classic", "Series X", "Special Edition"]
            variant_suffix = f"{random.choice(edition_names)} (Gen {random.randint(2, 6)})"
            
            p_name = template_name.format(ver=variant_suffix)
            price_variation = random.uniform(0.85, 1.35)
            price = round((base_price * price_variation) / 10) * 10
            orig_price = round(price * random.uniform(1.12, 1.45) / 10) * 10
            disc = int(round((orig_price - price) / orig_price * 100))
            rating = round(random.uniform(3.9, 4.9), 1)
            rating_cnt = random.randint(120, 4800)
            img = random.choice(images_pool)

            specs_dict = {
                "Brand": brand,
                "Category": cat_name,
                "Subcategory": subcategory,
                "Warranty": f"{random.choice([1, 2, 3])} Year Manufacturer Warranty",
                "Key Features": ", ".join(spec_hints)
            }
            if cat_name == "Electronics":
                specs_dict["Color"] = random.choice(["Midnight Black", "Space Gray", "Silver", "Alpine Blue"])
                specs_dict["Connectivity"] = random.choice(["Wi-Fi 6E, Bluetooth 5.3", "5G, Wi-Fi 7", "USB-C Fast Sync"])
            elif cat_name == "Fashion":
                specs_dict["Size"] = random.choice(["S, M, L, XL", "UK 7, 8, 9, 10", "Adjustable / Free Size"])
                specs_dict["Material"] = random.choice(["100% Breathable Cotton", "Premium Leather", "Engineered Mesh"])

            tags_list = [cat_name.lower(), subcategory.lower(), brand.lower()]
            if rating >= 4.5:
                tags_list.append("top-rated")
            if disc >= 20:
                tags_list.append("huge-discount")
            if price < 3000:
                tags_list.append("budget-friendly")

            p = Product(
                name=p_name,
                brand=brand,
                category=cat_name,
                subcategory=subcategory,
                price=float(price),
                original_price=float(orig_price),
                discount_percent=disc,
                description=f"Authentic {p_name} by {brand}. Engineered for exceptional daily performance, premium materials, and verified customer reliability.",
                rating=rating,
                rating_count=rating_cnt,
                image_url=img,
                additional_images=json.dumps([img]),
                specs=json.dumps(specs_dict),
                tags=json.dumps(tags_list),
                in_stock=True
            )
            db.add(p)
            created_products.append(p)

    db.commit()

    # Re-fetch all products to get IDs
    all_prods = db.query(Product).all()
    print(f"Successfully seeded {len(all_prods)} total products!")

    # 4. Generate 6-Month Price History for all products
    months = ["Oct 2025", "Nov 2025", "Dec 2025", "Jan 2026", "Feb 2026", "Mar 2026"]
    price_histories = []
    
    for p in all_prods:
        curr_price = p.price
        # Historical price dips / rises around the current price
        variations = [
            round(curr_price * 1.15),
            round(curr_price * 1.08),
            round(curr_price * 0.95), # festive sale drop
            round(curr_price * 1.04),
            round(curr_price * 1.02),
            round(curr_price)
        ]
        for m_idx, m_name in enumerate(months):
            price_histories.append(
                PriceHistory(
                    product_id=p.id,
                    date=m_name,
                    price=float(variations[m_idx])
                )
            )

    db.bulk_save_objects(price_histories)
    db.commit()

    # 5. Generate Customer Reviews with Sentiment
    reviews_batch = []
    positive_comments = [
        "Absolutely worth every rupee! Outstanding performance and build quality.",
        "Delivered earlier than promised. The display and battery life are remarkable.",
        "Exceeded all my expectations. Smooth experience, highly recommended for everyone!",
        "Super comfortable, elegant design, and premium packaging.",
        "Great value for money. Doesn't feel cheap at all, works flawlessly."
    ]
    neutral_comments = [
        "Decent product for the price. Works fine, but packaging was a bit damaged.",
        "Good daily performer. Nothing extraordinary, but gets the job done reliably.",
        "Average battery life under heavy multitasking, otherwise quite decent."
    ]
    negative_comments = [
        "A bit heavier than expected and the instruction booklet is too sparse.",
        "Sound level could be higher, and it gets warm during prolonged charging."
    ]

    sample_names = ["Rahul Sharma", "Priya Patel", "Vikram Sen", "Sneha Roy", "Arjun Mehta", "Ananya Das", "Rohit Verma", "Kavita Nair"]

    for p in all_prods[:150]:  # Detailed reviews on top 150 products
        num_revs = random.randint(3, 6)
        for _ in range(num_revs):
            r_type = random.choices(["pos", "neu", "neg"], weights=[0.75, 0.15, 0.10])[0]
            if r_type == "pos":
                text = random.choice(positive_comments)
                score = round(random.uniform(0.6, 0.95), 2)
                label = "positive"
                rev_rating = random.choice([4.5, 5.0])
            elif r_type == "neu":
                text = random.choice(neutral_comments)
                score = round(random.uniform(-0.1, 0.2), 2)
                label = "neutral"
                rev_rating = random.choice([3.0, 3.5])
            else:
                text = random.choice(negative_comments)
                score = round(random.uniform(-0.7, -0.3), 2)
                label = "negative"
                rev_rating = random.choice([1.5, 2.0, 2.5])

            reviews_batch.append(
                Review(
                    product_id=p.id,
                    user_name=random.choice(sample_names),
                    rating=rev_rating,
                    review_text=text,
                    sentiment_score=score,
                    sentiment_label=label,
                    created_at=datetime.utcnow() - timedelta(days=random.randint(1, 90))
                )
            )

    db.bulk_save_objects(reviews_batch)
    db.commit()

    # 6. Seed demo user wishlist matching the mockup screenshot
    demo_user = db.query(User).filter(User.email == "sammya@shopsmart.ai").first()
    if demo_user:
        wishlist_sample_names = ["Sony WH-1000XM5", "Nike Air Force 1", "MacBook Air M3", "Samsung Galaxy S25", "boAt Airdopes 141"]
        for w_name in wishlist_sample_names:
            matched = db.query(Product).filter(Product.name.ilike(f"%{w_name}%")).first()
            if matched:
                db.add(Wishlist(
                    user_id=demo_user.id,
                    product_id=matched.id,
                    target_price=round(matched.price * 0.9),
                    alert_enabled=True
                ))

        # Seed recent searches matching mockup
        recent_queries = [
            "gaming laptop under 80000",
            "iPhone 16 vs Samsung S26",
            "best headphones for coding",
            "gifts under 2000"
        ]
        for q in recent_queries:
            db.add(SearchHistory(
                user_id=demo_user.id,
                query=q,
                timestamp=datetime.utcnow() - timedelta(hours=random.randint(1, 48))
            ))

        # Seed sample completed orders for user stats
        for ord_prod in all_prods[:3]:
            db.add(Order(
                user_id=demo_user.id,
                product_id=ord_prod.id,
                amount=ord_prod.price,
                status="Delivered",
                date=datetime.utcnow() - timedelta(days=random.randint(5, 30))
            ))

        db.commit()

    print("Database seeding completed with rich metadata, price history, reviews, and demo content!")

if __name__ == "__main__":
    from app.database import SessionLocal, engine, Base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    seed_database(db)
    db.close()
