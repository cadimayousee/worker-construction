import { TOAST_CLICK } from "./actions";
  
  const initialState = {
    toastClick: false
  };
  
  function toastReducer(state = initialState, action) {
    switch (action.type) {
      case TOAST_CLICK:
        return { ...state, toastClick: action.payload };
      default:
        return state;
    }
  }
  
  export default toastReducer;