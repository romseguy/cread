import { format } from "date-fns";
import React, { useEffect } from "react";
import { useScroll } from "@lib/useScroll";
import { IPost, Post } from "./Post";
import { useTheme } from "@hooks/useTheme";

export const Posts = ({
  //elementToScrollRef,
  postCount,
  user,
  currentY,
  currentYearPosts,
  setUser,
  removeFirstPostQuotes = false,
}: {
  //elementToScrollRef: React.LegacyRef<HTMLDivElement>;
  user: string;
  postCount?: number;
  currentY?: number;
  currentYearPosts: IPost[];
  setUser: React.Dispatch<React.SetStateAction<string>>;
  removeFirstPostQuotes?: boolean;
}) => {
  const { theme } = useTheme();
  const [executeScroll, elementToScrollRef] = useScroll<HTMLDivElement>();

  useEffect(() => {
    transformDOM();
    executeScroll();

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

      if (removeFirstPostQuotes) {
        const blockquotes = node.querySelectorAll("blockquote");
        for (const blockquote of blockquotes) {
          if (
            blockquote.getAttribute("data-source") ===
            `post: ${currentYearPosts[0].id}`
          ) {
            blockquote.remove();
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
  }, [removeFirstPostQuotes]);

  return (
    <>
      <nav id="posts" ref={elementToScrollRef}>
        {currentYearPosts.length > 1 && (
          <div style={{ margin: "12px" }}>
            <h1>
              {!!user && user !== "*"
                ? `${postCount} posts by ${user}`
                : currentY
                ? `Posts in ${currentY ? currentY + " " : ""}`
                : "All posts"}
            </h1>
            <ul>
              {currentYearPosts.map((post, index) => {
                if (user && user !== "*" && user !== post.user) return null;
                return (
                  <li key={`item-${index}`}>
                    <a href={`#${index}`}>
                      <button
                        key={index}
                        style={{
                          marginBottom: "12px",
                          marginRight: "12px",
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
                            marginLeft: "12px",
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
                              currentYearPosts.filter(
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
          </div>
        )}
      </nav>

      <main>
        {currentYearPosts.length > 0 && (
          <ul>
            {currentYearPosts.map((post, index) => {
              if (user && user !== "*" && user !== post.user) return null;
              return (
                <React.Fragment key={`post-${index}`}>
                  <Post
                    post={post}
                    index={index}
                    isLast={index === currentYearPosts.length - 1}
                    user={user}
                    setUser={setUser}
                    showBackButton={index > 0 && currentYearPosts.length > 1}
                    style={{
                      padding: "1px 12px 12px 12px",
                      background:
                        theme === "dark"
                          ? index % 2 === 0
                            ? "rgba(255,255,255,0.2)"
                            : "rgba(255,255,255,0.1)"
                          : index % 2 === 0
                          ? "rgba(0,0,0,0.2)"
                          : "rgba(0,0,0,0.1)",
                    }}
                  />
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
};
