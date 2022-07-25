import { CONFIRM_PAYMENT } from "./actions";
  
  const initialState = {
    confirmPayment: false
  };
  
  function paymentReducer(state = initialState, action) {
    switch (action.type) {
      case CONFIRM_PAYMENT:
        return { ...state, confirmPayment: action.payload };
      default:
        return state;
    }
  }
  
  export default paymentReducer;