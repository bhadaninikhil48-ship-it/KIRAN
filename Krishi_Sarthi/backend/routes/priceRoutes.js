import express from "express";
import {
    getPrices,
    getMarkets,
    getPriceHistory
} from "../controllers/priceController.js";

const router = express.Router();

router.get("/", getPrices);

router.get("/markets", getMarkets);

router.get("/history", getPriceHistory);

export default router;