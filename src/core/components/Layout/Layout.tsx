import { useTheme } from "@hooks/useTheme";
import styled from "@emotion/styled";
import React, { useEffect } from "react";
import { Outlet } from "react-router-dom";
import { NavLink } from "react-router-dom";
//import styles from "./Layout.module.scss";

const StyledLayout = styled.div`
  a {
    font-weight: 500;
    color: #646cff;
    text-decoration: inherit;
  }
  button {
    border-radius: 8px;
    border: 1px solid transparent;
    padding: 0.6em 1.2em;
    font-size: 1em;
    font-weight: 500;
    font-family: inherit;
    background-color: ${(props) => (props.isDark ? "#f9f9f9" : "#1a1a1a")};
    cursor: pointer;
    transition: border-color 0.25s;
  }
  button:hover {
    border-color: $primary;
  }
  button:focus,
  button:focus-visible {
    outline: 4px auto -webkit-focus-ring-color;
  }
  ul {
    list-style-type: none;
    margin: 0;
    padding: 0;
  }
`;

const StyledDiv = styled.div`
  position: fixed;
  top: 36px;
  right: 36px;
`;

const StyledDiv2 = styled.div`
  display: flex;
  align-items: center;
  & > * {
    margin-right: 12px;
  }
`;

const StyledNav = styled.nav`
  border-bottom-width: 10px;
  border-bottom-color: ${(props) => (props.isDark ? "white" : "black")};
  border-bottom-style: solid;
  text-align: center;
`;

const Layout: React.FC<LayoutProps> = (props) => {
  const { theme, setTheme } = useTheme();

  return (
    <StyledLayout isDark={theme === "dark"}>
      {/* fixed top */}
      <StyledDiv>
        <StyledDiv2>
          <a href="https://github.com/romseguy/cread" target="_blank">
            <svg
              stroke="currentColor"
              fill={theme === "dark" ? "white" : "black"}
              strokeWidth="0"
              height="32"
              viewBox="0 0 24 24"
              width="32"
              focusable="false"
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12.5.75C6.146.75 1 5.896 1 12.25c0 5.089 3.292 9.387 7.863 10.91.575.101.79-.244.79-.546 0-.273-.014-1.178-.014-2.142-2.889.532-3.636-.704-3.866-1.35-.13-.331-.69-1.352-1.18-1.625-.402-.216-.977-.748-.014-.762.906-.014 1.553.834 1.769 1.179 1.035 1.74 2.688 1.25 3.349.948.1-.747.402-1.25.733-1.538-2.559-.287-5.232-1.279-5.232-5.678 0-1.25.445-2.285 1.178-3.09-.115-.288-.517-1.467.115-3.048 0 0 .963-.302 3.163 1.179.92-.259 1.897-.388 2.875-.388.977 0 1.955.13 2.875.388 2.2-1.495 3.162-1.179 3.162-1.179.633 1.581.23 2.76.115 3.048.733.805 1.179 1.825 1.179 3.09 0 4.413-2.688 5.39-5.247 5.678.417.36.776 1.05.776 2.128 0 1.538-.014 2.774-.014 3.162 0 .302.216.662.79.547C20.709 21.637 24 17.324 24 12.25 24 5.896 18.854.75 12.5.75Z"></path>
            </svg>
          </a>

          <button
            // title={`Click to toggle ${
            //   theme === "dark" ? "light" : "dark"
            // } mode`}
            //data-key={theme}
            onClick={() =>
              setTheme(
                theme === "dark" || theme === "system" ? "light" : "dark"
              )
            }
          >
            {theme === "dark" || theme === "system" ? (
              <svg
                stroke="currentColor"
                fill={theme === "dark" ? "black" : "white"}
                strokeWidth="0"
                height="1em"
                viewBox="0 0 512 512"
                width="1em"
                focusable="false"
                aria-hidden="true"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M256 160c-52.9 0-96 43.1-96 96s43.1 96 96 96 96-43.1 96-96-43.1-96-96-96zm246.4 80.5l-94.7-47.3 33.5-100.4c4.5-13.6-8.4-26.5-21.9-21.9l-100.4 33.5-47.4-94.8c-6.4-12.8-24.6-12.8-31 0l-47.3 94.7L92.7 70.8c-13.6-4.5-26.5 8.4-21.9 21.9l33.5 100.4-94.7 47.4c-12.8 6.4-12.8 24.6 0 31l94.7 47.3-33.5 100.5c-4.5 13.6 8.4 26.5 21.9 21.9l100.4-33.5 47.3 94.7c6.4 12.8 24.6 12.8 31 0l47.3-94.7 100.4 33.5c13.6 4.5 26.5-8.4 21.9-21.9l-33.5-100.4 94.7-47.3c13-6.5 13-24.7.2-31.1zm-155.9 106c-49.9 49.9-131.1 49.9-181 0-49.9-49.9-49.9-131.1 0-181 49.9-49.9 131.1-49.9 181 0 49.9 49.9 49.9 131.1 0 181z"></path>
              </svg>
            ) : (
              <svg
                stroke="currentColor"
                fill="white"
                strokeWidth="0"
                viewBox="0 0 512 512"
                focusable="false"
                aria-hidden="true"
                height="1em"
                width="1em"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="M283.211 512c78.962 0 151.079-35.925 198.857-94.792 7.068-8.708-.639-21.43-11.562-19.35-124.203 23.654-238.262-71.576-238.262-196.954 0-72.222 38.662-138.635 101.498-174.394 9.686-5.512 7.25-20.197-3.756-22.23A258.156 258.156 0 0 0 283.211 0c-141.309 0-256 114.511-256 256 0 141.309 114.511 256 256 256z"></path>
              </svg>
            )}
          </button>
        </StyledDiv2>
      </StyledDiv>

      <StyledNav>
        <ul>
          <li>
            <NavLink to={"/"}>Home</NavLink>
          </li>
          <li>
            <NavLink to={"about"}>About</NavLink>
          </li>
          <li>
            <NavLink to={"contact"}>Contact</NavLink>
          </li>
        </ul>
      </StyledNav>

      <Outlet />
    </StyledLayout>
  );
};

interface LayoutProps {
  [key: string]: any;
}

export default Layout;
