import express from "express";
import dotenv from "dotenv";
import bodyParser from "body-parser";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import { authMiddleware } from "./middleware/authMiddleware";
/* ROUTE IMPORT */
import tenantRoutes from "./routes/tenantRoutes";
import managerRoutes from "./routes/managerRoutes";
import propertyRoutes from "./routes/propertyRoutes";
import leaseRoutes from "./routes/leaseRoutes";
import roomRoutes from "./routes/roomRoutes";
import applicationRoutes from "./routes/applicationRoutes";

console.log("🚀 Starting server initialization...");

/* CONFIGURATIONS */
dotenv.config();
console.log("✅ Environment variables loaded");

const app = express();
console.log("✅ Express app created");

// Middleware setup
console.log("🛠️ Setting up middleware...");
app.use(express.json());
app.use(helmet());
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" }));
app.use(morgan("common"));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cors());
console.log("✅ All middleware configured");

/* ROUTES */
console.log("🛣️ Setting up routes...");
app.get("/", (req, res) => {
  console.log("📡 Home route accessed");
  res.send("This is home route");
});

app.use("/applications", applicationRoutes);

// Mount properties routes first
app.use("/properties", propertyRoutes);

// Nest room and lease routes under properties path
app.use("/properties/:propertyId/rooms", roomRoutes);
app.use("/properties/:propertyId/leases", leaseRoutes);

// Also provide direct access routes for compatibility (temporary solution)
app.use("/rooms", roomRoutes);
app.use("/leases", leaseRoutes);
app.use("/tenants", authMiddleware(["tenant"]), tenantRoutes);
app.use("/managers", authMiddleware(["manager"]), managerRoutes);
console.log("✅ All routes configured");

/* SERVER */
const port = Number(process.env.PORT) || 3002;
console.log(`🌐 Attempting to start server on port ${port}...`);
app.listen(port, "0.0.0.0", () => {
  console.log(`✅ Server successfully running on port ${port}`);
  console.log(`🔗 Server URL: http://localhost:${port}`);
});
