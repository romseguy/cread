import { useTheme } from "@hooks/useTheme";
import styled from "@emotion/styled";
import useHelmet from "@hooks/useHelmet";
import axios from "axios";
import { isAfter, parseISO, setDayOfYear, setYear } from "date-fns";
import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { IPost } from "./Post";
import { Posts } from "./Posts";
//import styles from "./Home.module.scss";
const ExternalLinkIcon = () => (
  <svg viewBox="0 0 24 24" focusable="false">
    <g
      fill="none"
      stroke="currentColor"
      stroke-linecap="round"
      stroke-width="2"
    >
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
      <path d="M15 3h6v6"></path>
      <path d="M10 14L21 3"></path>
    </g>
  </svg>
);
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const StyledPage = styled.div`
  a {
    text-decoration: underline;
  }
  blockquote,
  code {
    background-color: hsl(var(--blockquote));
    padding: 12px;
    margin-top: 12px;
    margin-bottom: 12px;
    margin-left: 12px;
    text-align: left;
    border-left: 10px solid ${(props) => (props.isDark ? "white" : "black")};
  }
  li > blockquote:first-of-type {
    margin-top: 0px;
  }
  /* div > li:first-of-type {
    padding-bottom: 0px !important;
  } */
  /* button {
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
    */
  button:disabled {
    cursor: not-allowed;
  }
  /*
  button[data-key="light"] {
    background: black;
  }
  button[data-key="dark"] {
    background: white;
  } */
  h1 {
    font-size: 2rem;
    color: purple;
  }
  h2 {
    color: #be23be;
    font-size: 1.5rem;
  }
  h3 {
    color: blue;
    font-size: 1.25rem;
  }
  header {
    text-align: center;
  }
  hr {
    border-top-width: 10px;
    border-color: ${(props) => (props.isDark ? "white" : "black")};
  }
  label {
    color: #be23be;
  }
  main {
    a {
      color: #be23be;
    }
  }
  nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px;
    ul {
      list-style-type: none;
      text-align: left;
    }
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }

  .bbCodeBlock-expandLink {
    display: none;
  }
  .contentRow-minor--hideLinks,
  .js-unfurl-desc,
  .js-unfurl-figure {
    display: none;
  }
`;
const StyledDiv3 = styled.div`
  position: fixed;
  bottom: 36px;
  right: 36px;
`;
const StyledDiv4 = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 0;

  & > * {
    margin-bottom: 12px;
  }

  @media (min-width: 320px) and (max-width: 480px) {
    & > button {
      margin-top: 12px;
    }
    & > input {
      width: 100%;
    }
  }
`;
const StyledDiv5 = styled.div`
  & > * {
    margin-right: 12px;
  }

  button[data-key="active"] {
    cursor: not-allowed;
  }
`;
const StyledDiv6 = styled.div`
  & > * {
    margin-right: 6px;
  }
`;
const StyledHeader = styled.header`
  display: flex;
  flex-direction: column;
  & > * {
    display: flex;
    justify-content: center;
  }
`;
const StyledLink = styled.a`
  display: flex;
  align-items: center;
