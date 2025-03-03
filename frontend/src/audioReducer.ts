const initialState = {
  playCard: new Audio("/sounds/playing_card.mp3"),
  explosion: new Audio("/sounds/explosion.mp3"),
  chickenCard: new Audio("/sounds/chicken_arrival.mp3"),
  defuse: new Audio("/sounds/defuse.mp3"),
  shuffle: new Audio("/sounds/shuffle.mp3"),
  turn: new Audio("/sounds/turn.mp3"),
};

const soundReducer = (state = initialState, action: { type: string }) => {
  switch (action.type) {
    case "PLAY_CARD":
      state.playCard.play();
      return { ...state };

    case "CHICKEN_CARD":
      state.chickenCard.play();
      return { ...state };

    case "EXPLOSION":
      state.explosion.play();
      return { ...state };

    case "DEFUSE":
      state.defuse.play();
      state.chickenCard.pause();
      state.chickenCard.currentTime = 0;
      return { ...state };

    case "SHUFFLE":
      state.shuffle.play();
      return { ...state };

    case "TURN_SOUND":
      state.turn.play();
      return { ...state };
    default:
      return state;
  }
};

export { initialState, soundReducer };
