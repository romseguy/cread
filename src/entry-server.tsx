import React from "react";
import ReactDomServer from "react-dom/server";
import { StaticRouter } from "react-router-dom/server";
import App from "./App";

const render = (url: string, _context: any) => {
  const html = ReactDomServer.renderToString(
    <StaticRouter location={url}>
      <App />
    </StaticRouter>
  );

  return { html };
};

const _export = {
  render
};

export default _export;
