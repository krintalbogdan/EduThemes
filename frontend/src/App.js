import './App.css';
import LabelModal from "./components/LabelModal";
import FileLoader from "./components/FileLoader";
import Header from "./components/Header";



function App() {

  return (
    <div className="App">
        <Header/>
        <FileLoader />
        <LabelModal/>
    </div>
  );
}

export default App;
