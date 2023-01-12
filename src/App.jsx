import {
  About,
  Experience,
  Navbar,
  Projects,
  Contact,
  Footer,
  Skills,
} from "./components";

function App() {
  return (
    <div className="App">
      <Navbar />
      <About />
      <Projects />
      <Skills />
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
