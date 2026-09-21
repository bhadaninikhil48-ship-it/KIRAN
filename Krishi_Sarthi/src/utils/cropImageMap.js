/**
 * KIRAN Central Crop Image Registry & Normalization Engine
 * 
 * CORE DESIGN PURPOSE:
 * Serves as a PRIMARY CROP-RECOGNITION / ACCESSIBILITY FEATURE for farmers with limited literacy.
 * Every crop resolves to a clean, natural agricultural photograph so that the farmer
 * can identify the produce visually (e.g. "Ye aaloo hai") without needing to read text.
 * 
 * ONE SOURCE OF TRUTH across Farmer, Buyer, FPO, and Market Intelligence.
 */

// Comprehensive alias dictionary mapping regional transliterations and localized variants to standard names
const REGIONAL_ALIASES = {
  "lasun": "Garlic",
  "lahsun": "Garlic",
  "garlic dry": "Garlic",
  "dry garlic": "Garlic",
  "kheera": "Cucumber",
  "cucumber(kheera)": "Cucumber",
  "cucumber (kheera)": "Cucumber",
  "aloo": "Potato",
  "tamatar": "Tomato",
  "bhindi": "Okra",
  "bhindi (ladies finger)": "Okra",
  "ladies finger": "Okra",
  "lady finger": "Okra",
  "chana": "Gram",
  "gram dal": "Gram",
  "kabuli chana": "Gram",
  "chickpea": "Gram",
  "arhar": "Tur",
  "pigeon pea": "Tur",
  "pigeon pea whole": "Tur",
  "mung": "Moong",
  "green gram": "Moong",
  "green gram whole": "Moong",
  "urad": "Urad",
  "black gram": "Urad",
  "black gram whole": "Urad",
  "masoor": "Masoor",
  "lentil": "Masoor",
  "lentil whole": "Masoor",
  "makka": "Maize",
  "corn": "Maize",
  "sweet corn": "Maize",
  "baby corn": "Maize",
  "popcorn": "Maize",
  "maize stover": "Maize",
  "maize fodder": "Maize",
  "mungfali": "Groundnut",
  "ground nut": "Groundnut",
  "ground nut seed": "Groundnut",
  "groundnut seed": "Groundnut",
  "peanut": "Groundnut",
  "paddy": "Rice",
  "paddy straw": "Rice",
  "wheat straw": "Wheat",
  "lauki": "Bottle Gourd",
  "ghiya": "Bottle Gourd",
  "bottle gourd": "Bottle Gourd",
  "karela": "Bitter Gourd",
  "bitter gourd": "Bitter Gourd",
  "tori": "Ridge Gourd",
  "ridgeguard": "Ridge Gourd",
  "ridge gourd": "Ridge Gourd",
  "sponge gourd": "Ridge Gourd",
  "jeera": "Cumin",
  "cumin seed": "Cumin",
  "dhania": "Coriander",
  "coriander seed": "Coriander",
  "haldi": "Turmeric",
  "adrak": "Ginger",
  "ginger dry": "Ginger",
  "dry ginger": "Ginger",
  "sarson": "Mustard",
  "rai": "Mustard",
  "mustard seed": "Mustard",
  "rapeseed": "Mustard",
  "canola": "Mustard",
  "til": "Sesame",
  "sesame seed": "Sesame",
  "methi": "Fenugreek",
  "fenugreek seed": "Fenugreek",
  "fenugreek leaves": "Fenugreek",
  "saunf": "Fennel",
  "fennel seed": "Fennel",
  "ajwain seed": "Ajwain",
  "anar": "Pomegranate",
  "kela": "Banana",
  "raw banana": "Banana",
  "aam": "Mango",
  "raw mango": "Mango",
  "seb": "Apple",
  "santara": "Orange",
  "sweet orange": "Orange",
  "mosambi": "Orange",
  "baingan": "Brinjal",
  "eggplant": "Brinjal",
  "pyaz": "Onion",
  "pyaaz": "Onion",
  "onion dry": "Onion",
  "dry onion": "Onion",
  "spring onion": "Onion",
  "matar": "Peas",
  "green peas": "Peas",
  "dried peas": "Peas",
  "field pea": "Peas",
  "peas dry": "Peas",
  "dry peas": "Peas",
  "gajar": "Carrot",
  "patta gobhi": "Cabbage",
  "patta gobi": "Cabbage",
  "phool gobhi": "Cauliflower",
  "phool gobi": "Cauliflower",
  "mirch": "Chilli",
  "hari mirch": "Chilli",
  "lal mirch": "Chilli",
  "red chilli": "Chilli",
  "green chilli": "Chilli",
  "dried chillies": "Chilli",
  "dry chilli": "Chilli",
  "palak": "Spinach",
  "ganna": "Sugarcane",
  "sugarcane tops": "Sugarcane",
  "cane": "Sugarcane",
  "kapas": "Cotton",
  "cotton seed": "Cotton",
  "jowar": "Jowar",
  "sorghum": "Jowar",
  "bajra": "Bajra",
  "pearl millet": "Bajra",
  "ragi": "Ragi",
  "finger millet": "Ragi",
  "khajoor": "Dates",
  "kaju": "Cashew",
  "badam": "Almond",
  "akhrot": "Walnut",
  "suran": "Yam",
  "elephant yam": "Yam",
  "nariyal": "Coconut",
  "copra": "Coconut",
  "coconut copra": "Coconut",
  "dry coconut": "Coconut",
  "soybean seed": "Soybean",
  "sunflower seed": "Sunflower",
  "castor seed": "Castor",
  "linseed": "Linseed",
  "alsi": "Linseed",
  "flaxseed": "Linseed",
  "button mushroom": "Mushroom",
  "papaya raw": "Papaya",
  "green papaya": "Papaya"
};

