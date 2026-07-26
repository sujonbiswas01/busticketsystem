import express, { Application, Request, Response } from "express";
import cookieParser from "cookie-parser";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import cors from "cors";

import { IndexRouter } from "./app/routes/index.route";
import { envVars } from "./app/config/env";
import { PaymentController } from "./app/modules/payment/payment.controller";
import { notFound } from "./app/middleware/notFound";
import errorHandler from "./app/middleware/globalError";
const app: Application = express();
app.use(cookieParser());
app.use('/api/auth',toNodeHandler(auth))
app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )
app.use(express.urlencoded({ extended: true }));
app.post("/webhook", express.raw({ type: "application/json" }),PaymentController.handleStripeWebhookEvent);
app.use(express.json());
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({success:true,message:"Bus management backend system is running successfully"})
});



app.use(cookieParser());
app.use(cors({
  origin:envVars.FRONTEND_URL || "http://localhost:3000",
  credentials: true
}));
app.use(express.urlencoded({ extended: true }));

app.use("/api",IndexRouter)
app.use(notFound)
app.use(errorHandler)

export default app;