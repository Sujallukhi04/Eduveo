import express from "express";
import { generateToken } from "../utils/jwt";
import { getUserByEmail } from "../lib/user";
import { db } from "../prismaClient";
import { setupGoogleAuth } from "./google";
import { Request, Response, NextFunction } from "express";
import { GoogleUserPayload, TokenPayload } from "../types";
import { z } from "zod";
import bcrypt from "bcrypt";
// import { CLIENT_ID } from "../config";

// export const setupAuthRoutes = (app: express.Application) => {
//   const oAuth2Client = setupGoogleAuth();

//   // Route to initiate Google login
//   app.get("/auth/google", (_req: Request, res: Response) => {
//     const authUrl = oAuth2Client.generateAuthUrl({
//       access_type: "offline",
//       scope: ["profile", "email"],
//     });
//     res.redirect(authUrl);
//   });

//   app.get(
//     "/auth/google/callback",
//     //@ts-ignore
//     async (req: Request, res: Response, next: NextFunction) => {
//       const code = req.query.code;
//       if (typeof code !== "string") {
//         return res.status(400).send("Invalid code provided.");
//       }

//       try {
//         const { tokens } = await oAuth2Client.getToken(code);
//         oAuth2Client.setCredentials(tokens);

//         if (!tokens.id_token) {
//           throw new Error("No ID token received");
//         }

//         const ticket = await oAuth2Client.verifyIdToken({
//           idToken: tokens.id_token,
//           audience: oAuth2Client._clientId,
//         });

//         console.log(ticket);
//         const payload = ticket.getPayload();
//         if (!payload) {
//           throw new Error("Failed to get payload from ID token");
//         }

//         const userPayload: GoogleUserPayload = {
//           email: payload.email || "",
//           name: payload.name || "",
//           picture: payload.picture || "",
//         };

//         // console.log(userPayload);

//         let user = await getUserByEmail(userPayload.email);
//         if (!user) {
//           user = await db.user.create({
//             data: {
//               email: userPayload.email,
//               name: userPayload.name,
//               avatarUrl: userPayload.picture,
//               createdAt: new Date(),
//             },
//           });
//         }

//         const tokenPayload: TokenPayload = {
//           ...userPayload,
//           id: user.id,
//         };

//         // Generate JWT token
//         const token = generateToken(tokenPayload);

//         // Set token in HTTP-only cookie
//         res.cookie("token", token, {
//           httpOnly: true,
//           secure: process.env.NODE_ENV === "production",
//           sameSite: "lax",
//           maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
//         });

//         // Redirect to frontend groups page
//         res.redirect(
//           `${process.env.FRONTEND_URL || "http://localhost:5173"}/groups`
//         );
//       } catch (error) {
//         console.error(error);
//         res.status(500).send("Authentication failed.");
//       }
//     }
//   );

//   app.post("/logout", (req: Request, res: Response) => {
//     try {
//       // Clear the token cookie
//       res.clearCookie("token", {
//         httpOnly: true,
//         secure: process.env.NODE_ENV === "production",
//         sameSite: "lax",
//       });

//       // Send a success response or redirect
//       res.status(200).json({ message: "Logged out successfully" });
//     } catch (error) {
//       console.error("Logout error:", error);
//       res.status(500).json({ message: "Failed to log out" });
//     }
//   });
// };
const signupSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const setupAuthRoutes = (app: express.Application) => {
  // Signup route
  app.post(
    "/auth/signup",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const validatedData = signupSchema.parse(req.body);
        const { name, email, password } = validatedData;

        // Check if user already exists
        const existingUser = await getUserByEmail(email);
        if (existingUser) {
          res.status(400).json({
            message: "User with this email already exists",
          });
          return;
        }

        // Hash password
        const saltRounds = 12;
        const hashedPassword = await bcrypt.hash(password, saltRounds);

        // Create new user
        const user = await db.user.create({
          data: {
            email,
            name,
            password: hashedPassword,
            createdAt: new Date(),
          },
        });

        // Generate JWT token
        const tokenPayload: TokenPayload = {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.avatarUrl || "",
        };

        const token = generateToken(tokenPayload);

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(201).json({
          message: "Account created successfully",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        console.error("Signup error:", error);
        res.status(500).json({ message: "Failed to create account" });
      }
    }
  );

  // Login route
  app.post(
    "/auth/login",
    async (req: Request, res: Response): Promise<void> => {
      try {
        const validatedData = loginSchema.parse(req.body);
        const { email, password } = validatedData;

        // Find user by email
        const user = await getUserByEmail(email);
        if (!user || !user.password) {
          res.status(401).json({
            message: "Invalid email or password",
          });
          return;
        }

        // Verify password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
          res.status(401).json({
            message: "Invalid email or password",
          });
          return;
        }

        // Generate JWT token
        const tokenPayload: TokenPayload = {
          id: user.id,
          email: user.email,
          name: user.name,
          picture: user.avatarUrl || "",
        };

        const token = generateToken(tokenPayload);

        // Set token in HTTP-only cookie
        res.cookie("token", token, {
          httpOnly: true,
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        });

        res.status(200).json({
          message: "Login successful",
          user: {
            id: user.id,
            name: user.name,
            email: user.email,
            avatarUrl: user.avatarUrl,
          },
        });
      } catch (error) {
        if (error instanceof z.ZodError) {
          res.status(400).json({
            message: "Validation error",
            errors: error.errors,
          });
          return;
        }

        console.error("Login error:", error);
        res.status(500).json({ message: "Failed to login" });
      }
    }
  );

  // Logout route
  app.post("/auth/logout", (req: Request, res: Response) => {
    try {
      res.clearCookie("token", {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
      });

      res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
      console.error("Logout error:", error);
      res.status(500).json({ message: "Failed to log out" });
    }
  });
};
