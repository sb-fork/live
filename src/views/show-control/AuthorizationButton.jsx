import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Typography from '@material-ui/core/Typography';
import StatusLight from '@skybrush/mui-components/lib/StatusLight';

import { Status } from '~/components/semantics';
import { setCommandsAreBroadcast } from '~/features/mission/slice';
import {
  setShowAuthorization,
  synchronizeShowSettings,
  setMusicTimeoutId,
} from '~/features/show/slice';
import {
  countUAVsTakingOffAutomatically,
  isShowAuthorizedToStartLocally,
  getMusicTimeoutId,
  getMusicOffset,
  getMusicFile,
  getShowStartTime,
} from '~/features/show/selectors';
import { getSetupStageStatuses } from '~/features/show/stages';

/**
 * Button that allows the user to express her explicit consent to starting the
 * drone show. Such an authorization is needed even if the show is set to start
 * in automatic mode.
 */
const AuthorizationButton = ({
  mtimeout,
  isAuthorized,
  numUAVsTakingOffAutomatically,
  status,
  ...rest
}) => (
  <ListItem
    button
    /* disabled={!isAuthorized && status === Status.OFF} */
    selected={isAuthorized}
    {...rest}
  >
    <StatusLight
      status={isAuthorized && status === Status.OFF ? Status.SKIPPED : status}
    />
    <ListItemText
      disableTypography
      primary={
        <Typography variant='button'>
          {isAuthorized
            ? 'Show authorized to start'
            : 'Authorize start of show'}
        </Typography>
      }
      secondary={
        <Typography variant='body2' color='textSecondary'>
          {isAuthorized
            ? numUAVsTakingOffAutomatically <= 0
              ? 'Click here to revoke authorization'
              : numUAVsTakingOffAutomatically === 1
              ? 'One drone will take off automatically'
              : `${numUAVsTakingOffAutomatically} drones will take off automatically`
            : 'Authorization required before takeoff'}
        </Typography>
      }
    />
  </ListItem>
);

AuthorizationButton.propTypes = {
  isAuthorized: PropTypes.bool,
  numUAVsTakingOffAutomatically: PropTypes.number,
  status: PropTypes.oneOf(Object.values(Status)),
  mtimeout: PropTypes.number,
};

export default connect(
  // mapStateToProps
  (state) => ({
    isAuthorized: isShowAuthorizedToStartLocally(state),
    numUAVsTakingOffAutomatically: countUAVsTakingOffAutomatically(state),
    status: getSetupStageStatuses(state).authorization,
    mtimeout: getMusicTimeoutId(state),
  }),
  // mapDispatchToProps
  {
    onClick: () => (dispatch, getState) => {
      const state = getState();
      const newAuthorizationState = !isShowAuthorizedToStartLocally(state);

      dispatch(setShowAuthorization(newAuthorizationState));
      dispatch(synchronizeShowSettings('toServer'));
      if (newAuthorizationState) {
        dispatch(setCommandsAreBroadcast(state));

        var audio = new Audio(getMusicFile(state))
        console.log(Date.now());
        console.log(getShowStartTime(state))
        console.log(getShowStartTime(state) + getMusicOffset(state));
        if ((+getShowStartTime(state) + +getMusicOffset(state)) * 1000 - Date.now() >= 0 && getMusicFile(state))
          dispatch(setMusicTimeoutId(setTimeout(()=>{audio.play()}, (+getShowStartTime(state) + +getMusicOffset(state)) * 1000 - Date.now())));
      }
      else{
        clearTimeout(getMusicTimeoutId(state));
        dispatch(setMusicTimeoutId(null));
      }
    },
  }
)(AuthorizationButton);
