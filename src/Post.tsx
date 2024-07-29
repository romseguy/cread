import { format } from "date-fns";
import React, { useState } from "react";
import { css } from "twin.macro";
import "./App.css";

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
  setUser
}: {
  post: IPost;
  index: number;
  isLast: boolean;
  setUser: (value: React.SetStateAction<string>) => void;
}) => {
  const [isShow, setIsShow] = useState(false);
  const { id, date } = post;
  let text = post.text.replace(/\*+/g, "<hr/>");
  text = text.replace(/<br \/><br \/><br \/>/g, "<br/>");
  const urlR = /https?:\/\/[^\s$.?#].[^"\s]*/gi;
  let arr = text.match(urlR);
  arr = arr?.reduce((acc, val, index) => {
    if (!acc.includes(val)) {
      acc.push(val);
    }
    return acc;
  }, []);

  return (
    <div style={{ padding: "24px" }}>
      <li style={{ paddingBottom: "24px" }}>
        <h2 style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {index !== 0 && (
              <a
                href={"#" + Number(index - 1)}
                title="Click to go to previous post"
              >
                <button style={{ marginRight: "24px" }}>{"<"} Previous</button>
              </a>
            )}
            {!isLast && (
              <a
                href={"#" + Number(index + 1)}
                title="Click to go to next post"
              >
                <button>Next {">"}</button>
              </a>
            )}
          </div>

          <div>
            <a href={"#top"} title="Click to go to top">
              <button>Back to top ^</button>
            </a>
          </div>
        </h2>
        <h1 style={{ margin: "24px 0" }}>
          <a
            name={index}
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
      {Array.isArray(arr) && (
        <li>
          <button
            css={css`
              background-color: ${isShow ? "orange" : "green"};
              margin: ${isShow ? "24px 0" : "24px 0 0 0"};
            `}
            onClick={() => setIsShow(!isShow)}
          >
            {isShow ? "Hide" : "Show"} footnotes
          </button>
          {isShow && (
            <ol style={{ marginBottom: "12px" }}>
              {arr.map((url, index) => {
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
