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

    this.router.get("/thread", async (req: Request, res: Response) => {
      try {
        const { data } = await client.get(
          "https://files.lebonforum.fr/" + req.query.id + ".json"
        );
        return res.status(200).json(data);
      } catch (error) {
        return res.status(500).json(error);
      }
    });

    this.router.get("/scrape", async (req: Request, res: Response) => {
      if (!req.query.id) return res.status(400).send(new Error("missing id"));
      if (!req.query.url) return res.status(400).send(new Error("missing url"));
      console.log("GET /scrape ~ query :", req.query);

      let __dir;
      let __path = new URL(`../public/${req.query.id}.json`, import.meta.url)
        .pathname;
      let __scriptPath = new URL(`./script.sh`, import.meta.url).pathname;

      if (process.env.NODE_ENV === "production") {
        __dir = "/var/www/lbf-api/files/";
        __path = __dir + req.query.id + ".json";
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
        const stdout = cp.execSync(
          `"${__scriptPath}" ${__dir} ${req.query.url} ${req.query.id}`,
          { encoding: "utf8" }
        );

        console.log("🚀 ~ stdout:", stdout);

        return res.status(200).json({
          data: stdout
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
