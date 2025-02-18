import dog from "/avatars/dog.png";
import sloth from "/avatars/sloth.png";
import fox from "/avatars/fox.png";
import wukong from "/avatars/wukong.png";
import lion from "/avatars/lion.png";
import jackal from "/avatars/jackal.png";

const avatars = [
  { name: "Dog", image: dog },
  { name: "Sloth", image: sloth },
  { name: "Fox", image: fox },
  { name: "Wukong", image: wukong },
  { name: "Lion", image: lion },
  { name: "Jackal", image: jackal },
];

const ChooseAvatar = ({
  setOpen,
  setAvatar,
  joinRoom,
}: {
  setOpen: (open: boolean) => void;
  setAvatar: (avatar: string) => void;
  joinRoom: (avatar: string) => void;
}) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-12 rounded-lg shadow-lg">
        <h1 className="text-lg font-semibold text-gray-600 mb-4">
          Choose Your Avatar
        </h1>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2.5 cursor-pointer">
          {avatars.map((avatar, index) => (
            <div
              key={index}
              className="text-center"
              onClick={() => {
                setAvatar(avatar.image);
                setOpen(false);
                joinRoom(avatar.image);
              }}
            >
              <img
                src={avatar.image}
                alt={`Avatar ${index + 1}`}
                className="w-24 h-24 rounded-full border-2 border-gray-500 hover:border-orange-500 hover:border-4 transition-all duration-300"
              />
              <p>{avatar.name}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChooseAvatar;
