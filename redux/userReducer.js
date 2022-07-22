import { ADD_USER } from "./actions";
  
  const initialState = {
    user: {}
  };
  
  function userReducer(state = initialState, action) {
    switch (action.type) {
      case ADD_USER:
        return { ...state, user: action.payload };
      default:
        return state;
    }
  }
  
  export default userReducer;