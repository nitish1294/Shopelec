"""Product catalogue seeded into MongoDB on first run."""

def _slug(name: str) -> str:
    return name.lower().replace(" ", "-").replace("\"", "").replace("/", "-")

_RAW = [
    ("Acer Aspire 5", "Laptops", 48990, 56990, 4.4, "Core i5 · 16GB · 512GB SSD", 12, None, False),
    ("HP Pavilion 15", "Laptops", 62990, 71990, 4.6, "Core i7 · 16GB · 1TB SSD", 8, None, True),
    ("Apple MacBook Air M3", "Laptops", 114900, 119900, 4.9, "M3 · 8GB · 256GB", 5, None, True),
    ("Lenovo IdeaPad Slim 3", "Laptops", 39990, 47990, 4.2, "Ryzen 5 · 8GB · 512GB SSD", 20, None, False),
    ("Dell OptiPlex Desktop", "Desktops", 54990, 62990, 4.5, "Core i5 · 16GB · 512GB SSD", 10, None, False),
    ("HP Pro Tower G9", "Desktops", 71990, 82990, 4.7, "Core i7 · 16GB · 1TB SSD", 6, None, True),
    ("Custom Gaming Rig", "Desktops", 98990, 112990, 4.8, "Ryzen 7 · RTX 4060 · 32GB", 4, None, True),
    ("Refurb Dell Latitude 5410", "Refurbished", 27990, 44990, 4.3, "Core i5 · 16GB · 512GB · 6-mo warranty", 7, None, False),
    ("Refurb HP EliteDesk 800 G5", "Refurbished", 22990, 38990, 4.4, "Core i5 · 8GB · 256GB · 6-mo warranty", 9, None, True),
    ("Refurb Lenovo ThinkPad T490", "Refurbished", 31990, 52990, 4.6, "Core i7 · 16GB · 512GB · 6-mo warranty", 5, None, True),
    ("HP LaserJet M111w", "Printers", 12990, 15490, 4.3, "Mono Laser · Wi-Fi", 15, None, False),
    ("Canon PIXMA G3770", "Printers", 16490, 19990, 4.5, "Ink Tank · Colour · Wi-Fi", 9, None, True),
    ("Logitech MX Master 3S", "Accessories", 8995, 10995, 4.8, "Wireless Mouse", 30, None, False),
    ("Fingers Elegant Wireless Combo", "Accessories", 1299, 1999, 4.2, "Keyboard + Mouse", 45, "Fingers", True),
    ("Fingers Turbo-2 Speakers", "Accessories", 1099, 1699, 4.1, "2.0 USB Speakers", 38, "Fingers", True),
    ("Fingers HD Webcam", "Accessories", 999, 1499, 4.0, "1080p · Built-in Mic", 26, "Fingers", False),
    ("Samsung 1TB NVMe SSD", "Accessories", 6490, 7990, 4.7, "980 · Gen3", 40, None, False),
    ("boAt Rockerz 450", "Accessories", 1499, 3990, 4.4, "Bluetooth Headphones", 50, "boAt", True),
    ("boAt Airdopes 141", "Accessories", 1299, 4490, 4.3, "TWS Earbuds · 42H", 60, "boAt", True),
    ("boAt Bassheads 100", "Accessories", 399, 999, 4.2, "Wired Earphones", 80, "boAt", False),
    ("Dell 24-inch Monitor", "Accessories", 11990, 14490, 4.5, "IPS · 75Hz · FHD", 14, None, False),
]

PRODUCTS = [
    {
        "id": i + 1,
        "slug": _slug(r[0]),
        "name": r[0], "cat": r[1], "price": r[2], "mrp": r[3],
        "rating": r[4], "tag": r[5], "stock": r[6], "brand": r[7], "is_new": r[8],
    }
    for i, r in enumerate(_RAW)
]
