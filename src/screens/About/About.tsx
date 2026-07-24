import useHelmet from "@hooks/useHelmet";
import React, { useEffect } from "react";

const About: React.FC<AboutProps> = (props) => {
  const helmet = useHelmet();

  useEffect(() => {
    helmet.setTitle("About");
  }, [helmet]);

  return (
    <main>
      <h1>About</h1>
      <p>
        Help improve this reading tool by sending a message to{" "}
        <a href="https://cassiopaea.org/forum/direct-messages/add?to=romseguy">
          @romseguy
        </a>{" "}
        on the Cassiopaea Forum.
      </p>
      <h2>Todo</h2>
      <ul>
        <li>Set the title according to current thread</li>
      </ul>
    </main>
  );
};

interface AboutProps {
  [key: string]: any;
}

export default About;
