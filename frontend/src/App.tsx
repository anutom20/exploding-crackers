import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import CreateRoom from "./components/CreateRoom";
import JoinRoom from "./components/JoinRoom";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<CreateRoom />} />
        <Route path="/join/:roomId" element={<JoinRoom />} />
      </Routes>
    </Router>
  );
}

export default App;
