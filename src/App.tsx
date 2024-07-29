import { format, isAfter, parseISO, setDayOfYear, setYear } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { css } from "twin.macro";
import { useTheme } from "./components/theme-provider";
import "./App.css";
import { IPost, Post } from "./Post";
import axios from "axios";
//const data = import.meta.glob("./assets/t.json");

const d2021 = setYear(setDayOfYear(new Date(), 1), 2021);
const d2022 = setYear(setDayOfYear(new Date(), 1), 2022);
const d2023 = setYear(setDayOfYear(new Date(), 1), 2023);
const d2024 = setYear(setDayOfYear(new Date(), 1), 2024);

type Years = Record<number, IPost[]>;

function App() {
  const [search, setSearch] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const initialThreadUrl =
    search.get("t") ||
    "https://cassiopaea.org/forum/threads/dreams-of-the-people-on-the-forum.53811/";
  //"https://cassiopaea.org/forum/threads/alton-towers-sir-francis-bacon-and-the-rosicrucians.50391/"
  const [threadUrl, setThreadUrl] = useState(initialThreadUrl);
  const tmatches = threadUrl?.match(/\.([0-9]+)/);
  const threadId = tmatches ? tmatches[1] : undefined;
  const [user, setUser] = useState(search.get("u") || "*");
  useEffect(
    function onChange() {
      setIsLoaded(false);
      setIsSubmitted(!threadUrl);
      setCurrentY(undefined);
    },
    [threadUrl, user]
  );
  const [years, setYears] = useState<Years>({});
  const [currentY, setCurrentY] = useState<number | undefined>();
  let postCountByUserName: Record<string, number> | undefined;
  const currentPosts = useMemo(() => {
    if (currentY) {
      const posts = years[currentY];
      if (user === "*") {
        postCountByUserName = posts.reduce(
          (acc: Record<string, number>, post) => {
            return {
              ...acc,
              [post.user]: (acc[post.user] || 0) + 1
            };
          },
          {}
        );
      }
      return posts;
    }
    return [];
  }, [currentY, years]);
  useEffect(() => {
    if (currentPosts.length > 0) {
      transformDOM();
    }
  }, [currentPosts]);

  async function fetchAndProcess() {
    let res;
    if (process.env.NODE_ENV === "production") {
      res = await fetch("/api/thread?id=" + threadId);
    } else {
      res = await fetch("/" + threadId + ".json");
    }

    const data: { posts: IPost[] } = await res.json();
    let currentUser = user;
    if (currentUser === "*") {
      //currentUser = data.posts[0].user;
      //setUser(data.posts[0].user);
    }
    const newYears: Years = {
      2021: [],
      2022: [],
      2023: [],
      2024: []
    };

    for (const post of data.posts) {
      if (
        currentUser !== "" &&
        currentUser !== "*" &&
        post.user.toLowerCase() !== currentUser.toLowerCase()
      )
        continue;
      if (isAfter(parseISO(post.date), d2024)) newYears[2024].push(post);
      else if (isAfter(parseISO(post.date), d2023)) newYears[2023].push(post);
      else if (isAfter(parseISO(post.date), d2022)) newYears[2022].push(post);
      else if (isAfter(parseISO(post.date), d2021)) newYears[2021].push(post);
    }

    setYears(newYears);
    setIsLoaded(true);
  }

  function transformDOM() {
    //if (!Object.keys(years).length) return;

    const main = document.querySelector("main");
    const node = main || document;

    const divs = node.querySelectorAll("div");
    for (const div of divs) {
      if (div.style["text-align"] === "center") {
        div.style.background = "transparent";
        div.style.padding = 0;
      }
    }

    const imgs = node.querySelectorAll("img");

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

    // const iframes = node.querySelectorAll("iframe");

    // for (let iframe of iframes) {
    //   iframe.style["display"] = "none";
    // }

    const links = node.querySelectorAll("a");

    for (const link of links) {
      if (!link.textContent) continue;
      if (!link.title.includes("post") && !link.title.includes("Go to top"))
        link.target = "_blank";
      if (link.textContent.length > 20) {
        link.textContent = link.textContent?.substring(0, 19) + "...";
      } else if (link.textContent === "Click to expand...")
        link.textContent = "";
      else if (link.href.includes("goto")) {
        const matches = link.href.match(/forum.+/);
        if (matches) {
          link.href = "https://cassiopaea.org/" + matches[0];
        }
      }
    }

    const spans = node.querySelectorAll("span");

    let i = 0;
    for (const span of spans) {
      if (span.style.color === "rgb(0, 0, 0)") span.style.color = "";
      if (span.style.color === "rgb(40, 50, 78)")
        span.style.color = "rgb(135, 163, 239)";
      i++;
    }
  }

  const isLoading = isSubmitted && !isLoaded;
  console.log("🚀 ~ App ~ isLoading:", isLoading);
  return (
    <div
      id="top"
      css={css`
        a {
          text-decoration: underline;
        }
        blockquote {
          background-color: hsl(var(--blockquote));
          padding: 12px;
          margin-bottom: 24px;
          margin-left: 12px;
          text-align: left;
          ${theme === "dark"
            ? "border-left: 10px solid white"
            : "border-left: 10px solid black"};
        }
        button {
          background-color: teal;
          border-radius: 36px;
          color: white;
          font-weight: bold;
          padding: 12px;
        }
        button:hover {
          background: green;
        }
        button[data-key="active"] {
          background: green;
        }
        button[data-key="light"] {
          background: black;
        }
        button[data-key="dark"] {
          background: white;
        }
        h1 {
          font-size: 2rem;
          color: purple;
        }
        h2,
        label {
          color: blue;
          font-size: 1.5rem;
          button {
            background-color: blue;
          }
        }
        hr {
          border-top-width: 10px;
          border-color: ${theme === "dark" ? "white" : "black"};
        }
        input {
          border-width: 1px;
          color: black;
          border-radius: 36px;
          text-align: center;
        }

        nav {
          display: flex;
          flex-direction: column;
        }

        header {
          display: flex;
          flex-direction: column;

          nav {
            input {
              padding: 12px;
            }
            button {
              cursor: pointer;
            }
            button[data-key="disabled"] {
              cursor: not-allowed;
            }
          }
        }

        /*& > ul > li {
          background-color: hsl(var(--card-foreground));
          text-align: left;
          padding: 12px;
          & > button {
            margin: 24px;
          }
          & > div {
            padding: 24px 0;
            margin-bottom: 24px;
          }
        }*/
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
        `}
      >
        <button
          title={`Click to toggle ${theme === "dark" ? "light" : "dark"} mode`}
          data-key={theme}
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
        <div
          style={{
            margin: "0 auto",
            textAlign: "center",
            marginBottom: "12px"
          }}
        >
          <h1>Cassiopaea Forum</h1>
          <h1>Mobile friendly navigator</h1>
        </div>

        <hr />

        <nav style={{ margin: "24px auto" }}>
          <label>Thread url</label>
          <input
            type="text"
            value={threadUrl}
            style={{ margin: "12px 0" }}
            onChange={(event) => {
              setThreadUrl(event.target.value);
            }}
          />
          <button
            style={{ margin: "0 0 24px 0" }}
            onClick={() => {
              setThreadUrl("");
            }}
          >
            Clear
          </button>

          <label>Filter by username?</label>
          <div style={{ display: "flex", margin: "12px 0 24px 0" }}>
            <input
              type="text"
              value={user}
              style={{ marginRight: "12px" }}
              onChange={(event) => {
                setUser(event.target.value);
              }}
            />
            {user !== "*" && (
              <button
                onClick={() => {
                  setUser("*");
                }}
              >
                All users
              </button>
            )}
          </div>

          {!isLoaded && (
            <button
              type="submit"
              data-key={isSubmitted ? "disabled" : "undefined"}
              disabled={isSubmitted}
              style={{
                backgroundColor: "green"
              }}
              onClick={async () => {
                if (threadId && threadUrl) {
                  setIsSubmitted(true);
                  setIsLoaded(false);
                  await axios.get(
                    "/api/scrape?id=" + threadId + "&url=" + threadUrl
                  );
                  await fetchAndProcess();
                }
              }}
            >
              Next
            </button>
          )}

          {isLoading
            ? "Loading ..."
            : isLoaded && (
                <>
                  <label style={{ marginBottom: "12px" }}>Filter by year</label>
                  {Object.keys(years).map((key) => {
                    const year = Number(key);
                    const len = years[year].length;
                    if (!len) return null;
                    return (
                      <button
                        key={year}
                        style={{ marginBottom: "12px", marginRight: "12px" }}
                        onClick={() => setCurrentY(year)}
                        data-key={year === currentY ? "active" : ""}
                      >
                        {year} ({len} post{len > 1 ? "s" : ""})
                      </button>
                    );
                  })}
                </>
              )}
        </nav>
      </header>

      {currentPosts.length > 0 && (
        <>
          <hr />
          <nav>
            {postCountByUserName && (
              <>
                <h1>Users in {currentY}</h1>
                <ol>
                  {Object.keys(postCountByUserName)
                    .sort((userNameA, userNameB) => {
                      const countA = postCountByUserName[userNameA];
                      const countB = postCountByUserName[userNameB];
                      return countA < countB ? 1 : -1;
                    })
                    .map((userName) => {
                      return (
                        <li>
                          <button
                            data-key={user === userName ? "active" : ""}
                            style={{ marginBottom: "12px" }}
                            onClick={() => {
                              if (user === userName) {
                                setUser("");
                              } else {
                                setUser(userName);
                              }
                            }}
                          >
                            {userName} ({postCountByUserName[userName]})
                          </button>
                        </li>
                      );
                    })}
                </ol>
              </>
            )}
          </nav>
        </>
      )}

      {currentPosts.length > 0 && (
        <>
          <hr />

          <nav>
            <h1>
              Posts
              {!!user && user !== "*" ? ` by ${user}` : ""} in {currentY}
            </h1>
            <ul>
              {currentPosts.map((post, index) => {
                return (
                  <li key={`item-${index}`}>
                    <a href={`#${index}`}>
                      <button
                        key={index}
                        style={{
                          marginBottom: "12px",
                          marginRight: "12px"
                        }}
                      >
                        {format(post.date, "d MMMM yyyy")}
                      </button>
                    </a>
                    {(!user || user === "*") && (
                      <>
                        by
                        <button
                          data-key={user === post.user ? "active" : ""}
                          style={{
                            marginBottom: "12px",
                            marginLeft: "12px"
                          }}
                          onClick={() => {
                            if (user === post.user) {
                              setUser("");
                            } else {
                              setUser(post.user);
                            }
                          }}
                        >
                          {post.user}
                          {/* {
                              currentPosts.filter(
                                ({ user }) => user === post.user
                              ).length
                            } */}
                        </button>
                      </>
                    )}
                  </li>
                );
              })}
            </ul>
          </nav>

          <hr />

          <main>
            {currentPosts.length > 0 && (
              <ul>
                {currentPosts.map((post, index) => {
                  return (
                    <React.Fragment key={`post-${index}`}>
                      <Post
                        post={post}
                        index={index}
                        isLast={index === currentPosts.length - 1}
                        setUser={setUser}
                      />
                      <hr />
                    </React.Fragment>
                  );
                })}
              </ul>
            )}
          </main>
        </>
      )}
    </div>
  );
}

export default App;
