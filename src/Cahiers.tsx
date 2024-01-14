import axios from "axios";
import React, { useState } from "react";

type Cahier = {
  count: number | string;
  links?: { link: HTMLAnchorElement; title: string }[];
  str?: string;
};

type CahiersList = Cahier[];

export function Cahiers() {
  let [cahiers, setCahiers] = useState<CahiersList>([]);
  console.log("🚀 ~ cahiers:", cahiers);
  const str = `
  <!DOCTYPE html>
  <html lang="fr-FR">
    <head>
      <meta charset="utf-8"/>
      <link href="preload.css" rel="stylesheet" type="text/css"/>
      <link href="layout.css" rel="stylesheet" type="text/css"/>
      <style>
      </style>
      <title>Cahiers de l'Ange - Bienvenus dans un futur différent - Sand & Jenaël</title>
    </head>
    <body class="body cc-page cc-page-blog j-m-gallery-styles j-m-video-styles j-m-hr-styles j-m-header-styles j-m-text-styles j-m-emotionheader-styles j-m-htmlCode-styles j-m-rss-styles j-m-form-styles-disabled j-m-table-styles j-m-textWithImage-styles j-m-downloadDocument-styles j-m-imageSubtitle-styles j-m-flickr-styles j-m-googlemaps-styles j-m-blogSelection-styles-disabled j-m-comment-styles-disabled j-m-jimdo-styles j-m-profile-styles j-m-guestbook-styles j-m-promotion-styles j-m-twitter-styles j-m-hgrid-styles j-m-shoppingcart-styles j-m-catalog-styles j-m-product-styles-disabled j-m-facebook-styles j-m-sharebuttons-styles j-m-formnew-styles-disabled j-m-callToAction-styles j-m-turbo-styles j-m-spacing-styles j-m-googleplus-styles j-m-dummy-styles j-m-search-styles j-m-booking-styles j-footer-styles cc-pagemode-default cc-content-parent" id="page-2544578723">

    <h1>Cahiers de l'Ange - Bienvenus dans un futur différent - Sand & Jenaël</h1>

    <ul style="font-size: 20px">
    ${cahiers
      .map(({ count }) => `<li><a href="#${count}">Cahier ${count}</a></li>`)
      .join(" ")}
    </ul>

    ${cahiers
      .map(
        ({ count, str }) => `
          <div id="cc-inner" class="cc-content-parent">
            <div class="jtpl-main cc-content-parent">
              <div class="jtpl-content content-options cc-content-parent">
                <div class="jtpl-content__inner cc-content-parent">
                  <div id="content_area" data-container="content">
                    <article id="${count}" class="j-blog"><div class="n j-blog-meta j-blog-post--header">
                      ${str}
                    </article>
                    <hr/>
                  </div>
                </div>
              </div>
            </div>
          </div>
        `
      )
      .join(" ")}
    </body>
  </html>
  `;

  // console.log("🚀 ~ str:", str);

  async function fetchStrings() {
    let arr: CahiersList = [];

    const map: Record<number, string> = {
      0: "7.5",
      1: "7.4",
      2: "7.3",
      3: "7.2",
      4: "7.1",
      5: "6",
      6: "5",
      7: "4",
      8: "3.2 et 3.3",
      9: "3.1",
      10: "2.2",
      11: "2.1",
      12: "1"
    };
    let k = 12;
    let count: number | string = map[k]; // CAHIERS 1 à 7.5

    for (let i = 48; i >= 36; i--) {
      // CAHIERS 1 à 7.5

      // console.log("🚀 ~ i:", i);
      //for (let i = 0; i <= 61; i++) {

      const docUrl = `/cahiers/download (${i}).html`;
      // console.log("🚀 ~ fetchHtml ~ docUrl:", docUrl);

      //const str = await (await fetch(`c.html`)).text();
      let str = await (await fetch(docUrl)).text();
      // // console.log("🚀 ~ fetchHtml ~ str:", str);

      str = str.replaceAll(
        `href="/`,
        //`href="https://unfuturdifferent.jimdofree.com/`
        `href="https://bienvenussurlanouvelleterre.jimdofree.com/`
      );

      const cahier: Cahier = { count, str };
      arr.push(cahier);

      //count += 1;

      k -= 1;
      count = map[k];
    }

    // let count = 28; // CAHIERS 28 à 8
    count = 8; // CAHIERS 8 à 28

    // for (let i = 15; i <= 35; i++) { // CAHIERS 28 à 8
    for (let i = 35; i >= 15; i--) {
      // CAHIERS 8 à 28

      // console.log("🚀 ~ i:", i);
      //for (let i = 0; i <= 61; i++) {

      const docUrl = `/cahiers/download (${i}).html`;
      // console.log("🚀 ~ fetchHtml ~ docUrl:", docUrl);

      //const str = await (await fetch(`c.html`)).text();
      let str = await (await fetch(docUrl)).text();
      // // console.log("🚀 ~ fetchHtml ~ str:", str);

      str = str.replaceAll(
        `href="/`,
        //`href="https://unfuturdifferent.jimdofree.com/`
        `href="https://bienvenussurlanouvelleterre.jimdofree.com/`
      );

      const cahier: Cahier = { count, str };
      arr.push(cahier);

      count += 1;
    }

    setCahiers(arr);
  }

  async function fetchTitles() {
    //let arr: string[] = [];
    let arr: CahiersList = [];
    //let count = 28;
    let count = 8;
    //let count = 44;
    const parser = new DOMParser();

    //for (let i = 15; i <= 50; i++) {
    //for (let i = 15; i <= 15; i++) {
    for (let i = 35; i >= 35; i--) {
      // console.log("🚀 ~ i:", i);
      //for (let i = 0; i <= 61; i++) {

      const docUrl = `/cahiers/download (${i}).html`;
      // console.log("🚀 ~ fetchHtml ~ docUrl:", docUrl);

      //const str = await (await fetch(`c.html`)).text();
      const str = await (await fetch(docUrl)).text();
      // // console.log("🚀 ~ fetchHtml ~ str:", str);

      const doc = parser.parseFromString(
        str.replaceAll(
          `href="/`,
          //`href="https://unfuturdifferent.jimdofree.com/`
          `href="https://bienvenussurlanouvelleterre.jimdofree.com/`
        ),
        "text/html"
      );
      if (typeof doc.firstChild?.getElementsByTagName !== "function") {
        console.log("nope");
        continue;
      }
      const links = (doc.firstChild as HTMLElement).getElementsByTagName("a");
      let linksToAdd = [];

      for (let j = 0; j < /*links.length*/ 1; j++) {
        const link = links[j];
        // console.log("🚀 ~ link:", link.href);

        if (link.href.includes("javascript")) {
          // console.log("🚀 ~ link: skip");
          continue;
        }

        const { data } = await axios.get("/api/fetch?url=" + link.href);
        // console.log("🚀 ~ data:", data);

        const { title, code } = data;

        if (title) {
          linksToAdd.push({ link, title });
        } else if (code) {
          linksToAdd.push({ link, title: code });
        }
      }

      const cahier: Cahier = { count, links: linksToAdd };
      arr.push(cahier);
      count -= 1;
    }

    setCahiers(arr);
  }

  return (
    <>
      <ul>
        {cahiers.map(({ count, links }, index) => {
          return (
            <React.Fragment key={index}>
              <h1>Cahier {count}</h1>
              {/* <h1>Dialogue {count}</h1> */}

              <ol>
                {links?.map((entry, index) => {
                  return (
                    <li key={`link-${index}`}>
                      <a
                        target="_blank"
                        href={entry.link.href}
                        dangerouslySetInnerHTML={{
                          __html: entry.title
                        }}
                      />
                    </li>
                  );
                })}
              </ol>
            </React.Fragment>
          );
        })}
      </ul>

      <button disabled={cahiers.length > 0} style={{marginRight: "24px"}} onClick={fetchTitles}>
        Footnotes
      </button>

      <button
        disabled={cahiers.length > 0}
        style={{ marginBottom: "12px" }}
        onClick={fetchStrings}
      >
        HTML
      </button>

      <textarea
        readOnly
        rows={10}
        style={{
          width: "98%",
          padding: "3px 1%"
        }}
        value={str}
      />
    </>
  );
}
