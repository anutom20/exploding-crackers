import { useNavigate } from "react-router-dom";

const Header = ({
  currentUser,
  currentPlayerTurn,
}: {
  currentUser: string;
  currentPlayerTurn: string;
}) => {
  const navigate = useNavigate();
  return (
    <div className="flex flex-row justify-between items-center bg-white shadow-sm p-4 border-b-2 w-full">
      <h1
        className="text-2xl font-bold cursor-pointer"
        onClick={() => navigate("/")}
      >
        Exploding <span className="text-orange-500">Chickens</span>
      </h1>
      <div
        className={`p-2 z-50 bg-green-500 text-white rounded-lg shadow-lg transition-opacity duration-300 ${
          currentPlayerTurn === currentUser ? "opacity-100" : "opacity-0"
        }`}
      >
        Your Turn!
      </div>
      <p className="text-lg text-gray-500">Welcome, {currentUser}!</p>
    </div>
  );
};

export default Header;
