import "./App.css";
import MainViewer from "./components/MainViewer";
import SensorPanel from "./components/SensorPanel";

function App() {
  return (
    <div className="app-container">
      <MainViewer />
      <SensorPanel />
    </div>
  );
}

export default App;
