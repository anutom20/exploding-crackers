const Card = ({ cardName }: { cardName: string }) => {
  return (
    <div className="border-2 border-blue-500 bg-white p-4 rounded-lg shadow-md flex items-center justify-center h-32 w-24">
      <span className="text-center">{cardName}</span>
    </div>
  );
};

export default Card;
