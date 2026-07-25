import express, { Application, Request, Response } from "express";
import { toNodeHandler } from "better-auth/node";
import { auth } from "./app/lib/auth";
import path from "path";
import { IndexRouter } from "./app/routes/index.route";
const app: Application = express();
app.use('/api/auth',toNodeHandler(auth))
app.set("view engine", "ejs");
app.set("views",path.resolve(process.cwd(), `src/app/templates`) )
app.use(express.urlencoded({ extended: true }));

app.use(express.json());
app.get("/", (req: Request, res: Response) => {
    res.status(200).json({success:true,message:"Bus management backend system is running successfully"})
});

app.use("/api",IndexRouter)

export default app;