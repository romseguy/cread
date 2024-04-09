import "./App.css";
import { Posts } from "./Posts";
// import { ModeToggle } from "./components/mode-toggle";

function App() {
  return (
    <div className="mt-8">
      {/* <ModeToggle className="mt-6" /> */}
      {/* <h1 className="scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl my-8">
        Posts
      </h1> */}
      {/* <hr style={{marginTop: 0, marginBottom: "24px" }} /> */}
      <Posts />
    </div>
  );
}

export default App;