/**
 * Normalizes raw crop/commodity strings:
 * - Strips bracketed and parenthetical multilingual parts (e.g. "Wheat (गेहूँ)" -> "Wheat")
 * - Trims whitespace and handles case insensitivity
 * - Resolves regional dialect aliases
 */
export function normalizeCropName(rawName) {
  if (!rawName || typeof rawName !== "string") return "Wheat";

  let cleaned = rawName.trim();

  // Strip anything in parentheses e.g. "Rice (चावल)", "Cucumber (Kheera)", "Bhindi (Ladies Finger)"
  cleaned = cleaned.replace(/\s*\([^)]*\)/g, "").trim();

  // Check direct alias in lowercase
  const lower = cleaned.toLowerCase();
  if (REGIONAL_ALIASES[lower]) {
    return REGIONAL_ALIASES[lower];
  }

  // Check sub-phrase aliases if string has special characters or extra tokens
  for (const [alias, target] of Object.entries(REGIONAL_ALIASES)) {
    if (lower === alias || lower.startsWith(alias + " ") || lower.endsWith(" " + alias)) {
      return target;
    }
  }

  // Capitalize words for clean canonical matching
  return cleaned
    .split(" ")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

/**
 * Complete 250+ Crop Registry mapping canonical crop names to natural photography
 */
