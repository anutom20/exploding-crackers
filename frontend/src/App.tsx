import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import { SnackbarProvider } from "notistack";
import CreateRoom from "./components/CreateRoom";
import Room from "./components/Room";

function App() {
  return (
    <SnackbarProvider>
      <Router>
        <Routes>
          <Route path="/" element={<CreateRoom />} />
          <Route path="/room/:roomId" element={<Room />} />
        </Routes>
      </Router>
    </SnackbarProvider>
  );
}

export default App;
