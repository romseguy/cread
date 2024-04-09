import "./App.css";
import { Cahiers } from "./Cahiers";
import { ModeToggle } from "./components/mode-toggle";

function App() {
  return (
    <>
      {/* <ModeToggle className="mt-6" /> */}
      <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl my-8">
        Cahiers
      </h1>
      {/* <hr style={{marginTop: 0, marginBottom: "24px" }} /> */}
      <Cahiers />
    </>
  );
}

export default App;
