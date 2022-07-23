import { RATED } from "./actions";
  
  const initialState = {
    rated: false
  };
  
  function ratedReducer(state = initialState, action) {
    switch (action.type) {
      case RATED:
        return { ...state, rated: action.payload };
      default:
        return state;
    }
  }
  
  export default ratedReducer;