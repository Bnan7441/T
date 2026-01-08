import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import dotenv from "dotenv";
dotenv.config();

const authMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Check for token in httpOnly cookie first (preferred), then fall back to Authorization header
    let token = req.cookies?.auth_token;
    
    if (!token) {
      const authHeader = req.headers.authorization as string | undefined;
      token = authHeader?.replace("Bearer ", "");
    }

    if (!token) {
      return res.status(401).json({ error: "No authentication token provided" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    (req as any).userId = decoded.userId;
    (req as any).userEmail = decoded.email;

    next();
  } catch (error: any) {
    if (error?.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token expired" });
    }
    return res.status(401).json({ error: "Invalid token" });
  }
};

export default authMiddleware;
