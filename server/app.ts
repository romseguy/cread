import axios from "axios";
import express, { Request, Router } from "express";
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

interface RequestQuery {
  url?: string;
}

class App {
  public router: Router = express.Router();

  constructor() {
    this.router.get("/", (req, res) => {
      res.send("Welcome to the API!");
    });

    this.router.get(
      "/fetch",
      async (
        req: Request<RequestParams, ResponseBody, RequestBody, RequestQuery>,
        res
      ) => {
        try {
          let { query } = req;

          if (!query.url) throw new Error("NO URL");

          let url = `https://api.allorigins.win/get?url=${encodeURIComponent(
            query.url.split("#")[0]
          )}`;

          const { data } = await client.get(url);
          console.log("🚀 ~ /fetch ~ data:", data);

          if (!data.contents) throw new Error("NO CONTENTS");

          const title = data.contents.split("<title>")[1].split("</title>")[0];

          res.status(data.status.http_code).json({ title });
          //res.status(200).json({});
        } catch (error: any) {
          console.log("🚀 ~ /fetch ~ error:", error.message);

          res
            .status(200)
            .json({ code: error.response ? error.response.status : 200 });
        }
      }
    );
  }
}

const api = new App();

export default api;
