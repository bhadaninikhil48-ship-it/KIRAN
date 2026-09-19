require("dotenv").config();

const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

// Routes
const priceRoutes = require("./routes/priceRoutes");

app.use("/price", priceRoutes);

// Server
const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
    console.log(`Backend server is running on port ${PORT}`);
});