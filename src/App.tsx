import axios from "axios";
import { isAfter, parseISO, setDayOfYear, setYear } from "date-fns";
import React, { useState } from "react";
import { useSearchParams } from "react-router-dom";
import { css, styled } from "twin.macro";
import "./App.css";
import { useTheme } from "./components/theme-provider";
import { removeProps } from "./lib/utils";
import { IPost } from "./Post";
import { Posts } from "./Posts";
//const data = import.meta.glob("./assets/t.json");

const FormControl = styled.div`
  font-size: smaller;
  display: flex;
  align-items: center;
  margin: 0 0 12px 0;
  color: blue;
  & > * {
    margin-right: 12px;
  }
  & > input {
    padding: 12px;
  }
  @media (min-width: 320px) and (max-width: 480px) {
    flex-direction: column;
    & > button {
      margin-top: 12px;
    }
    & > input {
      width: 100%;
    }
  }
`;

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
  const { theme, setTheme } = useTheme();
  const [search, setSearch] = useSearchParams();

  const [isLoaded, setIsLoaded] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  //#region field : enter thread url
  const initialThreadUrl = search.get("t") || "";
  const [threadUrl, setThreadUrl] = useState(initialThreadUrl);
  const tmatches = threadUrl?.match(/\.([0-9]+)/);
  const threadId = tmatches ? tmatches[1] : undefined;
  //#endregion

  //#region field : download thread again
  const [isForce, setIsForce] = useState(false);
  const [isRemoveFirstPostQuotes, setIsRemoveFirstPostQuotes] = useState(false);
  //#endregion

  //#region field : enter username
  const [user, setUser] = useState(search.get("u") || "*");
  //#endregion

  //#region filter : year
  const [years, setYears] = useState<Years>({});
  const [currentY, setCurrentY] = useState<number | undefined>();
  const [currentYearPosts, _setCurrentYearPosts] = useState<IPost[]>([]);
  const setCurrentYearPosts = (posts: IPost[]) => {
    console.log("setting current posts", posts.length);
    _setCurrentYearPosts(posts);
  };
  //#endregion

  //#region filter : user
  const [postCountByUserName, setPostCountByUserName] = useState<
    Record<string, number>
  >({});
  //#endregion

  //#region load messages
  const [isThreadsLoading, setIsThreadsLoading] = useState(false);
  const [threads, setThreads] = useState<IThread[] | undefined>([
    {
      url: "https://cassiopaea.org/forum/threads/alton-towers-sir-francis-bacon-and-the-rosicrucians.50391",
      title: "Alton Towers, Sir Francis Bacon and the Rosicrucians"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-13-january-2024.54173/",
      title: "Session 13 January 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-9-march-2024.54385/",
      title: "Session 9 March 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-13-april-2024.54519/",
      title: "Session 13 April 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-27-april-2024.54602/",
      title: "Session 27 April 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-18-may-2024.54672/",
      title: "Session 18 May 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-6-july-2024.54848",
      title: "Session 6 July 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-17-august-2024.55015/",
      title: "Session 17 August 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-21-september-2024.55160/",
      title: "Session 21 September 2024"
    }
  ]);
  //#endregion

  async function handleLoadClick() {
    setCurrentY(undefined);

    if (threadId && threadUrl) {
      setIsSubmitted(true);
      //setIsLoaded(false);
      await axios.get(
        `/api/scrape?id=${threadId}&url=${threadUrl}${
          isForce ? "&force=true" : ""
        }`
      );
      await fetchAndProcess();
      setIsLoaded(true);
    }
  }

  async function fetchAndProcess() {
    let res;
    if (process.env.NODE_ENV === "production") {
      res = await fetch("/api/thread?id=" + threadId);
    } else {
      res = await fetch("/" + threadId + ".json");
    }

    const data: { posts: IPost[] } = await res.json();
    const posts = [...[removeProps(data, ["posts"])], ...data.posts];
    let currentUser = user;
    const newYears: Years = {
      2021: [],
      2022: [],
      2023: [],
      2024: []
    };

    for (const post of posts) {
      if (
        !post.text ||
        (currentUser !== "" &&
          currentUser !== "*" &&
          post.user.toLowerCase() !== currentUser.toLowerCase())
      )
        continue;
      if (isAfter(parseISO(post.date), d2024)) newYears[2024].push(post);
      else if (isAfter(parseISO(post.date), d2023)) newYears[2023].push(post);
      else if (isAfter(parseISO(post.date), d2022)) newYears[2022].push(post);
      else if (isAfter(parseISO(post.date), d2021)) newYears[2021].push(post);
    }

    setYears(newYears);
  }

  function handleYearPick(year: number) {
    setCurrentY(year);

    if (years[year].length > 0) {
      setCurrentYearPosts(years[year]);
      setPostCountByUserName(
        years[year].reduce((acc: Record<string, number>, post) => {
          return {
            ...acc,
            [post.user]: (acc[post.user] || 0) + 1
          };
        }, {})
      );
    } else console.log("no posts found for year: ", year);
  }

  async function handleLoadUserClick(userName: string) {
    setIsLoaded(false);
    setIsSubmitted(false);
    if (user === userName) {
      setUser("");
    } else {
      setUser(userName);
      //setIsLoaded(true);
    }
  }

  // useEffect(() => {
  //   if (currentYearPosts.length > 0) {
  //     if (user === "*") {
  //       setPostCountByUserName(
  //         currentYearPosts.reduce((acc: Record<string, number>, post) => {
  //           return {
  //             ...acc,
  //             [post.user]: (acc[post.user] || 0) + 1
  //           };
  //         }, {})
  //       );
  //     }
  //   }
  // }, [currentYearPosts, user]);
  // useEffect(() => {
  //   if (currentY) {
  //     if (years[currentY].length > 0) {
  //       setCurrentYearPosts(years[currentY]);
  //     }
  //   }
  // }, [currentY, years]);
  // useEffect(() => {
  //   setIsLoaded(false);
  //   setIsSubmitted(false);
  //   setCurrentY(undefined);
  //   setYears({});
  //   setCurrentYearPosts([]);
  // }, [threadUrl, isForce]);

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
        button:disabled {
          cursor: not-allowed;
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
        h2 {
          color: blue;
          font-size: 1.5rem;
          button {
            background-color: blue;
          }
        }
        h3 {
          color: blue;
          font-size: 1.25rem;
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
            button:not([disabled]) {
              cursor: pointer;
            }
          }
        }

        nav > div > ul {
          list-style-type: none;
          li::before {
            content: "• ";
            color: red;
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
      {/* fixed top */}
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

      {/* fixed bottom */}
      <div
        css={css`
          position: fixed;
          bottom: 36px;
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
          <a href="#top">
            <svg
              viewBox="0 0 24 24"
              focusable="false"
              stroke="currentColor"
              fill="white"
              strokeWidth="0"
              aria-hidden="true"
              height="5em"
              width="5em"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill="currentColor"
                d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
              ></path>
            </svg>
          </a>
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
        <h2 style={{ margin: "24px auto" }}>
          Which thread do you want to read?
        </h2>
        <hr />
      </header>

      {/* STEP 1 : thread selection */}
      <nav style={{ padding: "12px" }}>
        <div style={{ margin: "0 auto" }}>
          {/* Pick a thread */}
          <FormControl>
            <label>Pick a thread</label>
            {isThreadsLoading ? (
              "Loading thread selection by @romseguy"
            ) : (
              <ul>
                {(threads || []).map(({ url, title }, index) => {
                  return (
                    <li key={index}>
                      <a
                        style={{ cursor: "pointer" }}
                        onClick={() => {
                          setIsLoaded(false);
                          setIsSubmitted(false);
                          setThreadUrl(url);
                        }}
                      >
                        {title}
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </FormControl>

          {/* Enter thread url */}
          <FormControl>
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
                  setIsLoaded(false);
                  setIsSubmitted(false);
                  setThreadUrl("");
                }}
              >
                Clear
              </button>
            )}
          </FormControl>
        </div>
      </nav>

      {/* STEP 2 : options */}
      {threadUrl && (
        <>
          <hr />

          <header
            css={css`
              & > * {
                margin: 0 auto;
                margin-bottom: 12px;
              }
            `}
          >
            <h2 style={{ margin: "24px auto" }}>
              <span
                style={{
                  color: theme === "dark" ? "white" : "black"
                }}
              >
                Thread :
              </span>{" "}
              {threads?.find(({ url }) => url === threadUrl)?.title}
            </h2>
          </header>

          <hr />

          <header
            css={css`
              & > * {
                margin: 12px auto;
              }
            `}
          >
            <h2
              style={{
                color: theme === "dark" ? "white" : "black"
              }}
            >
              Reading options
            </h2>

            {threadUrl && (
              <div style={{ textAlign: "left" }}>
                <>
                  <FormControl
                  // enter username
                  >
                    <label style={{ marginRight: "12px" }}>
                      Enter username
                    </label>
                    <input
                      type="text"
                      value={user}
                      style={{ marginRight: "12px" }}
                      onChange={(event) => {
                        setIsLoaded(false);
                        setIsSubmitted(false);
                        setUser(event.target.value);
                      }}
                    />
                    {user !== "*" && (
                      <button
                        onClick={() => {
                          setIsLoaded(false);
                          setIsSubmitted(false);
                          setUser("*");
                        }}
                      >
                        Clear
                      </button>
                    )}
                  </FormControl>

                  <FormControl
                  // Remove first post quotes?
                  >
                    <label>Remove first post quotes?</label>
                    <input
                      type="checkbox"
                      value={isRemoveFirstPostQuotes}
                      onChange={() => {
                        setIsRemoveFirstPostQuotes(!isRemoveFirstPostQuotes);
                      }}
                    />
                  </FormControl>

                  <FormControl
                  // Download thread again?
                  >
                    <label>Download thread again?</label>
                    <input
                      type="checkbox"
                      value={isForce}
                      onChange={() => {
                        setIsForce(!isForce);
                      }}
                    />
                    <label
                      style={{
                        color: theme === "dark" ? "white" : "black"
                      }}
                    >
                      (will take longer)
                    </label>
                  </FormControl>
                </>
              </div>
            )}
          </header>

          <hr />
        </>
      )}

      <nav>
        <div style={{ margin: "12px" }}>
          {/* view  all messages */}
          {threadUrl && !isLoaded && (
            <div style={{ textAlign: "center" }}>
              <button
                type="submit"
                data-key={isSubmitted}
                disabled={isSubmitted}
                style={{
                  backgroundColor: "green",
                  marginBottom: "24px"
                }}
                onClick={handleLoadClick}
              >
                {isSubmitted
                  ? "Loading messages, please wait..."
                  : user !== "*"
                  ? `${isForce ? "Load" : "View"} messages by ${user}`
                  : `${isForce ? "Load" : "View"} all messages`}
              </button>
            </div>
          )}
        </div>
      </nav>

      {/* STEP 3 : pick a year */}
      {isLoaded && (
        <nav style={{ margin: 0 }}>
          <div style={{ textAlign: "center" }}>
            <h2>Pick a year</h2>
            <div
              css={css`
                & > * {
                  margin-right: 12px;
                }

                button[data-key="active"] {
                  cursor: not-allowed;
                }
              `}
            >
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
                    onClick={() => {
                      handleYearPick(year);
                    }}
                    data-key={isActive ? "active" : ""}
                  >
                    {year} ({len} post{len > 1 ? "s" : ""})
                  </button>
                );
              })}
            </div>
          </div>
        </nav>
      )}

      {/* STEP 4 : pick a message */}
      {isLoaded &&
        currentY &&
        user === "*" &&
        currentYearPosts.length > 0 &&
        Object.keys(postCountByUserName).length > 0 && (
          <div>
            <nav>
              <h1>People who posted a message in {currentY}</h1>
              <div
                css={css`
                  & > * {
                    margin-right: 6px;
                  }
                `}
              >
                {Object.keys(postCountByUserName)
                  .sort((userNameA, userNameB) => {
                    const countA = postCountByUserName[userNameA];
                    const countB = postCountByUserName[userNameB];
                    return countA < countB ? 1 : -1;
                  })
                  .map((userName, index) => {
                    return (
                      <button
                        key={`user-${index}`}
                        data-key={user === userName ? "active" : ""}
                        style={{ marginBottom: "12px" }}
                        onClick={() => {
                          handleLoadUserClick(userName);
                        }}
                      >
                        {userName} ({postCountByUserName[userName]})
                      </button>
                    );
                  })}
              </div>
            </nav>
          </div>
        )}

      {isLoaded && currentY && currentYearPosts.length > 0 && (
        <Posts
          //elementToScrollRef={elementToScrollRef}
          user={user}
          currentY={currentY}
          currentYearPosts={currentYearPosts}
          setUser={setUser}
          removeFirstPostQuotes={isRemoveFirstPostQuotes}
        />
      )}
    </div>
  );
}

export default App;

// useEffect(() => {
//   (async () => {
//     if (!threads) {
//       let arr: IThread[] = [];
//       for (const url of initialThreadUrls) {
//         const { data } = await axios.get("/api/html?url=" + url);
//         if (data?.html) {
//           const doc = new DOMParser().parseFromString(data.html, "text/html");
//           const title = doc.querySelectorAll("title")[0].innerText;
//           arr = [...arr, ...[{ url, title }]];
//         }
//       }
//       setThreads(arr);
//       setIsThreadsLoading(false);
//     }
//   })();
// }, [threads]);
