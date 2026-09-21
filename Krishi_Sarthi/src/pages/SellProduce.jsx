import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  CheckCircle2,
  Sparkles,
  MapPin,
  Calendar,
  ArrowRight,
  Trash2,
  AlertCircle,
  Plus,
  Package,
  Clock,
  Truck,
  ChevronRight,
} from "lucide-react";
import { Card, CardHeader } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { Input } from "../components/ui/Input";
import { Select } from "../components/ui/Select";
import { Modal } from "../components/ui/Modal";
import { StatusBadge } from "../components/ui/StatusBadge";
import { EmptyState } from "../components/ui/EmptyState";
import { LoadingState } from "../components/ui/LoadingState";
import {
  ProduceDetailModal,
  getProduceStage,
  LIFECYCLE_STAGES,
} from "../components/ProduceDetailModal";
import { animateStagger } from "../utils/animations";
import { api } from "../services/api";

export function SellProduce() {
  const [crop, setCrop] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unit, setUnit] = useState("kg");
  const [grade, setGrade] = useState("Grade A");
  const [expectedPrice, setExpectedPrice] = useState("");
  const [location, setLocation] = useState("");
  const [deliveryDate, setDeliveryDate] = useState("");
  // Data states
  const [myProduce, setMyProduce] = useState([]);
  const [loadingProduce, setLoadingProduce] = useState(true);
  const [listingProduce, setListingProduce] = useState(false);
  const [openRequirements, setOpenRequirements] = useState([]);
  const [loadingReqs, setLoadingReqs] = useState(false);
  const [liveBenchmarkPrice, setLiveBenchmarkPrice] = useState(null);
  const [selectedProduceItem, setSelectedProduceItem] = useState(null);
  const [stageRefresh, setStageRefresh] = useState(0);

  const locationHook = useLocation();
  const [showSellForm, setShowSellForm] = useState(() => {
    try {
      const searchParams = new URLSearchParams(window.location.search);
      return (
        searchParams.get("action") === "new" ||
        searchParams.get("new") === "true" ||
        Boolean(locationHook?.state?.newCrop)
      );
    } catch {
      return false;
    }
  });

  useEffect(() => {
    const searchParams = new URLSearchParams(locationHook.search);
    if (
      searchParams.get("action") === "new" ||
      searchParams.get("new") === "true" ||
      Boolean(locationHook?.state?.newCrop)
    ) {
      setShowSellForm(true);
    }
  }, [locationHook.search, locationHook.state]);

  // Same 250 crop options used in the marketplace crop filter
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

  // Status messages
  const [listingSuccess, setListingSuccess] = useState("");
  const [listingError, setListingError] = useState("");

  // Offer submission modal state
  const [selectedReq, setSelectedReq] = useState(null);
  const [offerPrice, setOfferPrice] = useState("");
  const [offerQty, setOfferQty] = useState("");
  const [offerMsg, setOfferMsg] = useState("");
  const [submittingOffer, setSubmittingOffer] = useState(false);
  const [offerSuccessModal, setOfferSuccessModal] = useState(false);
  const [offerSuccessData, setOfferSuccessData] = useState(null);
  const [offerError, setOfferError] = useState("");

  const containerRef = useRef(null);

  useEffect(() => {
    if (containerRef.current) {
      animateStagger(containerRef.current.querySelectorAll(".stagger-block"), {
        delay: 0.05,
      });
    }
  }, []);

  // Fetch farmer's produce list
  const fetchMyProduce = async () => {
    try {
      setLoadingProduce(true);
      const data = await api.get("/api/produce/my");
      setMyProduce(data?.produce || []);
    } catch (err) {
      console.error("Failed to load my produce:", err);
    } finally {
      setLoadingProduce(false);
    }
  };

  // Fetch open buyer requirements & live market benchmark
  const fetchMarketContext = async () => {
    try {
      setLoadingReqs(true);
      // Fetch open buyer requirements
      const reqData = await api.get(`/api/buyer/requirements/open${crop ? `?crop=${encodeURIComponent(crop)}` : ""}`);
      setOpenRequirements(reqData?.requirements || []);

      // Fetch benchmark market price for this crop
      const priceData = await api.get("/api/market/prices");
      if (priceData?.prices?.length > 0) {
        const matchingPrices = priceData.prices.filter(
          (p) => p.crop_name.toLowerCase() === crop.toLowerCase()
        );
        if (matchingPrices.length > 0) {
          setLiveBenchmarkPrice(Number(matchingPrices[0].modal_price));
        } else {
          setLiveBenchmarkPrice(null);
        }
      }
    } catch (err) {
      console.error("Failed to fetch market context:", err);
    } finally {
      setLoadingReqs(false);
    }
  };

  useEffect(() => {
    fetchMyProduce();
  }, []);

  useEffect(() => {
    fetchMarketContext();
  }, [crop]);

  // Handle Produce Creation
  const handleListProduce = async (e) => {
    e.preventDefault();
    setListingSuccess("");
    setListingError("");
    setListingProduce(true);

    try {
      const payload = {
        crop_name: crop,
        quantity: Number(quantity),
        unit: unit,
        quality_grade: grade,
        expected_harvest_date: deliveryDate,
        available_from: deliveryDate,
        location: location || "Indore, Madhya Pradesh",
      };

      const res = await api.post("/api/produce", payload);
      setListingSuccess(res.message || "Produce successfully listed on KIRAN marketplace!");
      await fetchMyProduce();
      setShowSellForm(false);

      // Reset the form for the next listing.
      setCrop("");
      setQuantity("");
      setUnit("kg");
      setGrade("Grade A");
      setExpectedPrice("");
      setLocation("");
      setDeliveryDate("");
    } catch (err) {
      setListingError(err.message || "Failed to list produce");
    } finally {
      setListingProduce(false);
    }
  };

  // Handle Delete Produce
  const handleDeleteProduce = async (produceId) => {
    if (!window.confirm("Are you sure you want to remove this produce listing?")) return;
    try {
      await api.delete(`/api/produce/${produceId}`);
      fetchMyProduce();
    } catch (err) {
      alert("Failed to delete produce: " + err.message);
    }
  };

  // Open Offer Modal for a requirement
  const handleOpenOfferModal = (req) => {
    setSelectedReq(req);
    setOfferPrice(req.max_price || liveBenchmarkPrice || expectedPrice);
    setOfferQty(req.quantity);
    setOfferMsg(`I can supply ${grade} fresh ${req.crop_name} from ${location || "my farm"}.`);
    setOfferError("");
  };

  // Submit Offer to Buyer Requirement
  const handleSendOfferSubmit = async (e) => {
    e.preventDefault();
    if (!selectedReq) return;

    setSubmittingOffer(true);
    setOfferError("");

    try {
      const payload = {
        requirement_id: selectedReq.id,
        offer_price: Number(offerPrice),
        quantity: Number(offerQty),
        message: offerMsg,
      };

      const res = await api.post("/api/offers", payload);
      setOfferSuccessData({
        offerId: res.offerId,
        buyer: selectedReq.buyer_name || "Institutional Buyer",
        crop: selectedReq.crop_name,
        quantity: offerQty,
        unit: selectedReq.unit,
        price: offerPrice,
        total: Number(offerPrice) * (selectedReq.unit === "quintal" ? Number(offerQty) : Number(offerQty) / 100),
      });
      setSelectedReq(null);
      setOfferSuccessModal(true);
    } catch (err) {
      setOfferError(err.message || "Failed to submit offer to buyer");
    } finally {
      setSubmittingOffer(false);
    }
  };

  const estimatedTotalValue = Math.round((quantity / (unit === "quintal" ? 1 : 100)) * expectedPrice);

  return (
    <div ref={containerRef} className="space-y-6 sm:space-y-8">
      {/* Page Header */}
      <div className="stagger-block">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight">
              {showSellForm ? "Sell New Crop" : "List & Sell Your Produce"}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-gray-500">
              List your harvest to match with open institutional buyer procurement requirements.
            </p>
          </div>
          <div className="flex items-center gap-2">
            {showSellForm && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setShowSellForm(false)}
              >
                Back to Listings
              </Button>
            )}

            {liveBenchmarkPrice ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                Live {crop} Benchmark: ₹{liveBenchmarkPrice.toLocaleString()}/q
              </span>
            ) : (
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-gray-100 text-gray-600">
                Mandi Benchmark Available
              </span>
            )}
          </div>
        </div>
      </div>

      {listingSuccess && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-3 text-sm text-emerald-800 animate-fadeIn">
          <CheckCircle2 size={18} className="shrink-0 text-emerald-600" />
          <span>{listingSuccess}</span>
        </div>
      )}

      {listingError && (
        <div className="p-4 rounded-xl bg-red-50 border border-red-200 flex items-center gap-3 text-sm text-red-700 animate-fadeIn">
          <AlertCircle size={18} className="shrink-0 text-red-600" />
          <span>{listingError}</span>
        </div>
      )}

      {!showSellForm ? (
        <Card className="stagger-block border-gray-200/90">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-4 mb-3 border-b border-gray-100">
            <div>
              <div className="flex items-center gap-2.5">
                <h2 className="text-lg font-bold text-gray-900">
                  My Active Produce Listings
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  {myProduce.length} {myProduce.length === 1 ? "Lot" : "Lots"}
                </span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Click any lot to view complete specs, agreement, live delivery tracking & payment lifecycle.
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              icon={Plus}
              onClick={() => {
                setListingSuccess("");
                setListingError("");
                setShowSellForm(true);
              }}
            >
              Sell New Crop
            </Button>
          </div>

          {loadingProduce ? (
            <LoadingState message="Loading your produce listings..." />
          ) : myProduce.length === 0 ? (
            <EmptyState
              title="No Produce Listed Yet"
              description="Click 'Sell New Crop' to publish your first agricultural lot on KIRAN."
              icon={Package}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {myProduce.map((item) => {
                const stageNum = getProduceStage(item);
                const stageObj = LIFECYCLE_STAGES.find((s) => s.id === stageNum) || LIFECYCLE_STAGES[0];
                const StageIcon = stageObj.icon;
                const isCompleted = stageNum === 7;
                const isInDelivery = stageNum === 4;

                return (
                  <div
                    key={item.id}
                    onClick={() => setSelectedProduceItem(item)}
                    className="group relative bg-white border border-gray-200 hover:border-emerald-500 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all duration-200 cursor-pointer flex flex-col justify-between"
                  >
                    <div>
                      {/* Top Row: Crop Name, Grade, Status, Delete */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-emerald-700 transition-colors">
                              {item.crop_name}
                            </h3>
                            {item.quality_grade && (
                              <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200/80 px-2 py-0.5 rounded-md">
                                {item.quality_grade}
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-gray-400">
                            Lot #{item.id ? String(item.id).padStart(4, "0") : "0001"} • KIRAN Exchange
                          </p>
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          {isCompleted ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 size={12} className="text-emerald-600" /> Sold & Settled
                            </span>
                          ) : isInDelivery ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 animate-pulse">
                              <Truck size={12} className="text-blue-600" /> In Delivery
                            </span>
                          ) : (
                            <StatusBadge status={item.status} />
                          )}

                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteProduce(item.id);
                            }}
                            title="Delete Listing"
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors cursor-pointer ml-1"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>

                      {/* Specs Row: Quantity, Location, Ready Date */}
                      <div className="mt-3.5 grid grid-cols-2 gap-2 bg-gray-50/75 rounded-xl p-3 border border-gray-100 text-xs">
                        <div className="flex items-center gap-2">
                          <Package size={14} className="text-emerald-600 shrink-0" />
                          <div>
                            <span className="text-gray-400 block text-[10px] uppercase font-medium">Quantity</span>
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {item.quantity} {item.unit}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <MapPin size={14} className="text-emerald-600 shrink-0" />
                          <div className="truncate">
                            <span className="text-gray-400 block text-[10px] uppercase font-medium">Location</span>
                            <span className="font-semibold text-gray-800 truncate block">
                              {item.location || "Farmgate, MP"}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 col-span-2 sm:col-span-1">
                          <Calendar size={13} className="text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">
                            Ready: <span className="font-medium text-gray-900">{item.available_from ? item.available_from.split("T")[0] : "Ready Now"}</span>
                          </span>
                        </div>

                        <div className="flex items-center gap-2 pt-1 border-t border-gray-200/60 col-span-2 sm:col-span-1">
                          <Clock size={13} className="text-gray-400 shrink-0" />
                          <span className="text-gray-600 truncate">
                            Listed: <span className="font-medium text-gray-900">{item.created_at ? new Date(item.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short" }) : "Today"}</span>
                          </span>
                        </div>
                      </div>

                      {/* Mini-stepper / Current transaction stage indicator */}
                      <div className="mt-3.5 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs mb-2">
                          <div className="flex items-center gap-1.5 font-semibold text-gray-800 truncate">
                            <span className={`w-2 h-2 rounded-full shrink-0 ${isCompleted ? "bg-emerald-600" : "bg-emerald-500 animate-pulse"}`} />
                            <span className="truncate">
                              Stage {stageNum} of 7: <span className="text-emerald-700 font-bold">{stageObj.label}</span>
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400 font-medium shrink-0 ml-1">
                            {isCompleted ? "100% Done" : `${Math.round((stageNum / 7) * 100)}%`}
                          </span>
                        </div>

                        {/* 7-step segment mini progress bar */}
                        <div className="grid grid-cols-7 gap-1 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                          {LIFECYCLE_STAGES.map((s) => (
                            <div
                              key={s.id}
                              className={`h-full rounded-xs transition-all ${
                                s.id <= stageNum
                                  ? isCompleted
                                    ? "bg-emerald-600"
                                    : "bg-emerald-500"
                                  : "bg-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Action Bar */}
                    <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-emerald-700 group-hover:text-emerald-800">
                      <span className="flex items-center gap-1.5">
                        <StageIcon size={14} className="text-emerald-600" />
                        {isInDelivery ? "Live In-Transit Tracking" : isCompleted ? "Settlement Receipt & Milestones" : "Lifecycle Tracking"}
                      </span>
                      <div className="flex items-center gap-0.5 group-hover:translate-x-1 transition-transform">
                        <span>View Details</span>
                        <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Form & Inventory (7 cols on lg) */}
          <div className="lg:col-span-7 space-y-6">
            <Card className="stagger-block border-gray-200/90">
              <CardHeader
                title="Produce & Lot Specification"
                subtitle="Specify harvest specifications to publish your lot on the KIRAN exchange."
              />

              <form onSubmit={handleListProduce} className="space-y-5">
                {/* 1. Crop & Quality */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Select
                    label="Crop Name"
                    value={crop}
                    onChange={(e) => setCrop(e.target.value)}
                    required
                  >
                    <option value="">Select crop</option>

                    {cropOptions.map((cropItem) => (
                      <option key={cropItem.value} value={cropItem.value}>
                        {cropItem.label}
                      </option>
                    ))}
                  </Select>

                  <Select
                    label="Quality / Grade"
                    value={grade}
                    onChange={(e) => setGrade(e.target.value)}
                    required
                  >
                    <option value="Grade A">Grade A</option>
                    <option value="Grade B">Grade B</option>
                    <option value="Grade C">Grade C</option>
                  </Select>
                </div>

                {/* 2. Quantity & Target Rate */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="mb-2 block text-sm font-medium text-gray-700">
                      Quantity <span className="text-red-500">*</span>
                    </label>

                    <div className="flex w-full overflow-hidden rounded-lg border border-gray-300 bg-white">
                      <input
                        type="number"
                        min="1"
                        step="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        placeholder="2700"
                        required
                        className="min-w-0 flex-1 px-3 py-2.5 text-sm outline-none"
                      />

                      <select
                        value={unit}
                        onChange={(e) => setUnit(e.target.value)}
                        className="w-20 shrink-0 border-l border-gray-200 bg-white px-1 py-2.5 text-sm outline-none"
                      >
                        <option value="kg">kg</option>
                        <option value="quintal">quintal</option>
                      </select>
                    </div>
                  </div>

                  <Input
                    label="Target Quoted Rate (₹ / quintal)"
                    placeholder="5000"
                    type="number"
                    min="100"
                    value={expectedPrice}
                    onChange={(e) => setExpectedPrice(Number(e.target.value))}
                    suffix="₹/q"
                    required
                  />
                </div>

                {/* 3. Farm Location & Harvest Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Farmgate Location / Cluster"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. Mumbai, Maharashtra"
                    icon={MapPin}
                    required
                  />

                  <Input
                    label="Available / Ready Harvest Date"
                    type="date"
                    value={deliveryDate}
                    onChange={(e) => setDeliveryDate(e.target.value)}
                    icon={Calendar}
                    required
                  />
                </div>

                <Button
                  type="submit"
                  variant="primary"
                  size="md"
                  loading={listingProduce}
                  className="w-full font-semibold shadow-xs"
                  icon={Plus}
                >
                  List Produce on KIRAN
                </Button>
              </form>
            </Card>

          </div>

          {/* Right Column: Real-time Lot Valuation & Open Buyer Requirements (5 cols on lg) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Real-time Lot Valuation Card */}
            <Card className="stagger-block bg-gradient-to-br from-emerald-50/60 to-white border-emerald-200">
              <div className="flex items-center justify-between pb-3 border-b border-emerald-100">
                <div className="flex items-center gap-2">
                  <div className="h-7 w-7 rounded-lg bg-emerald-600 text-white flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <span className="font-bold text-sm text-gray-900">
                    Live Lot Valuation
                  </span>
                </div>
                <Badge variant="emerald">Auto Calculating</Badge>
              </div>

              <div className="py-4 space-y-3">
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Produce Lot:</span>
                  <span className="font-bold text-gray-900">
                    {crop} • {quantity} {unit} ({grade})
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Origin / Location:</span>
                  <span className="font-medium text-gray-700">
                    {location || "Indore, Madhya Pradesh"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs sm:text-sm">
                  <span className="text-gray-500">Target Rate:</span>
                  <span className="font-semibold text-gray-800">
                    ₹{expectedPrice.toLocaleString()} / quintal
                  </span>
                </div>

                <div className="pt-3 border-t border-emerald-100 flex items-baseline justify-between">
                  <div>
                    <span className="text-xs text-gray-500 block">
                      Estimated Gross Realization
                    </span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-700">
                      ₹{estimatedTotalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Available Buyer Requirements for Selected Crop */}
            <Card className="stagger-block border-gray-200/90">
              <div className="flex items-center justify-between pb-3 mb-4 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-bold text-gray-900">
                    Available Buyers{crop ? ` (${crop})` : ""}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    Buyer requirements matching the crop you selected
                  </p>
                </div>
                <Badge variant="emerald">
                  {crop ? `${openRequirements.length} Active` : "Select Crop"}
                </Badge>
              </div>

              {!crop ? (
                <EmptyState
                  title="Select a Crop"
                  description="Choose a crop above to see active buyer requirements for that crop."
                  icon={Package}
                />
              ) : loadingReqs ? (
                <LoadingState message={`Finding buyers for ${crop}...`} />
              ) : openRequirements.length === 0 ? (
                <EmptyState
                  title={`No Active Buyers for ${crop}`}
                  description="No open buyer requirement is currently available for this crop."
                  icon={Package}
                />
              ) : (
                <div className="space-y-3">
                  {openRequirements.map((req) => (
                    <div
                      key={req.id}
                      className="p-3.5 rounded-xl border border-gray-200 bg-white hover:border-emerald-300 transition-all space-y-2.5"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <h4 className="font-bold text-gray-900 text-sm">
                            {req.buyer_name || "Verified Buyer"}
                          </h4>
                          <p className="text-xs text-gray-500 flex items-center gap-1 mt-0.5">
                            <MapPin size={12} className="text-gray-400" />
                            {req.location || "Location on file"}
                            {req.required_by && ` • Need by ${req.required_by.split("T")[0]}`}
                          </p>
                        </div>

                        <div className="text-right shrink-0">
                          {req.max_price && (
                            <span className="text-base font-bold text-emerald-700 block">
                              Up to ₹{req.max_price}
                            </span>
                          )}
                          <span className="text-[11px] text-gray-500">
                            Qty: <strong>{req.quantity} {req.unit}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                        <span className="text-xs text-gray-500 font-medium">
                          Grade: {req.quality_grade || "Any Standard"}
                        </span>
                        <Button
                          size="xs"
                          variant="primary"
                          onClick={() => handleOpenOfferModal(req)}
                          icon={ArrowRight}
                        >
                          Send Offer
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

          </div>
        </div>
      )}

      {/* Offer Submission Modal */}
      {selectedReq && (
        <Modal
          isOpen={!!selectedReq}
          onClose={() => setSelectedReq(null)}
          title={`Submit Offer to ${selectedReq.buyer_name || "Buyer"}`}
          subtitle={`Requirement: ${selectedReq.quantity} ${selectedReq.unit} of ${selectedReq.crop_name}`}
        >
          <form onSubmit={handleSendOfferSubmit} className="space-y-4">
            {offerError && (
              <div className="p-3 rounded-lg bg-red-50 text-xs text-red-700 flex items-center gap-2">
                <AlertCircle size={16} />
                <span>{offerError}</span>
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Offer Price (₹)"
                type="number"
                required
                value={offerPrice}
                onChange={(e) => setOfferPrice(e.target.value)}
                helperText={`Buyer's ceiling: ₹${selectedReq.max_price || "Open"}`}
              />

              <Input
                label={`Quantity (${selectedReq.unit})`}
                type="number"
                required
                value={offerQty}
                onChange={(e) => setOfferQty(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1.5">
                Message to Buyer (Optional)
              </label>
              <textarea
                rows={3}
                value={offerMsg}
                onChange={(e) => setOfferMsg(e.target.value)}
                className="w-full rounded-lg border border-gray-300 p-2.5 text-sm text-gray-900 outline-none focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/20"
                placeholder="Include quality specifics or dispatch availability..."
              />
            </div>

            <div className="pt-2 flex justify-end gap-3">
              <Button
                variant="outline"
                type="button"
                onClick={() => setSelectedReq(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                loading={submittingOffer}
                icon={ArrowRight}
              >
                Confirm & Submit Offer
              </Button>
            </div>
          </form>
        </Modal>
      )}

      {/* Offer Submitted Success Modal */}
      <Modal
        isOpen={offerSuccessModal}
        onClose={() => setOfferSuccessModal(false)}
        title="Offer Submitted to Buyer"
        subtitle="Your commercial proposal has been recorded in the KIRAN database."
      >
        <div className="space-y-4">
          <div className="h-12 w-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center">
            <CheckCircle2 size={28} />
          </div>

          {offerSuccessData && (
            <div className="bg-gray-50 rounded-xl p-4 space-y-2 text-xs sm:text-sm text-gray-700">
              <div className="flex justify-between">
                <span className="text-gray-500">Offer ID:</span>
                <span className="font-bold text-gray-900">#KS-OFFER-{offerSuccessData.offerId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Target Buyer:</span>
                <span className="font-semibold text-gray-900">{offerSuccessData.buyer}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Proposed Crop:</span>
                <span className="font-semibold">{offerSuccessData.crop} ({offerSuccessData.quantity} {offerSuccessData.unit})</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Offered Rate:</span>
                <span className="font-bold text-emerald-700">₹{offerSuccessData.price}</span>
              </div>
            </div>
          )}

          <p className="text-xs text-gray-500">
            The buyer can accept, counter-offer, or reject this proposal. You can monitor and respond to counter-proposals in My Offers.
          </p>

          <div className="flex gap-3 pt-2">
            <Button
              className="flex-1"
              onClick={() => setOfferSuccessModal(false)}
            >
              Done
            </Button>
            <Link to="/offers" className="flex-1">
              <Button variant="outline" className="w-full">
                View in My Offers
              </Button>
            </Link>
          </div>
        </div>
      </Modal>

      {/* Produce Listing Detail & 7-Stage Lifecycle Modal */}
      <ProduceDetailModal
        isOpen={Boolean(selectedProduceItem)}
        onClose={() => setSelectedProduceItem(null)}
        item={selectedProduceItem}
        onStageChange={(itemId, newStage) => {
          setStageRefresh((k) => k + 1);
          if (selectedProduceItem && selectedProduceItem.id === itemId) {
            setSelectedProduceItem({ ...selectedProduceItem });
          }
        }}
      />
    </div>
  );
}

export default SellProduce;