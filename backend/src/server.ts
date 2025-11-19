import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import authRoutes from "./routes/authRoutes.js";
import roastRoutes from "./routes/roastRoutes.js";  // Add this
import subscriptionRoutes from "./routes/subscriptionRoutes.js";  // Add this

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

app.use('/auth', authRoutes);
app.use('/roast', roastRoutes);  // Add this
app.use('/subscription', subscriptionRoutes); 

// Health check
app.get('/', (req, res) => {
  res.json({ message: 'RoastOrToast API is running! 🔥🍞' });
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});