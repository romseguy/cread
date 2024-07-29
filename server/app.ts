import axios from "axios";
import cp from "child_process";
import cors from "cors";
import express, { Router, Request, Response } from "express";
import fs from "fs";
import https from "https";

const agent = new https.Agent({
  rejectUnauthorized: false,
  requestCert: false
});

const client = axios.create({
  responseType: "json",
  withCredentials: true,
  httpsAgent: agent,
  timeout: 60000
});

interface RequestParams {}

interface ResponseBody {}

interface RequestBody {}

class App {
  public router: Router = express.Router();

  constructor() {
    this.router.use(cors());

    this.router.get("/", (req: Request, res: Response) => {
      res.send("Welcome to the API!");
    });

    this.router.get("/scrape", async (req: Request, res: Response) => {
      if (!req.query.id) return res.status(400).send(new Error("missing id"));
      if (!req.query.url) return res.status(400).send(new Error("missing url"));

      let __path = new URL(`../public/${req.query.id}.json`, import.meta.url)
        .pathname;
      let __scriptPath = new URL(`./script.sh`, import.meta.url).pathname;

      if (process.env.NODE_ENV === "production") {
        __path = "/var/www/cread/public/" + req.query.id + ".json";
        __scriptPath = "/var/www/cread/server/script.sh";
      }

      const exist = fs.existsSync(__path);
      console.log("🚀 ~ exist:", exist, __path);

      if (exist)
        return res
          .status(200)
          .send({ data: req.query.id + " already scraped" });

      console.log("🚀 ~ downloading ~ __path:", __path);

      try {
        const string = cp.execSync(
          `"${__scriptPath}" ${req.query.id} ${req.query.url}`,
          { encoding: "utf8" }
        );

        console.log("🚀 ~ string:", string);

        return res.status(200).json({
          data: string
        });
      } catch (error) {
        console.error("🚀 ~ error:", error);
        return res.status(400).send(error);
      }
    });
  }
}

const api = new App();

export default api;
