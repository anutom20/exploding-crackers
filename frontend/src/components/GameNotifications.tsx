import { SnackbarContent } from "notistack";
import { forwardRef } from "react";

const GameNotifications = forwardRef((props: any, ref) => {
  return (
    <SnackbarContent ref={ref} {...props}>
      <div className="flex items-center bg-white p-2 rounded-lg shadow-md">
        <img
          src={props.avatar}
          alt="Avatar"
          className="w-10 h-10 rounded-full mr-2"
        />
        <div className="flex flex-col">
          <div className="text-gray-700 font-bold">{props.username}</div>
          <div className="text-gray-600">{props.message}</div>
        </div>
      </div>
    </SnackbarContent>
  );
});

export default GameNotifications;
