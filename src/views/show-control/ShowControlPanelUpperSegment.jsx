import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';

import {
  getShowEnvironmentType,
  isShowAuthorizedToStartLocally,
} from '~/features/show/selectors';

import EnvironmentButton from './EnvironmentButton';
import GeofenceButton from './GeofenceButton';
import LargeControlButtonGroup from './LargeControlButtonGroup';
import LoadShowFromFileButton from './LoadShowFromFileButton';
import LoadMusicFromFileButton from './LoadMusicFromFileButton';
import ManualPreflightChecksButton from './ManualPreflightChecksButton';
import OnboardPreflightChecksButton from './OnboardPreflightChecksButton';
import ShowUploadDialogButton from './ShowUploadDialogButton';
import StartTimeButton from './StartTimeButton';
import TakeoffAreaButton from './TakeoffAreaButton';
import MultiPagePanel, { Page } from '~/components/MultiPagePanel';

/**
 * Panel that shows the widgets that are needed to load and configure a drone
 * show.
 */
 const ShowControlPanelUpperSegment = ({ environmentType, isAuthorized }) => {
  const classes = useStyles();

  return (
    <Box flex={1} position='relative'>
      <FadeAndSlide
        mountOnEnter
        unmountOnExit
        in={!isAuthorized}
        direction='left'
      >
        <Box className={clsx(classes.root, classes.scrollable)}>
          <List dense>
            <LoadShowFromFileButton />
            <LoadMusicFromFileButton />
            

            <Divider />

            <EnvironmentButton />
            <TakeoffAreaButton />
            {environmentType === 'outdoor' && <GeofenceButton />}
            <ShowUploadDialogButton />

            <Divider />

            <OnboardPreflightChecksButton />
            <ManualPreflightChecksButton />

            <Divider />

            <StartTimeButton />
          </List>
        </Box>
      </FadeAndSlide>

      <FadeAndSlide
        mountOnEnter
        unmountOnExit
        in={isAuthorized}
        direction='left'
      >
        <Box
          className={clsx(classes.root)}
          display='flex'
          flexDirection='column'
        >
          <LargeControlButtonGroup />
        </Box>
      </FadeAndSlide>
    </Box>
  );
};

ShowControlPanelUpperSegment.propTypes = {
  environmentType: PropTypes.oneOf(['indoor', 'outdoor']),
  isAuthorized: PropTypes.bool,
};

export default connect(
  // mapStateToProps
  (state) => ({
    environmentType: getShowEnvironmentType(state),
    filename: null,
    isAuthorized: isShowAuthorizedToStartLocally(state),
  })
)(ShowControlPanelUpperSegment);
