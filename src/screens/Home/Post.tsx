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
  //const [isShowA, setIsShowA] = useState(true);
  const [isShow, setIsShow] = useState(false);
  const [text, setText] = useState("");
  const [urls, setUrls] = useState<string[]>([]);
  //const [attachments, setAttachments] = useState<string[]>([]);

  useEffect(() => {
    if (Array.isArray(post.attachments) && post.attachments.length > 0) {
      post.attachments = post.attachments.map((attachment) => {
        // let newStr = attachment.replace(
        //   /\/forum/g,
        //   "https://cassiopaea.org/forum",
        // );
        const title = attachment.match(/<title>(.+)<\/title>/);
        const href = attachment.match(/href="\/forum\/attachments\/([^"]+)"/);

        if (
          Array.isArray(title) &&
          title.length > 1 &&
          Array.isArray(href) &&
          href.length > 1
        ) {
          if (href[1].includes("doc"))
            console.log(`https://cassiopaea.org/forum/attachments/${href[1]}`);
          return `<a href="https://cassiopaea.org/forum/attachments/${href[1]}">${title[1]}</a>`;
        }

        return attachment;
      });
    }

    let newText = "" + post.text;
    newText = post.text.replace(/[*]{4}/g, "<hr/>");
    newText = newText.replace(/<br \/><br \/><br \/>/g, "<br/>");

    let matches = newText.match(/"\/forum[^"]+/g);
    if (Array.isArray(matches)) {
      // console.log("🚀 ~ useEfect ~ matches:", matches);
      for (const match of matches) {
        // console.log("🚀 ~ useEffect~ match:", match);
        let replace = `https://cassiopaea.org${match}`;
        replace = replace.replaceAll('"', "");
        // console.log("🚀 ~ useEffect ~ replace:", replace);
        newText = newText.replace(match, replace + " ");
      }
    }

    const urlR = /https?:\/\/[^\s$.?#].[^"\s]*/gi;
    matches = newText.match(urlR);
    if (Array.isArray(matches)) {
      let urls = [];
      for (const val of matches) {
        if (!val.includes("cassiopaea") && !val.includes("joypixels"))
          if (!urls.includes(val)) urls.push(val);
      }
      setUrls(urls);
    }

    // const attachmentR = /\/forum\/attachments\/[^/]+/gi;
    // matches = newText.match(attachmentR);
    // console.log("🚀 ~ useEffect ~ matches:", matches);
    // if (Array.isArray(matches)) {
    //   let attachments = [];
    //   for (const val of matches) {
    //     if (val.includes("attachments"))
    //       if (!attachments.includes(val)) attachments.push(val);
    //   }
    //   setAttachments(attachments);
    // }

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
            marginLeft: "12px",
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

      {Array.isArray(post.attachments) && post.attachments.length > 0 && (
        <>
          <h1>Attachments</h1>
          <p>
            {post.attachments.map((attachment) => (
              <span dangerouslySetInnerHTML={{ __html: attachment }} />
            ))}
          </p>
        </>
      )}

      {/* {Array.isArray(attachments) && attachments.length > 0 && (
        <li>
          <button
            css={css`
              background-color: ${isShowA ? "orange" : "green"};
              margin: ${isShowA ? "24px 0" : "24px 0 0 0"};
            `}
            onClick={() => setIsShowA(!isShowA)}
          >
            {isShowA ? "Hide" : "Show"} attachments
          </button>
          {isShowA && (
            <ol style={{ marginBottom: "12px" }}>
              {attachments.map((url, index) => {
                return (
                  <li key={`url-${index}`}>
                    <a href={`${url}`}>{url}</a>
                  </li>
                );
              })}
            </ol>
          )}
        </li>
      )} */}

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
