import useHelmet from "@hooks/useHelmet";
import React, { useEffect } from "react";

const Contact: React.FC<ContactProps> = (props) => {
  const helmet = useHelmet();

  useEffect(() => {
    helmet.setTitle("Contact");
  }, [helmet]);

  return (
    <main>
      <h1>Contact</h1>
      <p>
        Send a direct message to{" "}
        <a href="https://cassiopaea.org/forum/direct-messages/add?to=romseguy">
          @romseguy
        </a>{" "}
        on the Cassiopaea Forum.
      </p>
    </main>
  );
};

interface ContactProps {
  [key: string]: any;
}

export default Contact;
