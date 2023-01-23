import isNil from 'lodash-es/isNil';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';

import IconButton from '@material-ui/core/IconButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import Clear from '@material-ui/icons/Clear';
import CloudDownload from '@material-ui/icons/CloudDownload';
import Refresh from '@material-ui/icons/Refresh';

import StatusLight from '@skybrush/mui-components/lib/StatusLight';
import Tooltip from '@skybrush/mui-components/lib/Tooltip';

import FileListItem from './FileListItem';

import Colors from '~/components/colors';
import ListItemTextWithProgress from '~/components/ListItemTextWithProgress';
import { Status } from '~/components/semantics';
import {
  loadShowFromFile,
  reloadCurrentShowFile,
  selecteda,
} from '~/features/show/actions';
import {
  clearLoadedShow,
  openLoadShowFromCloudDialog,
} from '~/features/show/slice';
import {
  getShowDescription,
  getShowLoadingProgressPercentage,
  getShowTitle,
  hasShowChangedExternallySinceLoaded,
  hasLoadedShowFile,
  isLoadingShowFile,
} from '~/features/show/selectors';
import { getSetupStageStatuses } from '~/features/show/stages';
import { truncate } from '~/utils/formatting';
import { hasFeature } from '~/utils/configuration';
import { file } from 'jszip';

/**
 * Helper function to test whether a dropped file is a real file and not a
 * directory.
 */
const isFile = (item) => item && item.size > 0;

/**
 * List of file extensions that we treat as show files.
 */
const EXTENSIONS = ['skyc'];

/**
 * React component for the button that allows the user to open a show file.
 */
const LoadMusicFromFileButton = ({
  changedSinceLoaded,
  description,
  hasLoadedShowFile,
  loading,
  onClearLoadedShow,
  onLoadShowFromCloud,
  onReloadShowFile,
  onShowFileSelected,
  selected,
  progress,
  status,
  title,
}) => (
  <FileListItem
    id='show-file-upload1'
    inputId='show-file-upload-input1'
    accepts={isFile}
    // extensions={EXTENSIONS}
    // onSelected={onShowFileSelected}
    onSelected={selected}
  >
    <ListItemTextWithProgress
      primary={
        'No show file loaded'
      }
    />
  </FileListItem>
);

LoadMusicFromFileButton.propTypes = {
  changedSinceLoaded: PropTypes.bool,
  description: PropTypes.string,
  hasLoadedShowFile: PropTypes.bool,
  loading: PropTypes.bool,
  onClearLoadedShow: PropTypes.func,
  onLoadShowFromCloud: PropTypes.func,
  onReloadShowFile: PropTypes.func,
  onShowFileSelected: PropTypes.func,
  selected: PropTypes.func,
  progress: PropTypes.number,
  status: PropTypes.oneOf(Object.values(Status)),
  title: PropTypes.string,
};

export default connect(
  // mapStateToProps
  (state) => ({
    changedSinceLoaded: hasShowChangedExternallySinceLoaded(state),
    description: getShowDescription(state),
    hasLoadedShowFile: hasLoadedShowFile(state),
    loading: isLoadingShowFile(state),
    progress: getShowLoadingProgressPercentage(state),
    status: getSetupStageStatuses(state).selectShowFile,
    title: getShowTitle(state),
  }),
  // mapDispatchToProps
  {
    // onClearLoadedShow: clearLoadedShow,
    // onLoadShowFromCloud: openLoadShowFromCloudDialog,
    // onReloadShowFile: reloadCurrentShowFile,
    // onShowFileSelected: loadShowFromFile,
    selected: selecteda,
  }
)(LoadMusicFromFileButton);
