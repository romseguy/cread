import { format } from "date-fns";
import React, { useEffect } from "react";
import { useScroll } from "./lib/useScroll";
import { IPost, Post } from "./Post";

export const Posts = ({
  //elementToScrollRef,
  user,
  currentY,
  currentPosts,
  setUser
}: {
  //elementToScrollRef: React.LegacyRef<HTMLDivElement>;
  user: string;
  currentY: number;
  currentPosts: IPost[];
  setUser: React.Dispatch<React.SetStateAction<string>>;
}) => {
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
  }, []);
  return (
    <>
      <hr />

      <nav id="posts" ref={elementToScrollRef}>
        {currentPosts.length > 1 && (
          <>
            <h1>
              All posts
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
            <hr />
          </>
        )}
      </nav>

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
                    showBackButton={index > 0 && currentPosts.length > 1}
                  />
                  <hr />
                </React.Fragment>
              );
            })}
          </ul>
        )}
      </main>
    </>
  );
};
