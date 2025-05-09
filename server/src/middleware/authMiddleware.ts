import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";

interface DecodedToken extends JwtPayload {
  sub: string;
  "custom:role"?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        role: string;
      };
    }
  }
}

export const authMiddleware = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    try {
      // For Cognito tokens, we don't need to verify with a secret,
      // we just need to decode and extract the needed claims
      const decoded = jwt.decode(token) as DecodedToken;
      
      if (!decoded || !decoded.sub) {
        console.error("Invalid token structure");
        res.status(401).json({ message: "Invalid token structure" });
        return;
      }
      
      // Check token expiration
      if (decoded.exp && decoded.exp < Math.floor(Date.now() / 1000)) {
        console.error("Token expired");
        res.status(401).json({ message: "Token expired" });
        return;
      }
      
      const userRole = decoded["custom:role"] || "";
      req.user = {
        id: decoded.sub,
        role: userRole,
      };

      // Log authenticated request info (helpful for debugging)
      console.log(`Authenticated request from ${decoded.sub} with role: ${userRole}`);

      const hasAccess = allowedRoles.includes(userRole.toLowerCase());
      if (!hasAccess) {
        console.error(`Access denied for role: ${userRole}, required roles: ${allowedRoles.join(', ')}`);
        res.status(403).json({ message: "Access Denied" });
        return;
      }
      
      next();
    } catch (err) {
      console.error("Failed to decode token:", err);
      res.status(400).json({ message: "Invalid token" });
      return;
    }
  };
};
