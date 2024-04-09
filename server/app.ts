import axios from "axios";
import cors from "cors";
import { parse, setHours } from "date-fns";
import { fr } from "date-fns/locale";
import express, { Request, Router } from "express";
import extractDate from "../src/lib/extract-date";
import fs from "fs";
import glob from "glob";
import https from "https";
import mysql, { ConnectionConfig } from "promise-mysql";

// import jsdom from "jsdom";
// const { JSDOM } = jsdom;
// class DOMParser {
//   parseFromString(s, contentType = "text/html") {
//     return new JSDOM(s, { contentType }).window.document;
//   }
// }
// function htmlDecode(input) {
//   var doc = new DOMParser().parseFromString(input, "text/html");
//   return doc.documentElement.textContent;
// }

const dbConfig: ConnectionConfig = {
  socketPath: "/var/run/mysqld/mysqld.sock",
  host: "localhost",
  user: "reseauleo",
  password: "wxcv",
  database: "reseauleo",
  charset: "utf8mb4"
  //collation: "utf8mb4_0900_ai_ci"
};
const db = await mysql.createConnection(dbConfig);

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
    this.router.get("/", (req, res) => {
      res.send("Welcome to the API!");
    });

    this.router.get(
      "/posts2wp",
      async (
        req: Request<
          RequestParams,
          ResponseBody,
          RequestBody,
          {
            url?: string;
          }
        >,
        res
      ) => {
        try {
          let { query } = req;

          const dir = `/home/x240/Code/romseguy/footnotes/public/posts`;

          glob(dir + "/*", {}, async (err, filePaths) => {
            if (err) throw err;

            filePaths.length = 10;

            for (const filePath of filePaths) {
              const str = fs.readFileSync(filePath, "utf8");
              const article = str.match(/<article(.|\n)*?<\/article>/);

              if (article) {
                const h1 = article[0].match(/<h1[^>]*>([^<]+)<\/h1>/i);

                if (h1) {
                  const post_title = h1[1];
                  //console.log("🚀 ~ App ~ post_title:", post_title);

                  const post_date = extractDate(article[0], {
                    locale: "fr",
                    timezone: "Europe/Paris"
                  })[0].date;

                  const post_content = article[0];
                  const post_status = "publish";
                  const post_author = 1;

                  const post_excerpt = "";
                  const to_ping = "";
                  const pinged = "";
                  const post_content_filtered = "";

                  const post_date_gmt = post_date;
                  const post_modified = post_date;
                  const post_modified_gmt = post_date;

                  const slug = str.match(
                    /og:url" content="http:\/\/www.reseauleo.com\/([^/]+)\//
                  );
                  const post_name = slug ? slug[1] : "";

                  await db.query(
                    `INSERT INTO wp_posts (post_name, post_title, post_content, post_status, post_author, post_excerpt, to_ping, pinged, post_content_filtered, post_date, post_date_gmt, post_modified, post_modified_gmt) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`,
                    [
                      post_name,
                      post_title,
                      post_content,
                      post_status,
                      post_author,
                      post_excerpt,
                      to_ping,
                      pinged,
                      post_content_filtered,
                      post_date,
                      post_date_gmt,
                      post_modified,
                      post_modified_gmt
                    ]
                  );

                  const row = await db.query(
                    "SELECT `ID` FROM `wp_posts` ORDER BY ID DESC LIMIT 1"
                  );

                  await db.query(
                    `INSERT INTO wp_term_relationships (object_id,term_taxonomy_id) VALUES ("${
                      JSON.parse(JSON.stringify(row))[0].ID
                    }",7)`
                  );
                }
              }
            }
          });

          //const { data } = await client.get(query.url);
          //res.status(data.status.http_code).json({ title });

          res.status(200).json({});
        } catch (error: any) {
          console.log("🚀 ~ GET /posts2wp ~ error:", error);
          res.status(200).json({});
        }
      }
    );
  }
}

const api = new App();

export default api;

/*

                  // const date = article[0].match(
                  //   /(\d{1,4}([.])\d{1,2}([.\-/])\d{1,4})/
                  // );
                  //const date = parse(article[0], "d MMMM yyyy", { locale: fr });

*/
