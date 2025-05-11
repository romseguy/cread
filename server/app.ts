import express, { Router, Request, Response } from "express";
import axios from "axios";
import cp from "child_process";
import cors from "cors";
import fs from "fs";
import https from "https";
import { TypedRequestQuery } from "./types";

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

class App {
  public router: Router = express.Router();

  constructor() {
    this.router.use(cors());

    this.router.get("/", (req: Request, res: any) => {
      res.send("Welcome to the API!");
    });

    this.router.get(
      "/thread",
      async (req: TypedRequestQuery<{ id: string }>, res: any) => {
        try {
          const { data } = await client.get(
            "https://files.lebonforum.fr/" + req.query.id + ".json"
          );
          return res.status(200).json(data);
        } catch (error) {
          return res.status(500).json(error);
        }
      }
    );
    this.router.get(
      "/scrape",
      async (
        req: TypedRequestQuery<{ id: string; url: string; force?: string }>,
        res: any
      ) => {
        const prefix = `🚀 ~ ${new Date().toLocaleString()} ~ GET /scrape `;

        if (!req.query.id) return res.status(400).send(new Error("missing id"));
        if (!req.query.url)
          return res.status(400).send(new Error("missing url"));
        console.log(prefix + "query :", req.query);

        let __dir = new URL("../public", import.meta.url).pathname;
        let __path = __dir + "/" + req.query.id + ".json";
        let __scriptPath = new URL(`./script.sh`, import.meta.url).pathname;

        if (process.env.NODE_ENV === "production") {
          __dir = "/var/www/lbf-api/files/";
          __path = __dir + req.query.id + ".json";
          __scriptPath = "/var/www/cread/server/script.sh";
        }

        const exist = fs.existsSync(__path);

        if (exist && !req.query.force) {
          console.log(prefix + "already scraped: ", __path);
          return res
            .status(200)
            .send({ data: req.query.id + " already scraped" });
        }

        console.log(prefix + "downloading: ", __path);

        try {
          const stdout = cp.execSync(
            `"${__scriptPath}" ${__dir} ${req.query.url} ${req.query.id}`,
            { encoding: "utf8" }
          );

          console.log(prefix + "stdout: ", stdout);

          return res.status(200).json({
            data: stdout
          });
        } catch (error) {
          console.error("🚀 ~ error:", error);
          return res.status(400).send(error);
        }
      }
    );

    this.router.get(
      "/html",
      async (req: TypedRequestQuery<{ url: string }>, res: any) => {
        try {
          if (!req.query.url) throw new Error("Missing url");
          async function getHtml(url: string) {
            const { data } = await client.get(url);
            return data;
          }

          const html = await getHtml(req.query.url);

          return res.status(200).json({ html });
        } catch (error) {
          return res.status(400).send(error);
        }
      }
    );
  }
}

const api = new App();

export default api;
