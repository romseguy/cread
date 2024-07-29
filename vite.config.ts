import * as path from "node:path";
import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load env file based on `mode` in the current working directory.
  // Set the third parameter to '' to load all env regardless of the `VITE_` prefix.
  const env = loadEnv(mode, process.cwd(), "");
  console.log(JSON.stringify(env.APP_ENV));

  return {
    define: {
      __APP_ENV__: JSON.stringify(env.APP_ENV)
    },
    server: {
      port: 7000
    },
    plugins: [
      react({
        babel: {
          plugins: [
            "babel-plugin-macros",
            [
              "@emotion/babel-plugin-jsx-pragmatic",
              {
                export: "jsx",
                import: "__cssprop",
                module: "@emotion/react"
              }
            ],
            [
              "@babel/plugin-transform-react-jsx",
              { pragma: "__cssprop" },
              "twin.macro"
            ]
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src")
      }
    }
  };
});
