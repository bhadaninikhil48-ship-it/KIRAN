import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  MapPin,
  Calendar,
  Package,
  ArrowRight,
  Send,
  Users,
} from "lucide-react";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { Badge } from "../components/ui/Badge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function Buyers() {
  const [buyers, setBuyers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [cropFilter, setCropFilter] = useState("All");
  const [sortBy, setSortBy] = useState("priceDesc");

  // Offer modal states
  const [selectedBuyer, setSelectedBuyer] = useState(null);
  const [offerModalOpen, setOfferModalOpen] = useState(false);
  const [offerQuantity, setOfferQuantity] = useState("");
  const [offerPrice, setOfferPrice] = useState("");
  const [offerMessage, setOfferMessage] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerError, setOfferError] = useState("");
  const [successModalOpen, setSuccessModalOpen] = useState(false);
  const [createdOfferData, setCreatedOfferData] = useState(null);

  const containerRef = useRef(null);

  // Fetch real open buyer requirements
  const fetchBuyerRequirements = async () => {
    try {
      setLoading(true);
      const data = await api.get("/api/buyer/requirements/open");
      setBuyers(data?.requirements || []);
    } catch (err) {
      console.error("Failed to load buyer requirements:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBuyerRequirements();
  }, []);

  useEffect(() => {
    if (containerRef.current && !loading) {
      animateStagger(containerRef.current.querySelectorAll(".buyer-card-anim"), {
        delay: 0.05,
      });
    }
  }, [loading, searchQuery, cropFilter, sortBy]);

  // Common crops first for better UX.
  // All 250 options are hardcoded for now; this can be made API/DB driven later.
  const cropOptions = [
    { value: "Rice", label: "Rice (चावल)" },
    { value: "Wheat", label: "Wheat (गेहूँ)" },
    { value: "Potato", label: "Potato (आलू)" },
    { value: "Onion", label: "Onion (प्याज़)" },
    { value: "Tomato", label: "Tomato (टमाटर)" },
    { value: "Soybean", label: "Soybean (सोयाबीन)" },
    { value: "Maize", label: "Maize (मक्का)" },
    { value: "Cotton", label: "Cotton (कपास)" },
    { value: "Sugarcane", label: "Sugarcane (गन्ना)" },
    { value: "Gram", label: "Gram (चना)" },
    { value: "Tur", label: "Tur (अरहर)" },
    { value: "Jowar", label: "Jowar (ज्वार)" },
    { value: "Bajra", label: "Bajra (बाजरा)" },
    { value: "Groundnut", label: "Groundnut (मूंगफली)" },
    { value: "Chilli", label: "Chilli (मिर्च)" },
    { value: "Banana", label: "Banana (केला)" },
    { value: "Garlic", label: "Garlic (लहसुन)" },
    { value: "Grapes", label: "Grapes (अंगूर)" },
    { value: "Pomegranate", label: "Pomegranate (अनार)" },
    { value: "Peas", label: "Peas (मटर)" },
    { value: "Cabbage", label: "Cabbage (पत्तागोभी)" },
    { value: "Cauliflower", label: "Cauliflower (फूलगोभी)" },
    { value: "Carrot", label: "Carrot (गाजर)" },
    { value: "Okra", label: "Okra (भिंडी)" },
    { value: "Brinjal", label: "Brinjal (बैंगन)" },
    { value: "Cucumber", label: "Cucumber (खीरा)" },
    { value: "Pumpkin", label: "Pumpkin (कद्दू)" },
    { value: "Bitter Gourd", label: "Bitter Gourd (करेला)" },
    { value: "Bottle Gourd", label: "Bottle Gourd (लौकी)" },
    { value: "Ridge Gourd", label: "Ridge Gourd (तुरई)" },
    { value: "Green Chilli", label: "Green Chilli (हरी मिर्च)" },
    { value: "Lady Finger", label: "Lady Finger (भिंडी)" },
    { value: "Mango", label: "Mango (आम)" },
    { value: "Papaya", label: "Papaya (पपीता)" },
    { value: "Guava", label: "Guava (अमरूद)" },
    { value: "Apple", label: "Apple (सेब)" },
    { value: "Orange", label: "Orange (संतरा)" },
    { value: "Lemon", label: "Lemon (नींबू)" },
    { value: "Pineapple", label: "Pineapple (अनानास)" },
    { value: "Watermelon", label: "Watermelon (तरबूज)" },
    { value: "Muskmelon", label: "Muskmelon (खरबूजा)" },
    { value: "Coconut", label: "Coconut (नारियल)" },
    { value: "Cashew", label: "Cashew (काजू)" },
    { value: "Almond", label: "Almond (बादाम)" },
    { value: "Walnut", label: "Walnut (अखरोट)" },
    { value: "Mustard", label: "Mustard (सरसों)" },
    { value: "Sesame", label: "Sesame (तिल)" },
    { value: "Sunflower", label: "Sunflower (सूरजमुखी)" },
    { value: "Linseed", label: "Linseed (अलसी)" },
    { value: "Castor", label: "Castor (अरंडी)" },
    { value: "Safflower", label: "Safflower (कुसुम)" },
    { value: "Tobacco", label: "Tobacco (तंबाकू)" },
    { value: "Jute", label: "Jute (जूट)" },
    { value: "Tea", label: "Tea (चाय)" },
    { value: "Coffee", label: "Coffee (कॉफी)" },
    { value: "Rubber", label: "Rubber (रबर)" },
    { value: "Coriander", label: "Coriander (धनिया)" },
    { value: "Cumin", label: "Cumin (जीरा)" },
    { value: "Fennel", label: "Fennel (सौंफ)" },
    { value: "Fenugreek", label: "Fenugreek (मेथी)" },
    { value: "Ajwain", label: "Ajwain (अजवाइन)" },
    { value: "Isabgol", label: "Isabgol (ईसबगोल)" },
    { value: "Black Pepper", label: "Black Pepper (काली मिर्च)" },
    { value: "Cardamom", label: "Cardamom (इलायची)" },
    { value: "Turmeric", label: "Turmeric (हल्दी)" },
    { value: "Ginger", label: "Ginger (अदरक)" },
    { value: "Clove", label: "Clove (लौंग)" },
    { value: "Cinnamon", label: "Cinnamon (दालचीनी)" },
    { value: "Nutmeg", label: "Nutmeg (जायफल)" },
    { value: "Tamarind", label: "Tamarind (इमली)" },
    { value: "Drumstick", label: "Drumstick (सहजन)" },
    { value: "Spinach", label: "Spinach (पालक)" },
    { value: "Amaranthus", label: "Amaranthus (चौलाई)" },
    { value: "Mint", label: "Mint (पुदीना)" },
    { value: "Curry Leaves", label: "Curry Leaves (करी पत्ता)" },
    { value: "Fenugreek Leaves", label: "Fenugreek Leaves (मेथी पत्ता)" },
    { value: "Beetroot", label: "Beetroot (चुकंदर)" },
    { value: "Radish", label: "Radish (मूली)" },
    { value: "Turnip", label: "Turnip (शलजम)" },
    { value: "Sweet Potato", label: "Sweet Potato (शकरकंद)" },
    { value: "Yam", label: "Yam (जिमीकंद)" },
    { value: "Elephant Yam", label: "Elephant Yam (सूरन)" },
    { value: "Colocasia", label: "Colocasia (अरबी)" },
    { value: "Tapioca", label: "Tapioca (कसावा)" },
    { value: "Green Peas", label: "Green Peas (हरी मटर)" },
    { value: "French Beans", label: "French Beans (फ्रेंच बीन्स)" },
    { value: "Cluster Beans", label: "Cluster Beans (ग्वार फली)" },
    { value: "Broad Beans", label: "Broad Beans (सेम)" },
    { value: "Cowpea", label: "Cowpea (लोबिया)" },
    { value: "Indian Beans", label: "Indian Beans (सेम)" },
    { value: "Chickpea", label: "Chickpea (काबुली चना)" },
    { value: "Black Gram", label: "Black Gram (उड़द)" },
    { value: "Green Gram", label: "Green Gram (मूंग)" },
    { value: "Lentil", label: "Lentil (मसूर)" },
    { value: "Peanut", label: "Peanut (मूंगफली)" },
    { value: "Pigeon Pea", label: "Pigeon Pea (अरहर)" },
    { value: "Horse Gram", label: "Horse Gram (कुल्थी)" },
    { value: "Moth Bean", label: "Moth Bean (मोठ)" },
    { value: "Field Pea", label: "Field Pea (मटर)" },
    { value: "Barley", label: "Barley (जौ)" },
    { value: "Oats", label: "Oats (जई)" },
    { value: "Ragi", label: "Ragi (रागी)" },
    { value: "Kodo Millet", label: "Kodo Millet (कोदो)" },
    { value: "Little Millet", label: "Little Millet (कुटकी)" },
    { value: "Foxtail Millet", label: "Foxtail Millet (कंगनी)" },
    { value: "Barnyard Millet", label: "Barnyard Millet (सांवा)" },
    { value: "Proso Millet", label: "Proso Millet (चेना)" },
    { value: "Pearl Millet", label: "Pearl Millet (बाजरा)" },
    { value: "Finger Millet", label: "Finger Millet (रागी)" },
    { value: "Sorghum", label: "Sorghum (ज्वार)" },
    { value: "Maize Fodder", label: "Maize Fodder (मक्का चारा)" },
    { value: "Berseem", label: "Berseem (बरसीम)" },
    { value: "Lucerne", label: "Lucerne (लूसर्न)" },
    { value: "Fodder", label: "Fodder (चारा)" },
    { value: "Green Fodder", label: "Green Fodder (हरा चारा)" },
    { value: "Ber", label: "Ber (बेर)" },
    { value: "Custard Apple", label: "Custard Apple (सीताफल)" },
    { value: "Sapota", label: "Sapota (चीकू)" },
    { value: "Litchi", label: "Litchi (लीची)" },
    { value: "Jackfruit", label: "Jackfruit (कटहल)" },
    { value: "Pears", label: "Pears (नाशपाती)" },
    { value: "Peach", label: "Peach (आड़ू)" },
    { value: "Plum", label: "Plum (आलूबुखारा)" },
    { value: "Apricot", label: "Apricot (खुबानी)" },
    { value: "Papaya Raw", label: "Papaya Raw (कच्चा पपीता)" },
    { value: "Amla", label: "Amla (आंवला)" },
    { value: "Jamun", label: "Jamun (जामुन)" },
    { value: "Karonda", label: "Karonda (करौंदा)" },
    { value: "Fig", label: "Fig (अंजीर)" },
    { value: "Dates", label: "Dates (खजूर)" },
    { value: "Dragon Fruit", label: "Dragon Fruit (ड्रैगन फ्रूट)" },
    { value: "Kiwi", label: "Kiwi (कीवी)" },
    { value: "Strawberry", label: "Strawberry (स्ट्रॉबेरी)" },
    { value: "Mosambi", label: "Mosambi (मौसंबी)" },
    { value: "Sweet Orange", label: "Sweet Orange (मीठा संतरा)" },
    { value: "Tinda", label: "Tinda (टिंडा)" },
    { value: "Chow Chow", label: "Chow Chow (चायोटे)" },
    { value: "Ash Gourd", label: "Ash Gourd (पेठा)" },
    { value: "Snake Gourd", label: "Snake Gourd (चिचिंडा)" },
    { value: "Pointed Gourd", label: "Pointed Gourd (परवल)" },
    { value: "Ivy Gourd", label: "Ivy Gourd (कुंदरू)" },
    { value: "Capsicum", label: "Capsicum (शिमला मिर्च)" },
    { value: "Green Beans", label: "Green Beans (हरी बीन्स)" },
    { value: "Broccoli", label: "Broccoli (ब्रोकोली)" },
    { value: "Celery", label: "Celery (अजमोद)" },
    { value: "Leek", label: "Leek (लीक)" },
    { value: "Kohlrabi", label: "Kohlrabi (गांठगोभी)" },
    { value: "Knol Khol", label: "Knol Khol (गांठगोभी)" },
    { value: "Spring Onion", label: "Spring Onion (हरा प्याज़)" },
    { value: "Raw Banana", label: "Raw Banana (कच्चा केला)" },
    { value: "Raw Mango", label: "Raw Mango (कच्चा आम)" },
    { value: "Green Papaya", label: "Green Papaya (हरा पपीता)" },
    { value: "Mushroom", label: "Mushroom (मशरूम)" },
    { value: "Button Mushroom", label: "Button Mushroom (बटन मशरूम)" },
    { value: "Dried Peas", label: "Dried Peas (सूखी मटर)" },
    { value: "Dried Chillies", label: "Dried Chillies (सूखी मिर्च)" },
    { value: "Dry Ginger", label: "Dry Ginger (सोंठ)" },
    { value: "Dry Coconut", label: "Dry Coconut (सूखा नारियल)" },
    { value: "Betel Leaves", label: "Betel Leaves (पान के पत्ते)" },
    { value: "Arecanut", label: "Arecanut (सुपारी)" },
    { value: "Betel Nut", label: "Betel Nut (सुपारी)" },
    { value: "Mahua", label: "Mahua (महुआ)" },
    { value: "Neem Seed", label: "Neem Seed (नीम बीज)" },
    { value: "Tendu Leaves", label: "Tendu Leaves (तेंदू पत्ता)" },
    { value: "Moringa", label: "Moringa (सहजन)" },
    { value: "Flaxseed", label: "Flaxseed (अलसी)" },
    { value: "Niger Seed", label: "Niger Seed (रामतिल)" },
    { value: "Quinoa", label: "Quinoa (क्विनोआ)" },
    { value: "Chia Seed", label: "Chia Seed (चिया बीज)" },
    { value: "Rajma", label: "Rajma (राजमा)" },
    { value: "Kabuli Chana", label: "Kabuli Chana (काबुली चना)" },
    { value: "Masoor", label: "Masoor (मसूर)" },
    { value: "Urad", label: "Urad (उड़द)" },
    { value: "Moong", label: "Moong (मूंग)" },
    { value: "Arhar", label: "Arhar (अरहर)" },
    { value: "Gram Dal", label: "Gram Dal (चना दाल)" },
    { value: "Mustard Seed", label: "Mustard Seed (सरसों बीज)" },
    { value: "Rapeseed", label: "Rapeseed (राई)" },
    { value: "Canola", label: "Canola (कैनोला)" },
    { value: "Soybean Seed", label: "Soybean Seed (सोयाबीन बीज)" },
    { value: "Cotton Seed", label: "Cotton Seed (कपास बीज)" },
    { value: "Castor Seed", label: "Castor Seed (अरंडी बीज)" },
    { value: "Sunflower Seed", label: "Sunflower Seed (सूरजमुखी बीज)" },
    { value: "Sesame Seed", label: "Sesame Seed (तिल बीज)" },
    { value: "Coriander Seed", label: "Coriander Seed (धनिया बीज)" },
    { value: "Cumin Seed", label: "Cumin Seed (जीरा बीज)" },
    { value: "Fennel Seed", label: "Fennel Seed (सौंफ बीज)" },
    { value: "Fenugreek Seed", label: "Fenugreek Seed (मेथी बीज)" },
    { value: "Ajwain Seed", label: "Ajwain Seed (अजवाइन बीज)" },
    { value: "Poppy Seed", label: "Poppy Seed (खसखस)" },
    { value: "Isabgol Seed", label: "Isabgol Seed (ईसबगोल बीज)" },
    { value: "Chironji", label: "Chironji (चिरौंजी)" },
    { value: "Makhana", label: "Makhana (मखाना)" },
    { value: "Lotus Seed", label: "Lotus Seed (कमल बीज)" },
    { value: "Sugar Beet", label: "Sugar Beet (चुकंदर)" },
    { value: "Sweet Corn", label: "Sweet Corn (मीठा मक्का)" },
    { value: "Baby Corn", label: "Baby Corn (बेबी कॉर्न)" },
    { value: "Popcorn", label: "Popcorn (पॉपकॉर्न)" },
    { value: "Bamboo", label: "Bamboo (बांस)" },
    { value: "Hemp", label: "Hemp (हेम्प)" },
    { value: "Stevia", label: "Stevia (स्टेविया)" },
    { value: "Aloe Vera", label: "Aloe Vera (एलोवेरा)" },
    { value: "Ashwagandha", label: "Ashwagandha (अश्वगंधा)" },
    { value: "Tulsi", label: "Tulsi (तुलसी)" },
    { value: "Mentha", label: "Mentha (पुदीना तेल फसल)" },
    { value: "Lemongrass", label: "Lemongrass (लेमनग्रास)" },
    { value: "Marigold", label: "Marigold (गेंदा)" },
    { value: "Rose", label: "Rose (गुलाब)" },
    { value: "Jasmine", label: "Jasmine (चमेली)" },
    { value: "Chrysanthemum", label: "Chrysanthemum (गुलदाउदी)" },
    { value: "Flowers", label: "Flowers (फूल)" },
    { value: "Other Vegetables", label: "Other Vegetables (अन्य सब्जियां)" },
    { value: "Other Fruits", label: "Other Fruits (अन्य फल)" },
    { value: "Other Pulses", label: "Other Pulses (अन्य दालें)" },
    { value: "Other Oilseeds", label: "Other Oilseeds (अन्य तिलहन)" },
    { value: "Other Cereals", label: "Other Cereals (अन्य अनाज)" },
    { value: "Other Spices", label: "Other Spices (अन्य मसाले)" },
    { value: "Other", label: "Other (अन्य)" },
    { value: "Kodo", label: "Kodo (कोदो)" },
    { value: "Kutki", label: "Kutki (कुटकी)" },
    { value: "Sama", label: "Sama (सांवा)" },
    { value: "Chana", label: "Chana (चना)" },
    { value: "Dill Seed", label: "Dill Seed (सोया/सुवा बीज)" },
    { value: "Methi", label: "Methi (मेथी)" },
    { value: "Tori", label: "Tori (तोरई)" },
    { value: "Ridgeguard", label: "Ridgeguard (तुरई)" },
    { value: "Coconut Copra", label: "Coconut Copra (नारियल गरी)" },
    { value: "Copra", label: "Copra (सूखा नारियल)" },
    { value: "Paddy", label: "Paddy (धान)" },
    { value: "Paddy Straw", label: "Paddy Straw (धान का भूसा)" },
    { value: "Wheat Straw", label: "Wheat Straw (गेहूँ का भूसा)" },
    { value: "Maize Stover", label: "Maize Stover (मक्का चारा)" },
    { value: "Sugarcane Tops", label: "Sugarcane Tops (गन्ने की पत्तियां)" },
    { value: "Cane", label: "Cane (गन्ना)" },
    { value: "Saffron", label: "Saffron (केसर)" },
    { value: "Vanilla", label: "Vanilla (वेनिला)" },
    { value: "Ginger Dry", label: "Ginger Dry (सूखी अदरक)" },
    { value: "Garlic Dry", label: "Garlic Dry (सूखा लहसुन)" },
    { value: "Onion Dry", label: "Onion Dry (सूखा प्याज़)" },
    { value: "Red Chilli", label: "Red Chilli (लाल मिर्च)" },
    { value: "Green Gram Whole", label: "Green Gram Whole (साबुत मूंग)" },
    { value: "Black Gram Whole", label: "Black Gram Whole (साबुत उड़द)" },
    { value: "Pigeon Pea Whole", label: "Pigeon Pea Whole (साबुत अरहर)" },
    { value: "Lentil Whole", label: "Lentil Whole (साबुत मसूर)" },
    { value: "Peas Dry", label: "Peas Dry (सूखी मटर)" },
    { value: "Corn", label: "Corn (मक्का)" },
    { value: "Millets", label: "Millets (मोटे अनाज)" },
    { value: "Cereal", label: "Cereal (अनाज)" },
    { value: "Suran", label: "Suran (सूरन)" },
    { value: "Kachri", label: "Kachri (कचरी)" }
  ];

  const uniqueCrops = ["All", ...cropOptions.map((crop) => crop.value)];

  const filteredBuyers = useMemo(() => {
    return buyers
      .filter((b) => {
        const query = searchQuery.toLowerCase();
        const matchesSearch =
          b.buyer_name?.toLowerCase().includes(query) ||
          b.crop_name?.toLowerCase().includes(query) ||
          b.location?.toLowerCase().includes(query);

        const matchesCrop =
          cropFilter === "All" ||
          b.crop_name?.toLowerCase() === cropFilter.toLowerCase();

        return matchesSearch && matchesCrop;
      })
      .sort((a, b) => {
        if (sortBy === "priceDesc") {
          return Number(b.max_price || 0) - Number(a.max_price || 0);
        }
        if (sortBy === "priceAsc") {
          return Number(a.max_price || 0) - Number(b.max_price || 0);
        }
        if (sortBy === "qtyDesc") {
          return Number(b.quantity || 0) - Number(a.quantity || 0);
        }
        return 0;
      });
  }, [buyers, searchQuery, cropFilter, sortBy]);

  const handleOpenOffer = (buyerReq) => {
    setSelectedBuyer(buyerReq);
    setOfferPrice(buyerReq.max_price || "");
    setOfferQuantity(buyerReq.quantity || "");
    setOfferMessage(`I have Grade A ${buyerReq.crop_name} ready for prompt dispatch.`);
    setOfferError("");
    setOfferModalOpen(true);
  };

  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedBuyer) return;

    setSubmittingOffer(true);
    setOfferError("");

    try {
      const payload = {
        requirement_id: selectedBuyer.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQuantity),
        message: offerMessage,
      };

      const res = await api.post("/api/offers", payload);
      setCreatedOfferData({
        offerId: res.offerId,
        buyerName: selectedBuyer.buyer_name || "Institutional Buyer",
        crop: selectedBuyer.crop_name,
        price: offerPrice,
        quantity: offerQuantity,
        unit: selectedBuyer.unit,
      });

      setOfferModalOpen(false);
      setSuccessModalOpen(true);
    } catch (err) {
      setOfferError(err.message || "Failed to submit commercial offer to buyer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
            Find & Match Buyers
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-gray-500">
            Discover verified open procurement requirements posted by institutional buyers and wholesale traders.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="emerald">
            {buyers.length} Active Direct Requirements
          </Badge>
        </div>
      </div>

      {/* Search & Filter Ribbon */}
      <Card className="p-3 sm:p-4 border-gray-200/90">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          <Input
            placeholder="Search buyer name, crop, or district..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            icon={Search}
          />

          <Select
            label=""
            value={cropFilter}
            onChange={(e) => setCropFilter(e.target.value)}
          >
            <option value="All">Filter by All Crops</option>

            {cropOptions.map((crop) => (
              <option key={crop.value} value={crop.value}>
                {crop.label}
              </option>
            ))}
          </Select>

          <Select
            label=""
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="priceDesc">Sort: Highest Offered Rate</option>
            <option value="priceAsc">Sort: Lowest Offered Rate</option>
            <option value="qtyDesc">Sort: Highest Required Volume</option>
          </Select>
        </div>
      </Card>

      {/* Results Section */}
      {loading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <LoadingState message="Fetching active institutional buyer requirements..." />
        </div>
      ) : filteredBuyers.length === 0 ? (
        <EmptyState
          title="No Matching Buyer Requirements Found"
          description="There are currently no open buyer requirements matching your search filters. Prospective buyers will reach out once you list your produce."
          icon={Users}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
          {filteredBuyers.map((b) => (
            <Card
              key={b.id}
              className="buyer-card-anim border-gray-200/90 hover:border-emerald-400 p-5 space-y-4 transition-all hover:shadow-xs"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-bold text-gray-900 text-base">
                      {b.buyer_name || "Verified Buyer"}
                    </h3>
                    <Badge variant="emerald" dot>
                      Open Order
                    </Badge>
                  </div>
                  <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin size={13} className="text-gray-400" />
                    {b.location || "Delivery Point on Request"}
                  </p>
                </div>

                <div className="text-right">
                  <span className="text-xs text-gray-400 block">Ceiling Rate</span>
                  <span className="text-xl font-extrabold text-emerald-700">
                    {b.max_price ? `₹${Number(b.max_price).toLocaleString()}` : "Open"}
                  </span>
                  <span className="text-xs text-gray-500"> / {b.unit}</span>
                </div>
              </div>

              {/* Requirement Specs */}
              <div className="bg-gray-50 rounded-xl p-3 grid grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-gray-400 block">Crop</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    🌾 {b.crop_name}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Volume Needed</span>
                  <span className="font-bold text-gray-800 flex items-center gap-1 mt-0.5">
                    <Package size={13} className="text-gray-400" />
                    {b.quantity} {b.unit}
                  </span>
                </div>

                <div>
                  <span className="text-gray-400 block">Need By</span>
                  <span className="font-semibold text-gray-700 flex items-center gap-1 mt-0.5">
                    <Calendar size={13} className="text-gray-400" />
                    {b.required_by ? b.required_by.split("T")[0] : "Urgent"}
                  </span>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <span className="text-xs text-gray-500">
                  Target Grade: <strong>{b.quality_grade || "Any Quality"}</strong>
                </span>

                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => handleOpenOffer(b)}
                  icon={Send}
                >
                  Send Proposal
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Offer Submission Modal */}
      {selectedBuyer && (
        <Modal
          isOpen={offerModalOpen}
          onClose={() => setOfferModalOpen(false)}
          title={`Submit Offer to ${selectedBuyer.buyer_name || "Buyer"}`}
          subtitle={`Requirement: ${selectedBuyer.quantity} ${selectedBuyer.unit} of ${selectedBuyer.crop_name}`}
        >
          <form onSubmit={handleSendOfferSubmit} className="space-y-4">
            {offerError && (
              <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                <AlertTriangle size={16} />
                <span>{offerError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label={`Your Offer Rate (₹ / ${selectedBuyer.unit})`}
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                helperText={`Buyer maximum: ₹${selectedBuyer.max_price || "Open"}`}
              />

              <Input
                label={`Supply Volume (${selectedBuyer.unit})`}
                type="number"
                required
                value={offerQuantity}
                onChange={(e) => setOfferQuantity(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Note to Buyer
              </label>
              <textarea
                rows={3}
                value={offerMessage}
                onChange={(e) => setOfferMessage(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Details regarding quality grade, packaging, or dispatch readiness..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setOfferModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingOffer}
                icon={Send}
              >
                Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Success Confirmation Modal */}
      <Modal
        isOpen={successModalOpen}
        onClose={() => setSuccessModalOpen(false)}
        title="Commercial Offer Dispatched!"
        subtitle="Your proposal has been officially registered and forwarded to the buyer."
      >
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          {createdOfferData && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Offer Tracking ID:</span>
                <span className="font-bold text-gray-900">#KS-OFFER-{createdOfferData.offerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Recipient Buyer:</span>
                <span className="font-semibold text-gray-900">{createdOfferData.buyerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Volume:</span>
                <span className="font-semibold text-gray-900">
                  {createdOfferData.quantity} {createdOfferData.unit} of {createdOfferData.crop}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Rate:</span>
                <span className="font-bold text-emerald-700">₹{createdOfferData.price} / {createdOfferData.unit}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            You can negotiate counter-offers and monitor acceptance status under My Offers.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => setSuccessModalOpen(false)}
            >
              Done
            </Button>
            <Link to="/offers" className="flex-1">
              <Button variant="outline" className="w-full">
                Go to My Offers
              </Button>
            </Link>
          </div>
        </div>
      </Modal>
    </div>
  );
}

export default Buyers;