import { format } from "date-fns";
import React, { useEffect, useState } from "react";
import { css } from "@emotion/react";

export interface IPost {
  id: number;
  date: string;
  text: string;
  user: string;
  user_id: number;
}

export const Post = ({
  post,
  index,
  isLast,
  user,
  setUser,
  showBackButton = true,
  ...props
}: {
  post: IPost;
  index: number;
  isLast: boolean;
  user: string;
  setUser: (value: React.SetStateAction<string>) => void;
  showBackButton?: boolean;
}) => {
  const [isShow, setIsShow] = useState(false);
  const [text, setText] = useState("");
  const [urls, setUrls] = useState<string[]>([]);

  useEffect(() => {
    let newText = "" + post.text;
    newText = post.text.replace(/[*]{4}/g, "<hr/>");
    newText = newText.replace(/<br \/><br \/><br \/>/g, "<br/>");

    const matches = newText.match(/\"\/forum[^"]+/g);
    if (Array.isArray(matches)) {
      console.log("🚀 ~ useEfect ~ matches:", matches);
      for (const match of matches) {
        console.log("🚀 ~ useEffect~ match:", match);
        let replace = `https://cassiopaea.org${match}`;
        replace = replace.replaceAll('"', "");
        console.log("🚀 ~ useEffect ~ replace:", replace);
        newText = newText.replace(match, replace + " ");
      }
    }

    const urlR = /https?:\/\/[^\s$.?#].[^"\s]*/gi;
    const needles = newText.match(urlR);
    if (Array.isArray(needles)) {
      setUrls(
        needles.reduce<string[]>((acc, val, index) => {
          if (
            !acc.includes(val) &&
            !val.includes("cassiopaea") &&
            !val.includes("joypixels")
          ) {
            acc.push(val);
          }
          return acc;
        }, [])
      );
    }

    setText(newText);
  }, []);

  const { id, date } = post;

  if (!text) return "";

  return (
    <div {...props}>
      <li>
        <a name={index} />
        <h2 style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {/* Previous */}
            {index !== 0 && (
              <a
                href={"#" + Number(index - 1)}
                title="Click to go to previous post"
              >
                <button style={{ marginRight: "24px" }}>{"<"} Previous</button>
              </a>
            )}
            {/* Next */}
            {!isLast && (
              <a
                href={"#" + Number(index + 1)}
                title="Click to go to next post"
              >
                <button>Next {">"}</button>
              </a>
            )}
          </div>

          {showBackButton && (
            <div>
              <a href={"#posts"} title="Click to go to top">
                <button>
                  {user !== "*"
                    ? "Back to posts by " + user
                    : "Back to posts list"}
                </button>
              </a>
            </div>
          )}
        </h2>
        <h1 style={{ margin: "24px 0" }}>
          <a
            href={`https://cassiopaea.org/forum/goto/post?id=${id}`}
            target="_blank"
            title="Go to post"
          >
            {format(date, "d MMMM yyyy")}
          </a>
        </h1>
        by
        <button
          title="Click to filter by this username"
          style={{
            marginBottom: "12px",
            marginLeft: "12px"
          }}
          onClick={() => {
            setUser(post.user);
            // if (user === post.user) {
            //   setUser("");
            // } else {
            // }
          }}
        >
          {post.user}
        </button>
      </li>
      <li dangerouslySetInnerHTML={{ __html: text }} />
      {Array.isArray(urls) && urls.length > 0 && (
        <li>
          <button
            css={css`
              background-color: ${isShow ? "orange" : "green"};
              margin: ${isShow ? "24px 0" : "24px 0 0 0"};
            `}
            onClick={() => setIsShow(!isShow)}
          >
            {isShow ? "Hide" : "Show"} external links
          </button>
          {isShow && (
            <ol style={{ marginBottom: "12px" }}>
              {urls.map((url, index) => {
                return (
                  <li key={`url-${index}`}>
                    <a href={`${url}`}>{url}</a>
                  </li>
                );
              })}
            </ol>
          )}
        </li>
      )}
    </div>
  );
};
