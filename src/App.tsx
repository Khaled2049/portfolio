import {
  About,
  Experience,
  Projects,
  Contact,
  Footer,
  // Skills,
  Navbar,
} from './components';

function App() {
  return (
    <div className="App bg-bg">
      <Navbar />
      <About />
      <Projects />
      {/* <Skills /> */}
      <Experience />
      <Contact />
      <Footer />
    </div>
  );
}

export default App;
