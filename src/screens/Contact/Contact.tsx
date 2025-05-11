import useHelmet from "@hooks/useHelmet";
import React, { useEffect } from "react";

const Contact: React.FC<ContactProps> = (props) => {
  const helmet = useHelmet();

  useEffect(() => {
    helmet.setTitle("Contact");
  }, [helmet]);

  return (
    <main>
      <p>
        Contact{" "}
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
