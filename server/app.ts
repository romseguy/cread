import axios from "axios";
import cors from "cors";
import express, { Router, Request, Response } from "express";
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
  }
}

const api = new App();

export default api;
