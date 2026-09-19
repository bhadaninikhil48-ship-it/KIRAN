import express from "express";

import {
    getPrices,
    getMarkets
} from "../controllers/priceController.js";

const router = express.Router();

router.get("/", getPrices);

router.get("/markets", getMarkets);

export default router;