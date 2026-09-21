/**
 * Purely presentational crop-to-image mapping for agricultural commodities.
 * Does NOT modify backend data, API responses, or business logic.
 * Contains high-fidelity vector illustrations and a neutral fallback for unknown / test crops.
 */

// Neutral fallback for "Test", sample crops, or unrecognized commodity names
export const FALLBACK_CROP_IMAGE = `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
  <rect width='100' height='100' rx='22' fill='%23f1f5f9'/>
  <rect x='18' y='36' width='64' height='46' rx='8' fill='%23e2e8f0' stroke='%23cbd5e1' stroke-width='3'/>
  <line x1='18' y1='52' x2='82' y2='52' stroke='%23cbd5e1' stroke-width='2'/>
  <line x1='50' y1='36' x2='50' y2='82' stroke='%23cbd5e1' stroke-width='2'/>
  <path d='M50 34c-6-12 2-18 14-16c2 12-6 16-14 16z' fill='%2310b981'/>
  <path d='M50 34c-2-8-12-10-14-2c10 2 12 10 14 2z' fill='%23059669'/>
  <circle cx='50' cy='62' r='5' fill='%2394a3b8'/>
</svg>`;

// Specific crop vector illustrations (viewBox 0 0 100 100)
const CROP_SVGS = {
  banana: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef9c3'/>
    <!-- Banana Body -->
    <path d='M22 28c8 22 24 46 54 44c-12-8-22-26-26-44c-6-3-18-5-28 0z' fill='%23facc15' stroke='%23eab308' stroke-width='2'/>
    <!-- Inner Curve Highlight -->
    <path d='M30 32c8 16 18 32 40 34c-10-6-16-18-20-32z' fill='%23fde047'/>
    <!-- Stem Tip -->
    <path d='M22 28l-5-5c1-2 4-2 6 0l2 4z' fill='%23713f12'/>
    <!-- Bottom Tip -->
    <circle cx='76' cy='72' r='2.5' fill='%23854d0e'/>
  </svg>`,

  potato: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef3c7'/>
    <!-- Potato Body -->
    <ellipse cx='50' cy='52' rx='34' ry='26' transform='rotate(-12 50 52)' fill='%23d97706' stroke='%23b45309' stroke-width='2.5'/>
    <ellipse cx='48' cy='50' rx='30' ry='22' transform='rotate(-12 50 52)' fill='%23f59e0b'/>
    <!-- Eye Spots -->
    <ellipse cx='36' cy='46' rx='3' ry='1.5' fill='%2392400e'/>
    <ellipse cx='58' cy='40' rx='2.5' ry='1.2' fill='%2392400e'/>
    <ellipse cx='64' cy='56' rx='3' ry='1.5' fill='%2392400e'/>
    <ellipse cx='42' cy='62' rx='2' ry='1' fill='%2392400e'/>
  </svg>`,

  carrot: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ffedd5'/>
    <!-- Leaves -->
    <path d='M68 20c-4 8-2 14-8 18c8-2 14-8 16-16z' fill='%2315803d'/>
    <path d='M60 16c0 10 2 16-4 22c6-4 10-12 8-20z' fill='%2322c55e'/>
    <path d='M76 22c-6 6-6 12-12 16c8 0 14-4 18-10z' fill='%2316a34a'/>
    <!-- Carrot Body -->
    <path d='M64 36c6 4 4 10-2 14l-38 34c-4 4-6 2-4-2l28-44c4-4 10-6 16-2z' fill='%23ea580c' stroke='%23c2410c' stroke-width='2'/>
    <path d='M60 38l-22 36c-2 2-3 1-2-1l20-33z' fill='%23f97316'/>
    <!-- Ridges -->
    <path d='M50 48l-8 4' stroke='%239a3412' stroke-width='2' stroke-linecap='round'/>
    <path d='M44 58l-8 4' stroke='%239a3412' stroke-width='2' stroke-linecap='round'/>
    <path d='M36 68l-6 3' stroke='%239a3412' stroke-width='2' stroke-linecap='round'/>
  </svg>`,

  garlic: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f3f4f6'/>
    <!-- Garlic Bulb -->
    <path d='M50 20c-3 8-6 16-16 22c-12 7-14 22-6 30c8 8 26 8 36 2c12-7 12-22 2-30c-10-8-13-16-16-24z' fill='%23ffffff' stroke='%23e5e7eb' stroke-width='2'/>
    <!-- Cloves Definition -->
    <path d='M50 24c-2 12-8 24-10 38c-1 8 4 14 10 14c6 0 11-6 10-14c-2-14-8-26-10-38z' fill='%23f9fafb' stroke='%23e2e8f0' stroke-width='1.5'/>
    <path d='M36 50c4 10 6 18 14 24' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' fill='none'/>
    <path d='M64 50c-4 10-6 18-14 24' stroke='%23d1d5db' stroke-width='1.5' stroke-linecap='round' fill='none'/>
    <!-- Stem Tip -->
    <path d='M50 16l-2 8h4z' fill='%23a1a1aa'/>
    <!-- Root Fibers -->
    <path d='M44 76l-2 5M50 76v6M56 76l2 5' stroke='%23d4d4d8' stroke-width='2' stroke-linecap='round'/>
  </svg>`,

  tomato: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fee2e2'/>
    <!-- Tomato Body -->
    <circle cx='50' cy='55' r='30' fill='%23dc2626' stroke='%23b91c1c' stroke-width='2'/>
    <!-- Highlight -->
    <ellipse cx='42' cy='44' rx='9' ry='5' transform='rotate(-25 42 44)' fill='%23ef4444'/>
    <circle cx='38' cy='42' r='2' fill='%23fca5a5'/>
    <!-- Calyx & Leaves -->
    <path d='M50 25c0-4 4-7 4-7s0 4 2 6' stroke='%2315803d' stroke-width='3' stroke-linecap='round' fill='none'/>
    <path d='M50 28l-8 2l6-6l-7-5l8 2l2-7l4 7l8-3l-5 6l8 3l-8 3z' fill='%2316a34a'/>
  </svg>`,

  onion: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fae8ff'/>
    <!-- Onion Body -->
    <path d='M50 20c-5 12-28 24-28 42c0 14 13 22 28 22s28-8 28-22c0-18-23-30-28-42z' fill='%23c026d3' stroke='%23a21caf' stroke-width='2'/>
    <!-- Inner Layers Highlight -->
    <path d='M50 24c-4 12-20 22-20 38c0 10 9 18 20 18s20-8 20-18c0-16-16-26-20-38z' fill='%23d946ef'/>
    <path d='M50 28c-3 10-12 18-12 32c0 8 5 14 12 14s12-6 12-14c0-14-9-22-12-32z' fill='%23e879f9'/>
    <!-- Roots & Shoot -->
    <path d='M50 14v8' stroke='%2316a34a' stroke-width='3' stroke-linecap='round'/>
    <path d='M46 84l-2 4M50 84v5M54 84l2 4' stroke='%23701a75' stroke-width='2' stroke-linecap='round'/>
  </svg>`,

  apple: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ffe4e6'/>
    <!-- Stem & Leaf -->
    <path d='M50 30c2-10 8-14 12-14' stroke='%2378350f' stroke-width='3' stroke-linecap='round' fill='none'/>
    <path d='M54 22c8-4 14 0 16 6c-8 2-14-2-16-6z' fill='%2322c55e'/>
    <!-- Apple Body -->
    <path d='M50 34c-6-4-16-4-22 2c-10 9-8 30 2 40c6 7 14 8 20 2c6 6 14 5 20-2c10-10 12-31 2-40c-6-6-16-6-22-2z' fill='%23e11d48' stroke='%23be123c' stroke-width='2'/>
    <!-- Highlight -->
    <ellipse cx='38' cy='46' rx='6' ry='12' transform='rotate(-20 38 46)' fill='%23f43f5e'/>
  </svg>`,

  mango: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef3c7'/>
    <!-- Stem & Leaf -->
    <path d='M44 26l-3-8' stroke='%2378350f' stroke-width='3' stroke-linecap='round'/>
    <path d='M45 22c10-6 18-2 20 6c-8 4-16 0-20-6z' fill='%2315803d'/>
    <!-- Mango Body -->
    <path d='M44 26c14-4 32 4 34 22c2 18-8 32-22 36c-18 5-30-10-32-24c-2-14 8-30 20-34z' fill='%23f59e0b' stroke='%23d97706' stroke-width='2'/>
    <!-- Red/Orange Blush -->
    <path d='M48 28c12-2 24 6 26 18c2 12-4 22-14 26c-10 4-18-4-20-14c-2-12 4-26 8-30z' fill='%23fbbf24'/>
    <path d='M62 34c6 6 6 16 0 22' stroke='%23ea580c' stroke-width='3' stroke-linecap='round' fill='none'/>
  </svg>`,

  wheat: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef9c3'/>
    <!-- Central Stalk -->
    <path d='M50 82V20' stroke='%23ca8a04' stroke-width='2.5' stroke-linecap='round'/>
    <!-- Wheat Grains -->
    <ellipse cx='42' cy='28' rx='6' ry='3.5' transform='rotate(-30 42 28)' fill='%23eab308' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='58' cy='28' rx='6' ry='3.5' transform='rotate(30 58 28)' fill='%23eab308' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='42' cy='38' rx='7' ry='4' transform='rotate(-30 42 38)' fill='%23facc15' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='58' cy='38' rx='7' ry='4' transform='rotate(30 58 38)' fill='%23facc15' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='42' cy='48' rx='7' ry='4' transform='rotate(-30 42 48)' fill='%23facc15' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='58' cy='48' rx='7' ry='4' transform='rotate(30 58 48)' fill='%23facc15' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='43' cy='58' rx='6' ry='3.5' transform='rotate(-30 43 58)' fill='%23eab308' stroke='%23a16207' stroke-width='1.5'/>
    <ellipse cx='57' cy='58' rx='6' ry='3.5' transform='rotate(30 57 58)' fill='%23eab308' stroke='%23a16207' stroke-width='1.5'/>
    <!-- Whisker Awns -->
    <path d='M38 24l-8-10M62 24l8-10M50 20v-8' stroke='%23ca8a04' stroke-width='1.5' stroke-linecap='round'/>
  </svg>`,

  rice: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f0fdf4'/>
    <!-- Arching Stalk -->
    <path d='M34 82c2-26 14-46 38-54' stroke='%2316a34a' stroke-width='2.5' stroke-linecap='round' fill='none'/>
    <!-- Rice Panicles -->
    <ellipse cx='54' cy='38' rx='5' ry='2.5' transform='rotate(25 54 38)' fill='%23ca8a04'/>
    <ellipse cx='62' cy='34' rx='5' ry='2.5' transform='rotate(15 62 34)' fill='%23eab308'/>
    <ellipse cx='70' cy='32' rx='5' ry='2.5' transform='rotate(5 70 32)' fill='%23facc15'/>
    <ellipse cx='60' cy='46' rx='5' ry='2.5' transform='rotate(35 60 46)' fill='%23ca8a04'/>
    <ellipse cx='68' cy='44' rx='5' ry='2.5' transform='rotate(25 68 44)' fill='%23eab308'/>
    <ellipse cx='48' cy='50' rx='5' ry='2.5' transform='rotate(45 48 50)' fill='%23ca8a04'/>
    <ellipse cx='54' cy='58' rx='5' ry='2.5' transform='rotate(55 54 58)' fill='%23ca8a04'/>
  </svg>`,

  soybean: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ecfdf5'/>
    <!-- Pod Shell -->
    <path d='M24 64c12 12 36 12 52-8c-10-2-22 4-34-2c-12-6-16-16-24-14c-4 6-2 18 6 24z' fill='%2315803d' stroke='%23166534' stroke-width='2'/>
    <!-- Pod Interior Highlights -->
    <ellipse cx='38' cy='56' rx='7' ry='6' fill='%2386efac' stroke='%2322c55e' stroke-width='1.5'/>
    <ellipse cx='52' cy='52' rx='7' ry='6' fill='%2386efac' stroke='%2322c55e' stroke-width='1.5'/>
    <ellipse cx='66' cy='46' rx='7' ry='6' fill='%2386efac' stroke='%2322c55e' stroke-width='1.5'/>
  </svg>`,

  chilli: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fee2e2'/>
    <!-- Cap & Stem -->
    <path d='M64 24c0-6 4-8 4-8s-6 2-7 6' stroke='%2315803d' stroke-width='2.5' stroke-linecap='round' fill='none'/>
    <path d='M58 26l8 4l-4 6l-8-3z' fill='%2316a34a'/>
    <!-- Red Chilli Body -->
    <path d='M62 32c-6 12-14 26-22 34c-6 6-12 12-18 10c-2-2 2-8 6-12c8-10 18-24 24-32l10 0z' fill='%23dc2626' stroke='%23b91c1c' stroke-width='2'/>
    <path d='M56 36c-6 10-12 22-18 28' stroke='%23ef4444' stroke-width='2' stroke-linecap='round' fill='none'/>
  </svg>`,

  maize: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef9c3'/>
    <!-- Corn Cob -->
    <ellipse cx='50' cy='46' rx='16' ry='28' fill='%23facc15' stroke='%23ca8a04' stroke-width='2'/>
    <!-- Husk Leaves -->
    <path d='M34 68c4-12 8-24 6-36c-8 14-8 30-2 42z' fill='%2315803d'/>
    <path d='M66 68c-4-12-8-24-6-36c8 14 8 30 2 42z' fill='%2316a34a'/>
    <!-- Kernel Dots Grid -->
    <circle cx='44' cy='36' r='2' fill='%23a16207'/>
    <circle cx='50' cy='36' r='2' fill='%23a16207'/>
    <circle cx='56' cy='36' r='2' fill='%23a16207'/>
    <circle cx='44' cy='46' r='2' fill='%23a16207'/>
    <circle cx='50' cy='46' r='2' fill='%23a16207'/>
    <circle cx='56' cy='46' r='2' fill='%23a16207'/>
    <circle cx='46' cy='56' r='2' fill='%23a16207'/>
    <circle cx='54' cy='56' r='2' fill='%23a16207'/>
  </svg>`,

  grapes: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f3e8ff'/>
    <!-- Vine & Leaf -->
    <path d='M50 20c0-6 4-8 8-8' stroke='%2378350f' stroke-width='2.5' stroke-linecap='round' fill='none'/>
    <path d='M42 22c8-4 12 0 14 4c-6 2-10-1-14-4z' fill='%2315803d'/>
    <!-- Berries Cluster -->
    <circle cx='42' cy='36' r='8' fill='%237c3aed'/>
    <circle cx='58' cy='36' r='8' fill='%236d28d9'/>
    <circle cx='50' cy='32' r='7' fill='%238b5cf6'/>
    <circle cx='36' cy='48' r='8' fill='%236d28d9'/>
    <circle cx='50' cy='46' r='8' fill='%237c3aed'/>
    <circle cx='64' cy='48' r='8' fill='%235b21b6'/>
    <circle cx='42' cy='60' r='7' fill='%236d28d9'/>
    <circle cx='56' cy='60' r='7' fill='%237c3aed'/>
    <circle cx='50' cy='70' r='6' fill='%235b21b6'/>
  </svg>`,

  peas: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ecfdf5'/>
    <!-- Curved Pea Pod -->
    <path d='M20 36c18-8 44-4 60 16c-16 18-42 22-60 8c4-8 4-16 0-24z' fill='%2315803d' stroke='%23166534' stroke-width='2'/>
    <!-- Round Emerald Peas -->
    <circle cx='34' cy='44' r='6.5' fill='%234ade80' stroke='%2316a34a' stroke-width='1.5'/>
    <circle cx='48' cy='45' r='6.5' fill='%234ade80' stroke='%2316a34a' stroke-width='1.5'/>
    <circle cx='62' cy='48' r='6.5' fill='%234ade80' stroke='%2316a34a' stroke-width='1.5'/>
  </svg>`,

  lemon: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef9c3'/>
    <!-- Lemon Body with Nipple Tips -->
    <ellipse cx='50' cy='50' rx='30' ry='22' transform='rotate(-25 50 50)' fill='%23fde047' stroke='%23ca8a04' stroke-width='2'/>
    <path d='M22 36l-4-3l2 5zM78 64l4 3l-2-5z' fill='%23ca8a04'/>
    <!-- Leaf -->
    <path d='M44 26c6-8 14-6 16-2c-6 4-12 4-16 2z' fill='%2315803d'/>
  </svg>`,

  orange: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ffedd5'/>
    <!-- Stem & Leaf -->
    <circle cx='50' cy='32' r='2.5' fill='%2378350f'/>
    <path d='M50 32c4-10 14-8 16-4c-6 4-12 2-16 4z' fill='%2315803d'/>
    <!-- Orange Sphere -->
    <circle cx='50' cy='55' r='28' fill='%23f97316' stroke='%23c2410c' stroke-width='2'/>
    <ellipse cx='42' cy='46' rx='8' ry='5' transform='rotate(-25 42 46)' fill='%23fb923c'/>
  </svg>`,

  cabbage: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f0fdf4'/>
    <!-- Base Ruffled Ball -->
    <circle cx='50' cy='52' r='28' fill='%2322c55e' stroke='%2315803d' stroke-width='2'/>
    <!-- Curled Leaves -->
    <path d='M30 40c8-10 24-8 30 2c-10 8-22 6-30-2z' fill='%2386efac'/>
    <path d='M68 44c4 14-6 24-18 24c4-10 10-18 18-24z' fill='%234ade80'/>
    <path d='M34 62c12 8 28 6 34-4c-12-2-24 0-34 4z' fill='%2386efac'/>
  </svg>`,

  cauliflower: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f8fafc'/>
    <!-- Outer Green Leaves -->
    <path d='M22 60c4-20 16-30 24-34c-6 16-4 30-24 34z' fill='%2315803d'/>
    <path d='M78 60c-4-20-16-30-24-34c6 16 4 30 24 34z' fill='%2315803d'/>
    <!-- Florets Curd -->
    <circle cx='50' cy='48' r='22' fill='%23f1f5f9' stroke='%23cbd5e1' stroke-width='2'/>
    <circle cx='40' cy='42' r='8' fill='%23ffffff'/>
    <circle cx='60' cy='42' r='8' fill='%23ffffff'/>
    <circle cx='50' cy='56' r='9' fill='%23ffffff'/>
  </svg>`,

  brinjal: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f3e8ff'/>
    <!-- Calyx & Stem -->
    <path d='M50 20v6' stroke='%2315803d' stroke-width='3' stroke-linecap='round'/>
    <path d='M42 26l8 4l8-4l-3 8l-5-2l-5 2z' fill='%2316a34a'/>
    <!-- Eggplant Teardrop -->
    <path d='M50 34c-14 4-22 18-20 30c2 12 12 18 20 18s18-6 20-18c2-12-6-26-20-30z' fill='%23581c87' stroke='%233b0764' stroke-width='2'/>
    <ellipse cx='42' cy='52' rx='4' ry='12' transform='rotate(-15 42 52)' fill='%237e22ce'/>
  </svg>`,

  cucumber: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f0fdf4'/>
    <!-- Curved Cucumber Body -->
    <path d='M24 66c14 16 42 14 56-2c6-7 4-14-2-18c-14-8-40-6-52 6c-4 5-5 10-2 14z' fill='%2315803d' stroke='%23166534' stroke-width='2'/>
    <!-- Spine Lines -->
    <path d='M34 60l2-2M48 58l2-2M62 52l2-2' stroke='%234ade80' stroke-width='2' stroke-linecap='round'/>
  </svg>`,

  pomegranate: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fee2e2'/>
    <!-- Crown -->
    <path d='M44 26l3-6l3 4l3-4l3 6z' fill='%23991b1b'/>
    <!-- Pomegranate Body -->
    <circle cx='50' cy='55' r='28' fill='%23b91c1c' stroke='%237f1d1d' stroke-width='2'/>
    <ellipse cx='42' cy='46' rx='8' ry='5' transform='rotate(-25 42 46)' fill='%23dc2626'/>
  </svg>`,

  watermelon: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23ecfdf5'/>
    <!-- Watermelon Slice -->
    <path d='M20 36c18 42 58 42 60 0z' fill='%23dc2626' stroke='%2315803d' stroke-width='4'/>
    <!-- Green Rind -->
    <path d='M18 36c18 46 62 46 64 0' stroke='%2316a34a' stroke-width='3' stroke-linecap='round' fill='none'/>
    <!-- Seeds -->
    <ellipse cx='38' cy='46' rx='1.5' ry='3' fill='%231f2937'/>
    <ellipse cx='50' cy='54' rx='1.5' ry='3' fill='%231f2937'/>
    <ellipse cx='62' cy='46' rx='1.5' ry='3' fill='%231f2937'/>
  </svg>`,

  cotton: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f8fafc'/>
    <!-- Brown Calyx Base -->
    <path d='M34 64c8 10 24 10 32 0l-16 16z' fill='%2378350f'/>
    <!-- Fluffy Cotton Puffs -->
    <circle cx='40' cy='48' r='14' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='2'/>
    <circle cx='60' cy='48' r='14' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='2'/>
    <circle cx='50' cy='36' r='13' fill='%23ffffff' stroke='%23e2e8f0' stroke-width='2'/>
    <circle cx='50' cy='52' r='12' fill='%23f8fafc'/>
  </svg>`,

  sugarcane: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23f0fdf4'/>
    <!-- Stalk 1 -->
    <rect x='40' y='18' width='8' height='64' rx='3' fill='%2316a34a'/>
    <line x1='39' y1='38' x2='49' y2='38' stroke='%2314532d' stroke-width='2'/>
    <line x1='39' y1='58' x2='49' y2='58' stroke='%2314532d' stroke-width='2'/>
    <!-- Stalk 2 -->
    <rect x='52' y='22' width='8' height='60' rx='3' fill='%2322c55e'/>
    <line x1='51' y1='42' x2='61' y2='42' stroke='%2315803d' stroke-width='2'/>
    <line x1='51' y1='62' x2='61' y2='62' stroke='%2315803d' stroke-width='2'/>
  </svg>`,

  ginger: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef3c7'/>
    <!-- Knobby Rhizome -->
    <path d='M30 46c-6 8-2 18 6 22c10 4 24 2 34-4c8-6 10-18 2-24c-8-4-12-14-22-12c-8 2-12 10-20 18z' fill='%23d97706' stroke='%23b45309' stroke-width='2'/>
    <circle cx='56' cy='36' r='7' fill='%23f59e0b'/>
  </svg>`,

  papaya: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fef3c7'/>
    <!-- Papaya Fruit -->
    <path d='M50 22c-8 6-18 20-16 36c2 16 12 24 16 24s14-8 16-24c2-16-8-30-16-36z' fill='%23f59e0b' stroke='%23d97706' stroke-width='2'/>
    <ellipse cx='50' cy='52' rx='10' ry='18' fill='%23ea580c'/>
    <circle cx='50' cy='46' r='2' fill='%231e293b'/>
    <circle cx='50' cy='54' r='2' fill='%231e293b'/>
  </svg>`,

  litchi: `data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'>
    <rect width='100' height='100' rx='22' fill='%23fee2e2'/>
    <!-- Twig & Leaves -->
    <path d='M50 20c0-6 6-8 10-8' stroke='%2378350f' stroke-width='2.5' stroke-linecap='round' fill='none'/>
    <path d='M42 22c8-4 14 0 16 4c-6 2-12-1-16-4z' fill='%2315803d'/>
    <!-- Bumpy Red Litchi Berry -->
    <circle cx='50' cy='54' r='28' fill='%23dc2626' stroke='%23b91c1c' stroke-width='2'/>
    <!-- Textured bumpy spots -->
    <circle cx='42' cy='42' r='3' fill='%23ef4444'/>
    <circle cx='58' cy='42' r='3' fill='%23ef4444'/>
    <circle cx='50' cy='52' r='3.5' fill='%23ef4444'/>
    <circle cx='38' cy='56' r='3' fill='%23ef4444'/>
    <circle cx='62' cy='56' r='3' fill='%23ef4444'/>
    <circle cx='46' cy='66' r='3' fill='%23ef4444'/>
    <circle cx='56' cy='66' r='3' fill='%23ef4444'/>
  </svg>`,
};

/**
 * Normalizes a commodity name across common English, Hindi, and regional variations.
 * Returns the canonical crop key if recognized, or null for unknown / test crops.
 */
export function getCropImage(cropName) {
  if (!cropName || typeof cropName !== "string") {
    return FALLBACK_CROP_IMAGE;
  }

  const clean = cropName.toLowerCase().trim();

  // Guard: explicitly filter out testing/dummy names so they never get an arbitrary image
  if (
    clean === "test" ||
    clean.startsWith("test ") ||
    clean.endsWith(" test") ||
    clean === "testing" ||
    clean === "sample" ||
    clean === "demo" ||
    clean === "temp"
  ) {
    return FALLBACK_CROP_IMAGE;
  }

  // Exact & partial matching rules
  if (clean.includes("litchi") || clean.includes("lychee") || clean.includes("lichi")) return CROP_SVGS.litchi;
  if (clean.includes("banana") || clean.includes("kela")) return CROP_SVGS.banana;
  if (clean.includes("potato") || clean.includes("aloo") || clean.includes("alu")) return CROP_SVGS.potato;
  if (clean.includes("carrot") || clean.includes("gajar")) return CROP_SVGS.carrot;
  if (clean.includes("garlic") || clean.includes("lasun") || clean.includes("lahsun")) return CROP_SVGS.garlic;
  if (clean.includes("tomato") || clean.includes("tamatar")) return CROP_SVGS.tomato;
  if (clean.includes("onion") || clean.includes("pyaz") || clean.includes("kanda")) return CROP_SVGS.onion;
  if (clean.includes("apple") || clean.includes("seb")) return CROP_SVGS.apple;
  if (clean.includes("mango") || clean.includes("aam")) return CROP_SVGS.mango;
  if (clean.includes("wheat") || clean.includes("gehun") || clean.includes("gehu")) return CROP_SVGS.wheat;
  if (clean.includes("rice") || clean.includes("paddy") || clean.includes("chawal") || clean.includes("dhan")) return CROP_SVGS.rice;
  if (clean.includes("soybean") || clean.includes("soya")) return CROP_SVGS.soybean;
  if (clean.includes("chilli") || clean.includes("chili") || clean.includes("mirch")) return CROP_SVGS.chilli;
  if (clean.includes("corn") || clean.includes("maize") || clean.includes("makka")) return CROP_SVGS.maize;
  if (clean.includes("grape") || clean.includes("angoor")) return CROP_SVGS.grapes;
  if (clean.includes("pea") || clean.includes("matar")) return CROP_SVGS.peas;
  if (clean.includes("lemon") || clean.includes("nimbu")) return CROP_SVGS.lemon;
  if (clean.includes("orange") || clean.includes("santra") || clean.includes("mosambi")) return CROP_SVGS.orange;
  if (clean.includes("cabbage") || clean.includes("pattagobhi")) return CROP_SVGS.cabbage;
  if (clean.includes("cauliflower") || clean.includes("phoolgobhi")) return CROP_SVGS.cauliflower;
  if (clean.includes("brinjal") || clean.includes("eggplant") || clean.includes("baingan")) return CROP_SVGS.brinjal;
  if (clean.includes("cucumber") || clean.includes("kheera")) return CROP_SVGS.cucumber;
  if (clean.includes("pomegranate") || clean.includes("anar")) return CROP_SVGS.pomegranate;
  if (clean.includes("watermelon") || clean.includes("tarbooj")) return CROP_SVGS.watermelon;
  if (clean.includes("cotton") || clean.includes("kapas")) return CROP_SVGS.cotton;
  if (clean.includes("sugarcane") || clean.includes("ganna")) return CROP_SVGS.sugarcane;
  if (clean.includes("ginger") || clean.includes("adrak")) return CROP_SVGS.ginger;
  if (clean.includes("papaya") || clean.includes("papita")) return CROP_SVGS.papaya;

  // Default: unmapped / unrecognized crops receive the neutral fallback
  return FALLBACK_CROP_IMAGE;
}

export default getCropImage;
