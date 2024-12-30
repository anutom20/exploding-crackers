const GameLayout = ({
  playerHands,
  onCardClick,
  currentPlayerTurn,
  lastPlayedCard,
}: {
  playerHands: string[];
  onCardClick: (card: string) => void;
  currentPlayerTurn: string;
  lastPlayedCard: string;
}) => {
  return (
    <div className="p-4 bg-gray-100 rounded-lg shadow-md">
      <h3 className="text-lg mb-2">Current Player's Turn</h3>
      <div className="border-2 border-green-500 bg-white p-4 rounded-lg shadow-md mb-4">
        <span className="text-center">{currentPlayerTurn}</span>
      </div>

      <h3 className="text-lg mb-2">Top Card of the Deck</h3>
      <div
        className="border-2 border-blue-500 bg-white p-4 rounded-lg shadow-md mb-4 cursor-pointer"
        onClick={() => onCardClick("draw")}
      >
        <span className="text-center">Click to draw</span>
      </div>

      <h3 className="text-lg mb-2">Your Hand</h3>
      <div className="flex space-x-2 mb-4">
        {playerHands?.map((card, index) => (
          <div
            key={index}
            className="border-2 border-blue-500 bg-white p-4 rounded-lg shadow-md cursor-pointer"
            onClick={() => onCardClick(card)}
          >
            <span className="text-center">{card}</span>
          </div>
        ))}
      </div>

      <h3 className="text-lg mb-2">Last Played Card</h3>
      <div className="border-2 border-gray-400 bg-gray-200 p-4 rounded-lg h-32 flex items-center justify-center">
        <span className="text-gray-500">{lastPlayedCard}</span>
      </div>
    </div>
  );
};

export default GameLayout;
