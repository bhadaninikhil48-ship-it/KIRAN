import express from "express";
import { getMarketPrices, compareMarketPrices, getBestSellingOpportunity } from "../controllers/marketController.js";

const router = express.Router();

router.get("/prices", getMarketPrices);

router.get("/compare", compareMarketPrices);

router.get("/best-opportunity", getBestSellingOpportunity);

export default router;