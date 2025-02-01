export const createRoom = (req: any, res: any) => {
  const roomId = `room-${Math.random().toString(36).substring(2, 9)}`;
  res.json({ roomId });
};
