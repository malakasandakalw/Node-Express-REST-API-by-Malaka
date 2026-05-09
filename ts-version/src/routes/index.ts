import { Request, Response, Router } from "express";
import authRoutes from "./authRoutes";
import productRoutes from "./productRoutes";

const router = Router();

router.use("/auth", authRoutes);
router.use("/products", productRoutes);

// Health check
router.get("/health", (req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    message: "API is running",
    author: "Malaka Sandakal",
    github: "https://github.com/malakasandakalw",
    linkedIn: "https://www.linkedin.com/in/malakasandakal/",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

export default router;
