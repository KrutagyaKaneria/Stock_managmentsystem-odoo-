import express from "express";
import cors from "cors";
import bodyParser from "body-parser";

// ROUTES (clean import)
import productRoutes from "./routes/product.routes.js";
import warehouseRoutes from "./routes/warehouse.routes.js";
import locationRoutes from "./routes/location.routes.js";
import receiptRoutes from "./routes/receipt.routes.js";
import deliveryRoutes from "./routes/delivery.routes.js";
import transferRoutes from "./routes/transfer.routes.js";
import adjustmentRoutes from "./routes/adjustment.routes.js";
import stockMoveRoutes from "./routes/stockmove.routes.js";
import dashboardRoutes from "./routes/dashboard.routes.js";

// ERROR MIDDLEWARE
import errorMiddleware from "./middlewares/error.middleware.js";

const app = express();

app.use(cors());
app.use(bodyParser.json());

// REGISTER API ROUTES
app.use("/api/v1/products", productRoutes);
app.use("/api/v1/warehouses", warehouseRoutes);
app.use("/api/v1/locations", locationRoutes);
app.use("/api/v1/receipts", receiptRoutes);
app.use("/api/v1/deliveries", deliveryRoutes);
app.use("/api/v1/transfers", transferRoutes);
app.use("/api/v1/adjustments", adjustmentRoutes);
app.use("/api/v1/stock-moves", stockMoveRoutes);
app.use("/api/v1/dashboard", dashboardRoutes);

// GLOBAL ERROR HANDLER
app.use(errorMiddleware);

export default app;
