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
  isLast
}: {
  post: IPost;
  index: number;
  isLast: boolean;
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
        <h1>
          <a
            name={index}
            href={`https://cassiopaea.org/forum/goto/post?id=${id}`}
            target="_blank"
            title="Go to post"
          >
            {format(date, "d MMMM yyyy")}
          </a>
        </h1>
        <h2 style={{ display: "flex", justifyContent: "space-between" }}>
          <div>
            {index !== 0 && (
              <a href={"#" + Number(index - 1)} title="Previous post">
                <button style={{ marginRight: "24px" }}>{"<"} Previous</button>
              </a>
            )}
            {!isLast && (
              <a href={"#" + Number(index + 1)} title="Next post">
                <button>Next {">"}</button>
              </a>
            )}
          </div>

          <div>
            <a href={"#top"} title="Go to top">
              <button>^</button>
            </a>
          </div>
        </h2>
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
