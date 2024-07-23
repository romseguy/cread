import { format, isAfter, parseISO, setDayOfYear, setYear } from "date-fns";
import React, { useEffect, useState } from "react";
import { css } from "twin.macro";
import "./App.css";
import { useTheme } from "./components/theme-provider";
import { ModeToggle } from "./components/mode-toggle";
//const data = import.meta.glob("./assets/t.json");

const d2021 = setYear(setDayOfYear(new Date(), 1), 2021);
const d2022 = setYear(setDayOfYear(new Date(), 1), 2022);
const d2023 = setYear(setDayOfYear(new Date(), 1), 2023);
const d2024 = setYear(setDayOfYear(new Date(), 1), 2024);

type YearsR = Record<number, any[]>;

function App() {
  const { theme, setTheme } = useTheme();
  const [isDisabled, setIsDisabled] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [refresh, setRefresh] = useState(false);
  const [user, setUser] = useState("MJF");
  const [years, setYears] = useState<Record<number, any[]>>({});

  const [currentY, setCurrentY] = useState(2021);
  const handleClick = (y) => {
    setCurrentY(y);
  };
  const currentPosts = years[currentY] || [];

  useEffect(() => {
    (async function extractYears() {
      console.log("🚀 ~ extractYears ~ user:", user);
      const newYears: YearsR = {
        2021: [],
        2022: [],
        2023: [],
        2024: []
      };
      const res = await fetch("/t.json");
      const data = await res.json();
      for (const post of data.posts) {
        if (post.user !== user) continue;

        if (isAfter(parseISO(post.date), d2024)) newYears[2024].push(post);
        else if (isAfter(parseISO(post.date), d2023)) newYears[2023].push(post);
        else if (isAfter(parseISO(post.date), d2022)) newYears[2022].push(post);
        else if (isAfter(parseISO(post.date), d2021)) newYears[2021].push(post);
      }

      setYears(newYears);
      setIsLoading(false);
    })();
  }, [refresh]);

  useEffect(
    function transformDOM() {
      //if (!Object.keys(years).length) return;
      //const main = document.querySelector("main");

      const divs = document.querySelectorAll("div");
      for (const div of divs) {
        if (div.style["text-align"] === "center") {
          div.style.background = "transparent";
          div.style.padding = 0;
        }
      }

      const imgs = document.querySelectorAll("img");

      for (const img of imgs) {
        img.loading = "eager";
        if (img.src.includes("proxy")) {
          let srcWithoutProxy = decodeURIComponent(
            img.src.substring(44, img.src.length)
          );

          const matches = srcWithoutProxy.match(/[^&]+/g);
          if (matches) {
            img.src = matches[0];
          }
        }
      }

      const links = document.querySelectorAll("a");

      for (const link of links) {
        if (!link.title.includes("post")) link.target = "_blank";
        if (link.textContent === "Click to expand...") link.textContent = "";
        else if (link.href.includes("goto")) {
          const matches = link.href.match(/forum.+/);
          if (matches) {
            link.href = "https://cassiopaea.org/" + matches[0];
          }
        }
      }

      const spans = document.querySelectorAll("span");

      let i = 0;
      for (const span of spans) {
        if (span.style.color === "rgb(0, 0, 0)") span.style.color = "";
        if (span.style.color === "rgb(40, 50, 78)")
          span.style.color = "rgb(135, 163, 239)";
        i++;
      }
    },
    [currentY, years]
  );

  if (isLoading) return "Loading";

  return (
    <main
      css={css`
        a {
          text-decoration: underline;
        }
        blockquote {
          background: rgba(255, 255, 255, 0.2);
          padding: 12px;
          margin-bottom: 24px;
          margin-left: 12px;
          text-align: left;
        }

        button[data-key="active"] {
          background: green;
        }
        h1 {
          font-size: 2rem;
          color: purple;
          margin: 24px 0;
        }
        h2 {
          font-size: 1.5rem;
          color: red;
          margin: 6px 0 24px 0;
        }
        header {
          display: flex;
          flex-direction: column;
          margin-top: 12px;

          button {
            background: red;
            color: white;
            font-weight: bold;
            margin-right: 12px;
            padding: 12px;
          }
          input {
            padding: 12px;
          }
          button[type="submit"] {
            background-color: teal;
            padding: 12px;
          }
        }
        hr {
          border-top-width: 10px;
          border-color: black;
        }
        & > ul > li:has(> h1) {
          background: transparent;
        }
        & > ul > li {
          background-color: hsl(var(--card-foreground));
          text-align: left;
          padding: 12px;
          & > div {
            background: rgba(255, 255, 255, 0.1);
            padding: 24px 0;
            margin-bottom: 24px;
          }
        }
        .contentRow-minor--hideLinks,
        .js-unfurl-desc,
        .js-unfurl-figure {
          display: none;
        }
      `}
    >
      {/* fixed button */}
      <div
        css={css`
          position: fixed;
          top: 36px;
          right: 36px;
          button {
            background: rgba(
              ${theme === "dark" ? "255, 255, 255, 1" : "0, 0, 0, 1"}
            );
            padding: 12px;
          }
        `}
      >
        <button
          onClick={() =>
            setTheme(theme === "dark" || theme === "system" ? "light" : "dark")
          }
        >
          {theme === "dark" || theme === "system" ? (
            <svg
              stroke="currentColor"
              fill={theme === "dark" ? "black" : "white"}
              strokeWidth="0"
              viewBox="0 0 512 512"
              focusable="false"
              aria-hidden="true"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"></path>
            </svg>
          ) : (
            <svg
              stroke="currentColor"
              fill={theme === "dark" ? "black" : "white"}
              strokeWidth="0"
              viewBox="0 0 512 512"
              focusable="false"
              aria-hidden="true"
              height="1em"
              width="1em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path>
            </svg>
          )}
        </button>
      </div>

      <header>
        <div style={{ marginBottom: "12px" }}>
          <input
            type="text"
            defaultValue={user}
            onChange={(event) => {
              setIsDisabled(false);
              setUser(event.target.value);
            }}
          />
          <button
            type="submit"
            disabled={isDisabled}
            onClick={() => {
              setIsDisabled(true);
              setRefresh(!refresh);
            }}
          >
            View user
          </button>
        </div>

        <div style={{ marginBottom: "12px" }}>
          {Object.keys(years).map((key) => {
            const year = Number(key);
            return (
              <button
                key={year}
                onClick={() => handleClick(year)}
                data-key={year === currentY ? "active" : ""}
              >
                {year} ({years[year].length})
              </button>
            );
          })}
        </div>
      </header>

      <h1>{currentY}</h1>

      {currentPosts.length > 0 && (
        <ul>
          {currentPosts.map((post, index) => {
            const { id, date } = post;
            let text = post.text.replace(/\*+/g, "<hr/>");
            text = text.replace(/<br \/><br \/><br \/>/g, "<br/>");

            return (
              <React.Fragment key={index}>
                <li>
                  <h1>
                    <a
                      name={index}
                      href={`https://cassiopaea.org/forum/goto/post?id=${id}`}
                      target="_blank"
                      title="Go to post"
                    >
                      {format(date, "d MMMM")}
                    </a>
                  </h1>
                  <h2>
                    {index !== 0 && (
                      <>
                        <a href={"#" + Number(index - 1)} title="Previous post">
                          {"< Previous"}
                        </a>
                        {" ... "}
                      </>
                    )}
                    <a href={"#" + Number(index + 1)} title="Next post">
                      {"Next >"}
                    </a>
                  </h2>
                </li>
                <li dangerouslySetInnerHTML={{ __html: text }} />
                <li>
                  <hr />
                </li>
              </React.Fragment>
            );
          })}
        </ul>
      )}
    </main>
  );
}

export default App;