export const CROP_IMAGE_REGISTRY = {
  "Rice": {
    "url": "https://images.unsplash.com/photo-1686820740687-426a7b9b2043?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "alt": "Natural fresh Rice produce",
    "category": "Cereals",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Wheat": {
    "url": "https://media.istockphoto.com/id/1695187675/photo/wheat-seeds-image-with-selective-focus.jpg?s=2048x2048&w=is&k=20&c=yy1Eu3BEPcogcsw3j8tghtYbV3i5JjqNo6DLfa9wlj8=",
    "alt": "Natural fresh Wheat produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Potato": {
    "url": "https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Potato produce",
    "category": "Vegetables",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd54"
  },
  "Onion": {
    "url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Onion produce",
    "category": "Vegetables",
    "color": "purple",
    "fallbackEmoji": "\ud83e\uddc5"
  },
  "Tomato": {
    "url": "https://images.unsplash.com/photo-1582284540020-8acbe03f4924?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8VG9tYXRvfGVufDB8fDB8fHww",
    "alt": "Natural fresh Tomato produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf45"
  },
  "Soybean": {
    "url": "https://images.unsplash.com/photo-1728931340168-3869028e99e7?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8U295YmVhbnxlbnwwfHwwfHx8MA%3D%3D",
    "alt": "Natural fresh Soybean produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Maize": {
    "url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Maize produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3d"
  },
  "Cotton": {
    "url": "https://images.unsplash.com/photo-1616431101491-554c0932ea40?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8Y290dG9ufGVufDB8fDB8fHww",
    "alt": "Natural fresh Cotton produce",
    "category": "Cash Crops",
    "color": "slate",
    "fallbackEmoji": "\u2601\ufe0f"
  },
  "Sugarcane": {
    "url": "https://images.unsplash.com/photo-1585155113372-6c1808141bf3?q=80&w=1170&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "alt": "Natural fresh Sugarcane produce",
    "category": "Cash Crops",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf8b"
  },
  "Gram": {
    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQjeMeyhaIZIYP7UcEl9BPPRT_4wzxgqoUSvgrkCW1g8r86VqQOpVpl2eEO&s=10",
    "alt": "Natural fresh Gram produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Tur": {
    "url": "https://5.imimg.com/data5/SELLER/Default/2023/1/KG/LG/VI/24751178/red-toor-dal-500x500.jpeg",
    "alt": "Natural fresh Tur produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Jowar": {
    "url": "https://vedicchakki.com/wp-content/uploads/2024/04/sorghum-jowar-millet-seed.jpg",
    "alt": "Natural fresh Jowar produce",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Bajra": {
    "url": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQngyNm0U-vlW5daKRCo5JFvv-kcGApUvCz282I74SolSC5cJROAK3ydQ0&s=10",
    "alt": "Natural fresh Bajra produce",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Groundnut": {
    "url": "https://plus.unsplash.com/premium_photo-1669998296160-fd227fe42efe?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTN8fGdyb3VuZG51dHxlbnwwfHwwfHx8MA%3D%3D",
    "alt": "Natural fresh Groundnut produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd5c"
  },
  "Chilli": {
    "url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chilli produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf36\ufe0f"
  },
  "Banana": {
    "url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Banana produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4c"
  },
  "Garlic": {
    "url": "https://images.unsplash.com/photo-1615477550927-6ec8445fcfe6?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8R2FybGljfGVufDB8fDB8fHww",
    "alt": "Natural fresh Garlic produce",
    "category": "Vegetables",
    "color": "slate",
    "fallbackEmoji": "\ud83e\uddc4"
  },
  "Grapes": {
    "url": "https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Grapes produce",
    "category": "Fruits",
    "color": "purple",
    "fallbackEmoji": "\ud83c\udf47"
  },
  "Pomegranate": {
    "url": "https://images.unsplash.com/photo-1676635134874-6a94b6a73a36?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjR8fFBvbWVncmFuYXRlfGVufDB8fDB8fHww",
    "alt": "Natural fresh Pomegranate produce",
    "category": "Fruits",
    "color": "red",
    "fallbackEmoji": "\ud83e\uded0"
  },
  "Peas": {
    "url": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Peas produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udedb"
  },
  "Cabbage": {
    "url": "https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cabbage produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd6c"
  },
  "Cauliflower": {
    "url": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cauliflower produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Carrot": {
    "url": "https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Carrot produce",
    "category": "Vegetables",
    "color": "orange",
    "fallbackEmoji": "\ud83e\udd55"
  },
  "Okra": {
    "url": "https://images.unsplash.com/photo-1425543103986-22abb7d7e8d2?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Okra produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Brinjal": {
    "url": "https://images.unsplash.com/photo-1605197378540-10ebaf6999e5?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mnx8QnJpbmphbHxlbnwwfHwwfHx8MA%3D%3D",
    "alt": "Natural fresh Brinjal produce",
    "category": "Vegetables",
    "color": "purple",
    "fallbackEmoji": "\ud83c\udf46"
  },
  "Cucumber": {
    "url": "https://media.istockphoto.com/id/2153260094/photo/fresh-green-cucumbers-for-sale-at-the-market-cucumbers-background.webp?a=1&b=1&s=612x612&w=0&k=20&c=DM_FhOdUsC_1rXWSVX5oNQ0pTsb_zmddyXM3wPSlEic=",
    "alt": "Natural fresh Cucumber produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd52"
  },
  "Pumpkin": {
    "url": "https://images.unsplash.com/photo-1506917728037-b6fb01c42857?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pumpkin produce",
    "category": "Vegetables",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf83"
  },
  "Bitter Gourd": {
    "url": "https://images.unsplash.com/photo-1766714534617-b3cffc7f9085?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8Qml0dGVyJTIwZ291cmR8ZW58MHx8MHx8fDA%3D",
    "alt": "Natural fresh Bitter Gourd produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd52"
  },
  "Bottle Gourd": {
    "url": "https://media.istockphoto.com/id/1194258667/photo/bottle-gourd-for-sale-in-market.webp?a=1&b=1&s=612x612&w=0&k=20&c=fZHiUBNstERZrULCkI9b7cu0hhTKC4iKhYsQ8T72Fvk=",
    "alt": "Natural fresh Bottle Gourd produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd52"
  },
  "Ridge Gourd": {
    "url": "https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ridge Gourd produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd52"
  },
  "Green Chilli": {
    "url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Chilli produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf36\ufe0f"
  },
  "Lady Finger": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lady Finger crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Mango": {
    "url": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mango produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd6d"
  },
  "Papaya": {
    "url": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Papaya produce",
    "category": "Fruits",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf48"
  },
  "Guava": {
    "url": "https://images.unsplash.com/photo-1689996647327-5d263fbbc79d?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8R3VhdmF8ZW58MHx8MHx8fDA%3D",
    "alt": "Natural fresh Guava produce",
    "category": "Fruits",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf48"
  },
  "Apple": {
    "url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Apple produce",
    "category": "Fruits",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Orange": {
    "url": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Orange produce",
    "category": "Fruits",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf4a"
  },
  "Lemon": {
    "url": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lemon produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4b"
  },
  "Pineapple": {
    "url": "https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pineapple produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4d"
  },
  "Watermelon": {
    "url": "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Watermelon produce",
    "category": "Fruits",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf49"
  },
  "Muskmelon": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Muskmelon crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Coconut": {
    "url": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Coconut produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd65"
  },
  "Cashew": {
    "url": "https://images.unsplash.com/photo-1567892328021-e94326eb84b1?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cashew produce",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd5c"
  },
  "Almond": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Almond produce",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Walnut": {
    "url": "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Walnut produce",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Mustard": {
    "url": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mustard produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3c"
  },
  "Sesame": {
    "url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sesame produce",
    "category": "Oilseeds",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Sunflower": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sunflower produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3b"
  },
  "Linseed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Linseed crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Castor": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Castor crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Safflower": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Safflower crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Tobacco": {
    "url": "https://images.unsplash.com/photo-1568584711075-3d021a7c3ca3?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tobacco produce",
    "category": "Cash Crops",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf42"
  },
  "Jute": {
    "url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Jute produce",
    "category": "Cash Crops",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Tea": {
    "url": "https://images.unsplash.com/photo-1576092768241-dec231879fc3?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tea produce",
    "category": "Cash Crops",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf75"
  },
  "Coffee": {
    "url": "https://images.unsplash.com/photo-1559056199-641a0ac8b55e?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Coffee produce",
    "category": "Cash Crops",
    "color": "amber",
    "fallbackEmoji": "\u2615"
  },
  "Rubber": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Rubber crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Coriander": {
    "url": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Coriander produce",
    "category": "Spices",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3f"
  },
  "Cumin": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cumin produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Fennel": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fennel produce",
    "category": "Spices",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Fenugreek": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fenugreek produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Ajwain": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ajwain crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Isabgol": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Isabgol crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Black Pepper": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Black Pepper produce",
    "category": "Spices",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Cardamom": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cardamom produce",
    "category": "Spices",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Turmeric": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Turmeric produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Ginger": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ginger produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Clove": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Clove produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Cinnamon": {
    "url": "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cinnamon produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeb5"
  },
  "Nutmeg": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Nutmeg crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Tamarind": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tamarind crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Drumstick": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Drumstick crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Spinach": {
    "url": "https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Spinach produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd6c"
  },
  "Amaranthus": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Amaranthus crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Mint": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mint crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Curry Leaves": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Curry Leaves crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Fenugreek Leaves": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fenugreek Leaves produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Beetroot": {
    "url": "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Beetroot produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Radish": {
    "url": "https://images.unsplash.com/photo-1593105544559-ecb03bf76f82?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Radish produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Turnip": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Turnip produce",
    "category": "Vegetables",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Sweet Potato": {
    "url": "https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sweet Potato produce",
    "category": "Vegetables",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf60"
  },
  "Yam": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Yam crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Elephant Yam": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Elephant Yam crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Colocasia": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Colocasia crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Tapioca": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tapioca crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Green Peas": {
    "url": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Peas produce",
    "category": "Pulses",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udedb"
  },
  "French Beans": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh French Beans crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Cluster Beans": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cluster Beans crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Broad Beans": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Broad Beans crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Cowpea": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cowpea crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Indian Beans": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Indian Beans crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Chickpea": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chickpea crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Black Gram": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Black Gram produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Green Gram": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Gram produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Lentil": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lentil crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Peanut": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Peanut crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Pigeon Pea": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pigeon Pea crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Horse Gram": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Horse Gram produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Moth Bean": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Moth Bean crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Field Pea": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Field Pea crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Barley": {
    "url": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Barley produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Oats": {
    "url": "https://images.unsplash.com/photo-1584947921503-44eb1c46ca4f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Oats produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Ragi": {
    "url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ragi produce",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Kodo Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kodo Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Little Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Little Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Foxtail Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Foxtail Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Barnyard Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Barnyard Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Proso Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Proso Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Pearl Millet": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pearl Millet crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Finger Millet": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Finger Millet crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Sorghum": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sorghum crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Maize Fodder": {
    "url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Maize Fodder produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3d"
  },
  "Berseem": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Berseem crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Lucerne": {
    "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lucerne crop",
    "category": "Fodder",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3f"
  },
  "Fodder": {
    "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fodder crop",
    "category": "Fodder",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3f"
  },
  "Green Fodder": {
    "url": "https://images.unsplash.com/photo-1500382017468-9049fed747ef?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Fodder crop",
    "category": "Fodder",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3f"
  },
  "Ber": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ber crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Custard Apple": {
    "url": "https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Custard Apple produce",
    "category": "Fruits",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Sapota": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sapota crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Litchi": {
    "url": "https://images.unsplash.com/photo-1577234286642-fc512a5f8f11?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Litchi produce",
    "category": "Fruits",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf52"
  },
  "Jackfruit": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Jackfruit crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Pears": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pears crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Peach": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Peach crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Plum": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Plum crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Apricot": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Apricot crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Papaya Raw": {
    "url": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Papaya Raw produce",
    "category": "Fruits",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf48"
  },
  "Amla": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Amla crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Jamun": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Jamun crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Karonda": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Karonda crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Fig": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fig crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Dates": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dates produce",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf34"
  },
  "Dragon Fruit": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dragon Fruit crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Kiwi": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kiwi crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Strawberry": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Strawberry crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Mosambi": {
    "url": "https://images.unsplash.com/photo-1619566636858-adf3ef46400b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mosambi crop",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4e"
  },
  "Sweet Orange": {
    "url": "https://images.unsplash.com/photo-1611080626919-7cf5a9dbab5b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sweet Orange produce",
    "category": "Fruits",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf4a"
  },
  "Tinda": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tinda crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Chow Chow": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chow Chow crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Ash Gourd": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ash Gourd crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Snake Gourd": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Snake Gourd crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Pointed Gourd": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pointed Gourd crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Ivy Gourd": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ivy Gourd crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Capsicum": {
    "url": "https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Capsicum produce",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\uded1"
  },
  "Green Beans": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Beans crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Broccoli": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Broccoli crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Celery": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Celery crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Leek": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Leek crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Kohlrabi": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kohlrabi crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Knol Khol": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Knol Khol crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Spring Onion": {
    "url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Spring Onion produce",
    "category": "Vegetables",
    "color": "purple",
    "fallbackEmoji": "\ud83e\uddc5"
  },
  "Raw Banana": {
    "url": "https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Raw Banana produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4c"
  },
  "Raw Mango": {
    "url": "https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Raw Mango produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd6d"
  },
  "Green Papaya": {
    "url": "https://images.unsplash.com/photo-1617112848923-cc2234396a8d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Papaya produce",
    "category": "Fruits",
    "color": "orange",
    "fallbackEmoji": "\ud83c\udf48"
  },
  "Mushroom": {
    "url": "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mushroom produce",
    "category": "Vegetables",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf44"
  },
  "Button Mushroom": {
    "url": "https://images.unsplash.com/photo-1504544750208-dc0358e63f7f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Button Mushroom produce",
    "category": "Vegetables",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf44"
  },
  "Dried Peas": {
    "url": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dried Peas produce",
    "category": "Pulses",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udedb"
  },
  "Dried Chillies": {
    "url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dried Chillies produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf36\ufe0f"
  },
  "Dry Ginger": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dry Ginger produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Dry Coconut": {
    "url": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dry Coconut produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd65"
  },
  "Betel Leaves": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Betel Leaves crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Arecanut": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Arecanut crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Betel Nut": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Betel Nut crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Mahua": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mahua crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Neem Seed": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Neem Seed crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Tendu Leaves": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tendu Leaves crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Moringa": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Moringa crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Flaxseed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Flaxseed crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Niger Seed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Niger Seed crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Quinoa": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Quinoa crop",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Chia Seed": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chia Seed crop",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Rajma": {
    "url": "https://images.unsplash.com/photo-1551462147-ff29053bfc14?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Rajma produce",
    "category": "Pulses",
    "color": "red",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Kabuli Chana": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kabuli Chana crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Masoor": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Masoor produce",
    "category": "Pulses",
    "color": "orange",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Urad": {
    "url": "https://images.unsplash.com/photo-1546833999-b9f581a1996d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Urad produce",
    "category": "Pulses",
    "color": "slate",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Moong": {
    "url": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Moong produce",
    "category": "Pulses",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Arhar": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Arhar crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Gram Dal": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Gram Dal produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Mustard Seed": {
    "url": "https://images.unsplash.com/photo-1508615039623-a25605d2b022?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mustard Seed produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3c"
  },
  "Rapeseed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Rapeseed crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Canola": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Canola crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Soybean Seed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Soybean Seed produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Cotton Seed": {
    "url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cotton Seed produce",
    "category": "Cash Crops",
    "color": "slate",
    "fallbackEmoji": "\u2601\ufe0f"
  },
  "Castor Seed": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Castor Seed crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Sunflower Seed": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sunflower Seed produce",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3b"
  },
  "Sesame Seed": {
    "url": "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sesame Seed produce",
    "category": "Oilseeds",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Coriander Seed": {
    "url": "https://images.unsplash.com/photo-1607672632458-9eb56696346b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Coriander Seed produce",
    "category": "Spices",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3f"
  },
  "Cumin Seed": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cumin Seed produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Fennel Seed": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fennel Seed produce",
    "category": "Spices",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Fenugreek Seed": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Fenugreek Seed produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Ajwain Seed": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ajwain Seed crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Poppy Seed": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Poppy Seed crop",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Isabgol Seed": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Isabgol Seed crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Chironji": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chironji crop",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Makhana": {
    "url": "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Makhana produce",
    "category": "Dry Fruits",
    "color": "slate",
    "fallbackEmoji": "\u26aa"
  },
  "Lotus Seed": {
    "url": "https://images.unsplash.com/photo-1508061252224-237ff54ed0a6?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lotus Seed crop",
    "category": "Dry Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf30"
  },
  "Sugar Beet": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sugar Beet crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Sweet Corn": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sweet Corn crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Baby Corn": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Baby Corn crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Popcorn": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Popcorn crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Bamboo": {
    "url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Bamboo crop",
    "category": "Cash Crops",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Hemp": {
    "url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Hemp crop",
    "category": "Cash Crops",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Stevia": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Stevia crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Aloe Vera": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Aloe Vera crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Ashwagandha": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ashwagandha crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Tulsi": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tulsi crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Mentha": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Mentha crop",
    "category": "Medicinal",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Lemongrass": {
    "url": "https://images.unsplash.com/photo-1582979512210-99b6a53386f9?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lemongrass produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf4b"
  },
  "Marigold": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Marigold crop",
    "category": "Flowers",
    "color": "pink",
    "fallbackEmoji": "\ud83c\udf38"
  },
  "Rose": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Rose crop",
    "category": "Flowers",
    "color": "pink",
    "fallbackEmoji": "\ud83c\udf38"
  },
  "Jasmine": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Jasmine crop",
    "category": "Flowers",
    "color": "pink",
    "fallbackEmoji": "\ud83c\udf38"
  },
  "Chrysanthemum": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chrysanthemum crop",
    "category": "Flowers",
    "color": "pink",
    "fallbackEmoji": "\ud83c\udf38"
  },
  "Flowers": {
    "url": "https://images.unsplash.com/photo-1597848212624-a19eb35e2651?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Flowers crop",
    "category": "Flowers",
    "color": "pink",
    "fallbackEmoji": "\ud83c\udf38"
  },
  "Other Vegetables": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Vegetables crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other Fruits": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Fruits crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other Pulses": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Pulses crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other Oilseeds": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Oilseeds crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other Cereals": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Cereals crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other Spices": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other Spices crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Other": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Other crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Kodo": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kodo crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Kutki": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kutki crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Sama": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sama crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Chana": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Chana crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Dill Seed": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Dill Seed crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Methi": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Methi crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Tori": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Tori crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Ridgeguard": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ridgeguard crop",
    "category": "General",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Coconut Copra": {
    "url": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Coconut Copra produce",
    "category": "Fruits",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udd65"
  },
  "Copra": {
    "url": "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Copra crop",
    "category": "Oilseeds",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf31"
  },
  "Paddy": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Paddy crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Paddy Straw": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Paddy Straw crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Wheat Straw": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Wheat Straw produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Maize Stover": {
    "url": "https://images.unsplash.com/photo-1551754655-cd27e38d2076?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Maize Stover produce",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3d"
  },
  "Sugarcane Tops": {
    "url": "https://images.unsplash.com/photo-1589733955941-5eeaf752f6dd?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Sugarcane Tops produce",
    "category": "Cash Crops",
    "color": "emerald",
    "fallbackEmoji": "\ud83c\udf8b"
  },
  "Cane": {
    "url": "https://images.unsplash.com/photo-1606041008023-472dfb5e530f?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cane crop",
    "category": "Cash Crops",
    "color": "slate",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Saffron": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Saffron crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Vanilla": {
    "url": "https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Vanilla crop",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Ginger Dry": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Ginger Dry produce",
    "category": "Spices",
    "color": "amber",
    "fallbackEmoji": "\ud83e\udeda"
  },
  "Garlic Dry": {
    "url": "https://images.unsplash.com/photo-1588615419957-bf66d53c6b49?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Garlic Dry produce",
    "category": "Vegetables",
    "color": "slate",
    "fallbackEmoji": "\ud83e\uddc4"
  },
  "Onion Dry": {
    "url": "https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Onion Dry produce",
    "category": "Vegetables",
    "color": "purple",
    "fallbackEmoji": "\ud83e\uddc5"
  },
  "Red Chilli": {
    "url": "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Red Chilli produce",
    "category": "Vegetables",
    "color": "red",
    "fallbackEmoji": "\ud83c\udf36\ufe0f"
  },
  "Green Gram Whole": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Green Gram Whole produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Black Gram Whole": {
    "url": "https://images.unsplash.com/photo-1515543237350-b3eea1ec8082?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Black Gram Whole produce",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Pigeon Pea Whole": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Pigeon Pea Whole crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Lentil Whole": {
    "url": "https://images.unsplash.com/photo-1585994192701-f1a505c8574a?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Lentil Whole crop",
    "category": "Pulses",
    "color": "amber",
    "fallbackEmoji": "\ud83e\uded8"
  },
  "Peas Dry": {
    "url": "https://images.unsplash.com/photo-1587735243615-c03f25aaff15?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Peas Dry produce",
    "category": "Pulses",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udedb"
  },
  "Corn": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Corn crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Millets": {
    "url": "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Millets crop",
    "category": "Millets",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Cereal": {
    "url": "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Cereal crop",
    "category": "Cereals",
    "color": "amber",
    "fallbackEmoji": "\ud83c\udf3e"
  },
  "Suran": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Suran crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  },
  "Kachri": {
    "url": "https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=80",
    "alt": "Natural fresh Kachri crop",
    "category": "Vegetables",
    "color": "emerald",
    "fallbackEmoji": "\ud83e\udd66"
  }
};