`;

const d: Record<number, Date> = {
  2010: setYear(setDayOfYear(new Date(), 1), 2010),
  2011: setYear(setDayOfYear(new Date(), 1), 2011),
  2012: setYear(setDayOfYear(new Date(), 1), 2012),
  2013: setYear(setDayOfYear(new Date(), 1), 2013),
  2014: setYear(setDayOfYear(new Date(), 1), 2014),
  2015: setYear(setDayOfYear(new Date(), 1), 2015),
  2016: setYear(setDayOfYear(new Date(), 1), 2016),
  2017: setYear(setDayOfYear(new Date(), 1), 2017),
  2018: setYear(setDayOfYear(new Date(), 1), 2018),
  2019: setYear(setDayOfYear(new Date(), 1), 2019),
  2020: setYear(setDayOfYear(new Date(), 1), 2020),
  2021: setYear(setDayOfYear(new Date(), 1), 2021),
  2022: setYear(setDayOfYear(new Date(), 1), 2022),
  2023: setYear(setDayOfYear(new Date(), 1), 2023),
  2024: setYear(setDayOfYear(new Date(), 1), 2024),
  2025: setYear(setDayOfYear(new Date(), 1), 2025),
};

type Years = Record<number, IPost[]>;
interface IThread {
  url: string;
  title: string;
}

const Home: React.FC<HomeProps> = (_props) => {
  const { theme } = useTheme();
  const [search, setSearch] = useSearchParams();

  const [canPickYear, setCanPickYear] = useState(true);
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
  const [postCount, setPostCount] = useState(0);
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
      url: "https://cassiopaea.org/forum/threads/alton-towers-sir-francis-bacon-and-the-rosicrucians.50391/",
      title: "Alton Towers, Sir Francis Bacon and the Rosicrucians",
    },
    {
      url: "https://cassiopaea.org/forum/threads/language-sounds-and-intelligent-design.50868/",
      title: "Language, Sounds and Intelligent Design",
    },
    {
      url: "https://cassiopaea.org/forum/threads/some-comments-on-information-theory.51198/",
      title: "Some comments on information theory",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-13-january-2024.54173/",
      title: "Session 13 January 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-9-march-2024.54385/",
      title: "Session 9 March 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-13-april-2024.54519/",
      title: "Session 13 April 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-27-april-2024.54602/",
      title: "Session 27 April 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-18-may-2024.54672/",
      title: "Session 18 May 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-6-july-2024.54848",
      title: "Session 6 July 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-17-august-2024.55015/",
      title: "Session 17 August 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-21-september-2024.55160/",
      title: "Session 21 September 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-23-november-2024.55329/",
      title: "Session 23 November 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-21-december-2024.55396/",
      title: "Session 21 December 2024",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-25-january-2025.55484/",
      title: "Session 25 January 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-1-march-2025.55620/",
      title: "Session 1 March 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-29-march-2025.55718/",
      title: "Session 29 March 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-26-april-2025.55829/",
      title: "Session 26 April 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-28-june-2025.56103/",
      title: "Session 28 June 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-23-august-2025.56847/",
      title: "Session 23 August 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-27-september-2025.57008/",
      title: "Session 27 September 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-1-november-2025.57241/",
      title: "Session 1 November 2025",
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-6-december-2025.57461/",
      title: "Session 6 December 2025",
    },
  ]);
  //#endregion

  async function handleLoadAllClick() {
    setCurrentY(undefined);
    if (threadId && threadUrl) {
      setIsSubmitted(true);
      //setIsLoaded(false);
      await axios.get(
        `/api/scrape?id=${threadId}&url=${threadUrl}${
          isForce ? "&force=true" : ""
        }`,
      );
      let res;
      if (process.env.NODE_ENV === "production") {
        res = await fetch("/api/thread?id=" + threadId);
      } else {
        res = await fetch("/" + threadId + ".json");
      }
      const data: { posts: IPost[] } = await res.json();
      setCurrentYearPosts(data.posts);
      setCanPickYear(false);
      setIsLoaded(true);
    }
  }

  async function handleLoadAllByUserClick() {
    setCurrentY(undefined);

    if (threadId && threadUrl) {
      setIsSubmitted(true);
      await axios.get(
        `/api/scrape?id=${threadId}&url=${threadUrl}${
          isForce ? "&force=true" : ""
        }`,
      );

      let res;
      if (process.env.NODE_ENV === "production") {
        res = await fetch("/api/thread?id=" + threadId);
      } else {
        res = await fetch("/" + threadId + ".json");
      }

      const data: { posts: IPost[] } = await res.json();
      const currentUser = user;

      let postCount = 0;
      let posts = [];

      for (const post of data.posts) {
        if (
          !post.text ||
          (currentUser !== "" &&
            currentUser !== "*" &&
            post.user.toLowerCase() !== currentUser.toLowerCase())
        )
          continue;

        posts.push(post);
        postCount++;
      }

      setPostCount(postCount);
      setCurrentYearPosts(posts);
      setCanPickYear(false);
      setIsLoaded(true);
    }
  }

  async function handleLoadClick() {
    setCurrentY(undefined);

    if (threadId && threadUrl) {
      setIsSubmitted(true);
      //setIsLoaded(false);
      await axios.get(
        `/api/scrape?id=${threadId}&url=${threadUrl}${
          isForce ? "&force=true" : ""
        }`,
      );

      let res;
      if (process.env.NODE_ENV === "production") {
        res = await fetch("/api/thread?id=" + threadId);
      } else {
        res = await fetch("/" + threadId + ".json");
      }
      const data: { posts: IPost[] } = await res.json();
      const posts = data.posts;
      //const posts = [...[removeProps(data, ["posts"])], ...data.posts];
      const currentUser = user;
      const newYears: Record<number, Record<string, any>[]> = {
        2010: [],
        2011: [],
        2012: [],
        2013: [],
        2014: [],
        2015: [],
        2016: [],
        2017: [],
        2018: [],
        2019: [],
        2020: [],
        2021: [],
        2022: [],
        2023: [],
        2024: [],
        2025: [],
      };

      let postCount = 0;

      for (const post of posts) {
        if (
          !post.text ||
          (currentUser !== "" &&
            currentUser !== "*" &&
            post.user.toLowerCase() !== currentUser.toLowerCase())
        )
          continue;

        const postYear = Number(post.date.substring(0, 4));
        newYears[postYear].push(post);
        postCount++;
      }

      setPostCount(postCount);
      setYears(newYears as Years);
      setCanPickYear(true);
      setIsLoaded(true);
    }
  }

  async function fetchAndProcess() {}

  function handleYearPick(year: number) {
    setCurrentY(year);

    if (years[year].length > 0) {
      setCurrentYearPosts(years[year]);
      setPostCountByUserName(
        years[year].reduce((acc: Record<string, number>, post) => {
          return {
            ...acc,
            [post.user]: (acc[post.user] || 0) + 1,
          };
        }, {}),
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

  const helmet = useHelmet();

  useEffect(() => {
    helmet.setTitle(`Reader for long Xenforo threads`);
  }, [helmet]);

  return (
    <StyledPage id="top" isDark={theme === "dark"}>
      <header>
        <h1>Reader for long Xenforo threads</h1>
        <h2>Which thread do you want to read?</h2>
      </header>

      {/* STEP 1 : thread selection */}
      <nav>
        {/* Pick a thread */}
        <Row>
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
        </Row>

        {/* Enter thread url */}
        <Row>
          <label>Or enter thread url</label>
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
        </Row>
      </nav>

      {/* STEP 2 : options */}
      {threadUrl && (
        <>
          <hr />

          <StyledHeader>
            <h2 style={{ display: "flex", gap: 7 }}>
              <span
                style={{
                  color: theme === "dark" ? "white" : "black",
                }}
              >
                Thread :
              </span>
              <StyledLink href={threadUrl} target="_blank">
                {threads?.find(({ url }) => url === threadUrl)?.title}
                <ExternalLinkIcon />
              </StyledLink>
            </h2>

            <StyledLink href={threadUrl + "/latest"} target="_blank">
              Go to latest post
              <ExternalLinkIcon />
            </StyledLink>
          </StyledHeader>

          <hr />

          <StyledHeader>
            <h2
              style={{
                color: theme === "dark" ? "white" : "black",
              }}
            >
              Reading options
            </h2>

            {threadUrl && (
              <StyledDiv4>
                <Row
                // enter username
                >
                  <label style={{ marginRight: "12px" }}>Enter username</label>
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
                </Row>

                <Row
                // Remove first post quotes?
                >
                  <label>Remove first post quotes?</label>
                  <input
                    type="checkbox"
                    checked={isRemoveFirstPostQuotes}
                    onChange={() => {
                      setIsRemoveFirstPostQuotes(!isRemoveFirstPostQuotes);
                    }}
                  />
                </Row>

                <Row
                // Download thread again?
                >
                  <label>Download thread again?</label>
                  <input
                    type="checkbox"
                    checked={isForce}
                    onChange={() => {
                      setIsLoaded(false);
                      setIsSubmitted(false);
                      setIsForce(!isForce);
                    }}
                  />
                  <label
                    style={{
                      color: theme === "dark" ? "white" : "black",
                      fontSize: "smaller",
                      fontStyle: "italic",
                    }}
                  >
                    will take longer
                  </label>
                </Row>
              </StyledDiv4>
            )}
          </StyledHeader>

          <hr />
        </>
      )}

      {/* SUBMIT BUTTON : view  all messages */}
      {threadUrl && !isLoaded && (
        <nav>
          <div style={{ margin: "12px" }}>
            <div style={{ textAlign: "center" }}>
              {isSubmitted ? (
                <>
                  {/* <Spinner /> */}
                  Loading messages, please wait...
                </>
              ) : (
                <>
                  {user === "*" && (
                    <button
                      type="submit"
                      data-key={isSubmitted}
                      disabled={isSubmitted}
                      onClick={handleLoadAllClick}
                      style={{ marginRight: "12px" }}
                    >
                      {`${isForce ? "Load" : "View"} all messages`}
                    </button>
                  )}

                  {user !== "*" && (
                    <button
                      type="submit"
                      data-key={isSubmitted}
                      disabled={isSubmitted}
                      onClick={handleLoadAllByUserClick}
                      style={{ marginRight: "12px" }}
                    >
                      {`${
                        isForce ? "Load" : "View"
                      } all messages posted by ${user}`}
                    </button>
                  )}

                  <button
                    type="submit"
                    data-key={isSubmitted}
                    disabled={isSubmitted}
                    onClick={handleLoadClick}
                  >
                    {user !== "*"
                      ? `${
                          isForce ? "Load" : "View"
                        } messages posted by ${user} by year`
                      : `${isForce ? "Load" : "View"} all messages by year`}
                  </button>
                </>
              )}
            </div>
          </div>
        </nav>
      )}

      {/* STEP 3 : pick a year */}
      {isLoaded && canPickYear && (
        <nav>
          <div style={{ textAlign: "center" }}>
            {postCount > 0 ? (
              <>
                <h2>Pick a year</h2>
                <StyledDiv5>
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
                </StyledDiv5>
              </>
            ) : (
              <h2>
                No messages found {user !== "*" && `for username ${user}`}
              </h2>
            )}
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
              <h1>Number of posts by people in {currentY}</h1>
              <StyledDiv6>
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
              </StyledDiv6>
            </nav>
          </div>
        )}

      {isLoaded &&
        (!canPickYear || !!currentY) &&
        currentYearPosts.length > 0 && (
          <Posts
            //elementToScrollRef={elementToScrollRef}
            postCount={postCount}
            user={user}
            currentY={currentY}
            currentYearPosts={currentYearPosts}
            setUser={setUser}
            removeFirstPostQuotes={isRemoveFirstPostQuotes}
          />
        )}

      {/* fixed bottom */}
      <StyledDiv3>
        <a href="#top">
          <svg
            className="top-icon"
            viewBox="0 0 24 24"
            focusable="false"
            stroke="currentColor"
            strokeWidth="0"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill="currentColor"
              d="M12 8l-6 6 1.41 1.41L12 10.83l4.59 4.58L18 14z"
            ></path>
          </svg>
        </a>
      </StyledDiv3>
    </StyledPage>
  );
};

interface HomeProps {
  [key: string]: any;
}

export default Home;
