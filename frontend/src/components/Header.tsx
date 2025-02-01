const Header = ({ currentUser }: { currentUser: string }) => {
  return (
    <div className="flex flex-row justify-between items-center bg-white shadow-sm p-4 border-b-2 w-full">
      <h1 className="text-2xl font-bold">
        Exploding <span className="text-orange-500">Kittens</span>
      </h1>
      <p className="text-lg text-gray-500">Welcome, {currentUser}!</p>
    </div>
  );
};

export default Header;
