export const ADD_USER = 'ADD_USER';

export const TOAST_CLICK = 'TOAST_CLICK';

export const RATED = 'RATED';

export const CONFIRM_PAYMENT = 'CONFIRM_PAYMENT';

export const addUser = user => dispatch => {
    dispatch({
      type: ADD_USER,
      payload: user
    });
};

export const toastClick = flag => dispatch => {
    dispatch({
      type: TOAST_CLICK,
      payload: flag
    });
};

export const rated = flag => dispatch => {
  dispatch({
    type: RATED,
    payload: flag
  });
};

export const confirmPayment = flag => dispatch => {
  dispatch({
    type: CONFIRM_PAYMENT,
    payload: flag
  });
};