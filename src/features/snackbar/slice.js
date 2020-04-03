/**
 * @file Slice of the state object that handles the common snackbar component at
 * the bottom of the app window.
 */

import { createSlice } from '@reduxjs/toolkit';

import { MessageSemantics } from './types';

const { actions, reducer } = createSlice({
  name: 'snackbar',

  initialState: {
    messageId: 0,
    message: '',
    permanent: false,
    semantics: MessageSemantics.DEFAULT
  },

  reducers: {
    showSnackbarMessage(state, action) {
      let semantics;
      let message;
      let permanent;

      if (typeof action.payload === 'string') {
        message = String(action.payload);
        semantics = MessageSemantics.DEFAULT;
        permanent = false;
      } else {
        message = String(action.payload.message);
        semantics = action.payload.semantics;
        permanent = Boolean(action.payload.permanent);
      }

      state.messageId += 1;
      state.message = message;
      state.permanent = permanent;
      state.semantics = semantics;
    },

    showPermanentSnackbarMessage(state, action) {
      showSnackbarMessage(state, action);
      state.permanent = true;
    }
  }
});

export const { showSnackbarMessage } = actions;

export default reducer;
