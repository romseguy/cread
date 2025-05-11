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
const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;
const StyledPage = styled.div`
  a {
    text-decoration: underline;
  }
  blockquote {
    background-color: hsl(var(--blockquote));
    padding: 12px;
    margin-bottom: 24px;
    margin-left: 12px;
    text-align: left;
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
    color: purple;
    font-size: 1.5rem;
    button {
      background-color: blue;
    }
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
  input {
    border-width: 1px;
    color: black;
    border-radius: 36px;
    text-align: center;
  }

  nav {
    display: flex;
    flex-direction: column;
    align-items: center;
    text-align: center;
    padding: 12px;
    input {
      padding: 12px;
    }
    label {
      color: purple;
    }
    ul {
      list-style-type: none;
      text-align: left;
    }
  }

  /* nav > div > div > ul {
    list-style-type: none;
    li::before {
      content: "• ";
      color: red;
    }
  } */

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

  font-size: smaller;
  margin: 0 0 12px 0;
  color: blue;
  /* & > * {
    margin-right: 12px;
  } */
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
  & > * {
    margin: 0 auto;
    margin-bottom: 12px;
  }
`;

const d2010 = setYear(setDayOfYear(new Date(), 1), 2010);
const d2011 = setYear(setDayOfYear(new Date(), 1), 2011);
const d2012 = setYear(setDayOfYear(new Date(), 1), 2012);
const d2013 = setYear(setDayOfYear(new Date(), 1), 2013);
const d2014 = setYear(setDayOfYear(new Date(), 1), 2014);
const d2015 = setYear(setDayOfYear(new Date(), 1), 2015);
const d2016 = setYear(setDayOfYear(new Date(), 1), 2016);
const d2017 = setYear(setDayOfYear(new Date(), 1), 2017);
const d2018 = setYear(setDayOfYear(new Date(), 1), 2018);
const d2019 = setYear(setDayOfYear(new Date(), 1), 2019);
const d2020 = setYear(setDayOfYear(new Date(), 1), 2020);
const d2021 = setYear(setDayOfYear(new Date(), 1), 2021);
const d2022 = setYear(setDayOfYear(new Date(), 1), 2022);
const d2023 = setYear(setDayOfYear(new Date(), 1), 2023);
const d2024 = setYear(setDayOfYear(new Date(), 1), 2024);

type Years = Record<number, IPost[]>;
interface IThread {
  url: string;
  title: string;
}

const Home: React.FC<HomeProps> = (_props) => {
  const { theme } = useTheme();
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
      url: "https://cassiopaea.org/forum/threads/alton-towers-sir-francis-bacon-and-the-rosicrucians.50391/",
      title: "Alton Towers, Sir Francis Bacon and the Rosicrucians"
    },
    {
      url: "https://cassiopaea.org/forum/threads/language-sounds-and-intelligent-design.50868/",
      title: "Language, Sounds and Intelligent Design"
    },
    {
      url: "https://cassiopaea.org/forum/threads/some-comments-on-information-theory.51198/",
      title: "Some comments on information theory"
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
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-23-november-2024.55329/",
      title: "Session 23 November 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-21-december-2024.55396/",
      title: "Session 21 December 2024"
    },
    {
      url: "https://cassiopaea.org/forum/threads/session-25-january-2025.55484/",
      title: "Session 25 January 2025"
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
    const posts = data.posts;
    //const posts = [...[removeProps(data, ["posts"])], ...data.posts];
    let currentUser = user;
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
      else if (isAfter(parseISO(post.date), d2020)) newYears[2020].push(post);
      else if (isAfter(parseISO(post.date), d2019)) newYears[2019].push(post);
      else if (isAfter(parseISO(post.date), d2018)) newYears[2018].push(post);
      else if (isAfter(parseISO(post.date), d2017)) newYears[2017].push(post);
      else if (isAfter(parseISO(post.date), d2016)) newYears[2016].push(post);
      else if (isAfter(parseISO(post.date), d2015)) newYears[2015].push(post);
      else if (isAfter(parseISO(post.date), d2014)) newYears[2014].push(post);
      else if (isAfter(parseISO(post.date), d2013)) newYears[2013].push(post);
      else if (isAfter(parseISO(post.date), d2012)) newYears[2012].push(post);
      else if (isAfter(parseISO(post.date), d2011)) newYears[2011].push(post);
      else if (isAfter(parseISO(post.date), d2010)) newYears[2010].push(post);
    }

    setYears(newYears as Years);
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

  const helmet = useHelmet();

  useEffect(() => {
    helmet.setTitle(`Home Page - Vite SSR + React`);
  }, [helmet]);

  return (
    <StyledPage id="top" isDark={theme === "dark"}>
      <header>
        <h1>Cassiopaea Forum</h1>
        <h1>Reader for long threads</h1>
        <hr />
        <h2>Which thread do you want to read?</h2>
        <hr />
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
          </StyledHeader>

          <hr />

          <StyledHeader>
            <h2
              style={{
                color: theme === "dark" ? "white" : "black"
              }}
            >
              Reading options
            </h2>

            {threadUrl && (
              <StyledDiv4>
                <div
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
                </div>

                <div
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
                </div>

                <div
                // Download thread again?
                >
                  <label>Download thread again?</label>
                  <input
                    type="checkbox"
                    checked={isForce}
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
                </div>
              </StyledDiv4>
            )}
          </StyledHeader>

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
        <nav>
          <div style={{ textAlign: "center" }}>
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

      {/* fixed bottom */}
      <StyledDiv3>
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
      </StyledDiv3>
    </StyledPage>
  );
};

interface HomeProps {
  [key: string]: any;
}

export default Home;
