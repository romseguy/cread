import { format, isAfter, parseISO, setDayOfYear, setYear } from "date-fns";
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { css } from "twin.macro";
import { useTheme } from "./components/theme-provider";
import "./App.css";
import { IPost, Post } from "./Post";
import axios from "axios";
//const data = import.meta.glob("./assets/t.json");

const initialThreadUrls = [
  "https://cassiopaea.org/forum/threads/alton-towers-sir-francis-bacon-and-the-rosicrucians.50391",
  "https://cassiopaea.org/forum/threads/session-13-january-2024.54173/",
  "https://cassiopaea.org/forum/threads/session-9-march-2024.54385/",
  "https://cassiopaea.org/forum/threads/session-13-april-2024.54519/",
  "https://cassiopaea.org/forum/threads/session-27-april-2024.54602/",
  "https://cassiopaea.org/forum/threads/session-18-may-2024.54672/",
  "https://cassiopaea.org/forum/threads/session-6-july-2024.54848",
  "https://cassiopaea.org/forum/threads/session-17-august-2024.55015/"
];

const d2021 = setYear(setDayOfYear(new Date(), 1), 2021);
const d2022 = setYear(setDayOfYear(new Date(), 1), 2022);
const d2023 = setYear(setDayOfYear(new Date(), 1), 2023);
const d2024 = setYear(setDayOfYear(new Date(), 1), 2024);

type Years = Record<number, IPost[]>;
interface IThread {
  url: string;
  title: string;
}

function App() {
  const [search, setSearch] = useSearchParams();
  const { theme, setTheme } = useTheme();
  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const initialThreadUrl = search.get("t") || "";
  const [threadUrl, setThreadUrl] = useState(initialThreadUrl);
  const tmatches = threadUrl?.match(/\.([0-9]+)/);
  const threadId = tmatches ? tmatches[1] : undefined;
  const [user, setUser] = useState(search.get("u") || "*");
  useEffect(
    function onChange() {
      setIsLoaded(false);
      setIsSubmitted(false);
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
  }

  function transformDOM() {
    //if (!Object.keys(years).length) return;

    const main = document.querySelector("main");
    const node = main || document;

    const divs = node.querySelectorAll("div");
    for (const div of divs) {
      //@ts-expect-error
      if (div.style["text-align"] === "center") {
        div.style.background = "transparent";
        //@ts-expect-error
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
      const exclude = link.title.includes("Click to go to top");

      if (!link.textContent) continue;
      if (!link.title.includes("post") && !exclude) link.target = "_blank";
      if (link.textContent.length > 20 && !exclude) {
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

  const [isThreadsLoading, setIsThreadsLoading] = useState(true);
  const [threads, setThreads] = useState<IThread[] | undefined>();
  useEffect(() => {
    (async () => {
      if (!threads) {
        let arr: IThread[] = [];
        for (const url of initialThreadUrls) {
          const { data } = await axios.get("/api/html?url=" + url);
          if (data?.html) {
            const doc = new DOMParser().parseFromString(data.html, "text/html");
            const title = doc.querySelectorAll("title")[0].innerText;
            arr = [...arr, ...[{ url, title }]];
          }
        }
        setThreads(arr);
        setIsThreadsLoading(false);
      }
    })();
  }, [threads]);

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
        <div
          css={css`
            display: flex;
            align-items: center;
            & > * {
              margin-right: 12px;
            }
          `}
        >
          <a href="https://github.com/romseguy/cread" target="_blank">
            <svg height="32" viewBox="0 0 24 24" width="32">
              <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
            </svg>
          </a>
          <button
            title={`Click to toggle ${
              theme === "dark" ? "light" : "dark"
            } mode`}
            data-key={theme}
            onClick={() =>
              setTheme(
                theme === "dark" || theme === "system" ? "light" : "dark"
              )
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
                fill="white"
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
          <label>Pick a thread</label>
          {isThreadsLoading ? (
            "Loading thread selection by @romseguy"
          ) : (
            <ul style={{ listStyleType: "square", margin: "12px 0 24px 0" }}>
              {(threads || []).map(({ url, title }, index) => {
                return (
                  <li key={index}>
                    <a
                      style={{ cursor: "pointer" }}
                      onClick={() => setThreadUrl(url)}
                    >
                      {title}
                    </a>
                  </li>
                );
              })}
            </ul>
          )}

          <div
            css={css`
              display: flex;
              align-items: center;

              @media (min-width: 481px) {
                margin-bottom: 24px;
                & > * {
                  margin-right: 12px;
                }
              }

              @media (max-width: 480px) {
                flex-direction: column;
                margin-bottom: 24px;

                & > button {
                  margin-top: 12px;
                }
                & > input {
                  width: 100%;
                }
              }
            `}
          >
            <label style={{ color: theme === "dark" ? "white" : "black" }}>
              Or:
            </label>
            <label>enter thread url</label>
            <input
              type="text"
              value={threadUrl}
              onChange={(event) => {
                setThreadUrl(event.target.value);
              }}
            />
            {threadUrl && (
              <button
                onClick={() => {
                  setThreadUrl("");
                }}
              >
                Clear
              </button>
            )}
          </div>

          {threadUrl && (
            <>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  margin: "0 0 24px 0"
                }}
                css={css`
                  @media (min-width: 320px) and (max-width: 480px) {
                    flex-direction: column;
                    & > button {
                      margin-top: 12px;
                    }
                    & > input {
                      width: 100%;
                    }
                  }
                `}
              >
                <label
                  style={{
                    color: theme === "dark" ? "white" : "black",
                    marginRight: "12px"
                  }}
                >
                  Optional:
                </label>
                <label style={{ marginRight: "12px" }}> enter username</label>
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
                    Clear
                  </button>
                )}
              </div>

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
                    setIsLoaded(true);
                  }
                }}
              >
                {user !== "*"
                  ? "Load messages by " + user
                  : "Load all messages"}
              </button>
            </>
          )}

          {!isLoaded && isSubmitted && <>Loading messages, please wait...</>}

          {isLoaded && (
            <div
              css={css`
                margin-top: 12px;

                & > * {
                  margin-right: 12px;
                }

                button[data-key="active"] {
                  cursor: not-allowed;
                }
              `}
            >
              <label>Pick a year</label>
              {Object.keys(years).map((key) => {
                const year = Number(key);
                const isActive = year === currentY;
                const len = years[year].length;
                if (!len) return null;
                return (
                  <button
                    disabled={isActive}
                    key={year}
                    style={{ marginBottom: "12px", marginRight: "12px" }}
                    onClick={() => setCurrentY(year)}
                    data-key={isActive ? "active" : ""}
                  >
                    {year} ({len} post{len > 1 ? "s" : ""})
                  </button>
                );
              })}
            </div>
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
                      //@ts-expect-error
                      const countA = postCountByUserName[userNameA];
                      //@ts-expect-error
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
                            {/* @ts-expect-error */}
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

          <nav id="posts">
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
                        user={user}
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