// Fallback photograph when crop is unrecognized
const DEFAULT_CROP_PHOTO = {
  url: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=400&q=80",
  alt: "Agricultural Harvest Produce",
  category: "Grains",
  color: "amber",
  fallbackEmoji: "🌾"
};

/**
 * Resolves any crop or commodity name to its natural photograph and metadata
 */
export function getCropImage(cropName) {
  const normalized = normalizeCropName(cropName);

  if (CROP_IMAGE_REGISTRY[normalized]) {
    return CROP_IMAGE_REGISTRY[normalized];
  }

  // Try direct case-insensitive match across registry keys
  const lowerNorm = normalized.toLowerCase();
  for (const key of Object.keys(CROP_IMAGE_REGISTRY)) {
    if (key.toLowerCase() === lowerNorm) {
      return CROP_IMAGE_REGISTRY[key];
    }
  }

  // Fallback to default natural produce
  return {
    ...DEFAULT_CROP_PHOTO,
    alt: `Natural fresh ${cropName || 'agricultural'} produce`
  };
}

/**
 * Returns produce category for badges and contextual styling
 */
export function getCropCategory(cropName) {
  return getCropImage(cropName).category || "Produce";
}

/**
 * Returns category accent color
 */
export function getCropColor(cropName) {
  return getCropImage(cropName).color || "emerald";
}

/**
 * Returns fallback emoji for emergency offline fallback
 */
export function getCropEmoji(cropName) {
  return getCropImage(cropName).fallbackEmoji || "🌾";
}

export default getCropImage;
