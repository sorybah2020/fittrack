import { Express, Request, Response } from "express";
import bcrypt from "bcrypt";
import { db } from "../db";
import { users } from "../shared/schema";
import { eq } from "drizzle-orm";

export function setupPasswordReset(app: Express) {
  app.post("/api/reset-password", async (req: Request, res: Response) => {
    try {
      const { username, newPassword } = req.body;
      
      if (!username || !newPassword) {
        return res.status(400).json({ message: "Username and new password are required" });
      }
      
      // Check if user exists
      const existingUser = await db.query.users.findFirst({
        where: eq(users.username, username)
      });
      
      if (!existingUser) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Hash the new password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(newPassword, salt);
      
      // Update the user's password
      await db.update(users)
        .set({ password: hashedPassword })
        .where(eq(users.id, existingUser.id));
      
      return res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
      console.error("Error resetting password:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  });
}