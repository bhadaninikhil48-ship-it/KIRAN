import express from "express";
import db from "./config/db.js";
import authRoutes from "./routes/authRoutes.js";
import farmerRoutes from "./routes/farmerRoutes.js";
import produceRoutes from "./routes/produceRoutes.js";
import marketRoutes from "./routes/marketRoutes.js";
import buyerRoutes from "./routes/buyerRoutes.js";
import offerRoutes from "./routes/offerRoutes.js";
import contractRoutes from "./routes/contractRoutes.js";
import negotiationRoutes from "./routes/negotiationRoutes.js";


import cors from "cors";
const app = express();

app.use(cors());
app.use(express.json());

const PORT = 5000;

app.use("/api/auth", authRoutes);
app.use("/api/farmer", farmerRoutes);
app.use("/api/produce", produceRoutes);
app.use("/api/market", marketRoutes);
app.use("/api/buyer", buyerRoutes);
app.use("/api/offers", offerRoutes);
app.use("/api/contracts", contractRoutes);
app.use("/api/negotiations", negotiationRoutes);

app.get("/", (req, res) => {
    res.send("KIRAN Backend is running!");
});

app.get("/db-test", async (req, res) => {
    try {
        const [result] = await db.query("SELECT 1");
        res.json({
            message: "MySQL connected successfully",
            result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({
            message: "Database connection failed"
        });
    }
});

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});