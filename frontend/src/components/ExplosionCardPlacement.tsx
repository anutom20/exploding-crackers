const ExplosionCardPlacement = ({
  setOpen,
  setExplosionCardPlacement,
  makeMove,
  eliminateTimeoutId,
  setEliminateTimeoutId,
}: {
  setOpen: (open: boolean) => void;
  setExplosionCardPlacement: (placement: "top" | "random") => void;
  makeMove: (
    move: "future" | "skip" | "reverse" | "defuse" | "explosion",
    placeExplosionCardInMiddle?: boolean
  ) => void;
  setEliminateTimeoutId: (id: number | null) => void;
  eliminateTimeoutId: number | null;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg">
        <h1 className="text-xl text-gray-500 font-semibold">
          Place the Explosion Card Back in The Deck
        </h1>
        <div className="flex flex-col items-center justify-center space-y-4 mt-4">
          <button
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            onClick={() => {
              setExplosionCardPlacement("top");
              makeMove("defuse");
              if (eliminateTimeoutId) {
                clearInterval(eliminateTimeoutId);
                setEliminateTimeoutId(null);
              }
              setOpen(false);
            }}
          >
            Place On Top
          </button>
          <button
            className="bg-orange-500 text-white p-2 rounded-lg hover:bg-orange-600 transition transform hover:scale-105"
            onClick={() => {
              setExplosionCardPlacement("random");
              makeMove("defuse", true);
              if (eliminateTimeoutId) {
                clearInterval(eliminateTimeoutId);
                setEliminateTimeoutId(null);
              }
              setOpen(false);
            }}
          >
            Place Randomly
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExplosionCardPlacement;
