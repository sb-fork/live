import Box from '@material-ui/core/Box';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ActionDone from '@material-ui/icons/Done';
import ActionSettingsEthernet from '@material-ui/icons/SettingsEthernet';
import ContentClear from '@material-ui/icons/Clear';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import TimeAgo from 'react-time-ago';

import Colors from '~/components/colors';
import { listOf } from '~/components/helpers/lists';
import { ConnectionState } from '~/model/connections';
import { getConnectionsInOrder } from '~/selectors/ordered';

/**
 * Icons for the different connection states in the connection list.
 */
const iconsByState = {
  [ConnectionState.CONNECTED]: (
    <ListItemIcon style={{ color: Colors.success, minWidth: 28 }}>
      <ActionDone fontSize="small" />
    </ListItemIcon>
  ),
  [ConnectionState.CONNECTING]: (
    <ListItemIcon style={{ color: Colors.warning, minWidth: 28 }}>
      <ActionSettingsEthernet fontSize="small" />
    </ListItemIcon>
  ),
  [ConnectionState.DISCONNECTED]: (
    <ListItemIcon style={{ color: Colors.error, minWidth: 28 }}>
      <ContentClear fontSize="small" />
    </ListItemIcon>
  ),
  [ConnectionState.DISCONNECTING]: (
    <ListItemIcon style={{ color: Colors.warning, minWidth: 28 }}>
      <ActionSettingsEthernet fontSize="small" />
    </ListItemIcon>
  )
};

const ConnectionStatusMiniListEntry = ({ id, name, state, stateChangedAt }) => (
  <ListItem key={id} disableGutters>
    {iconsByState[state]}
    <Box display="flex" flexDirection="row" flexGrow={1}>
      <Box flexGrow={1}>{name}</Box>
      <Box color="text.secondary" ml={1}>
        <TimeAgo timeStyle="twitter" date={stateChangedAt} />
      </Box>
    </Box>
  </ListItem>
);

ConnectionStatusMiniListEntry.propTypes = {
  name: PropTypes.string,
  state: PropTypes.string,
  stateChangedAt: PropTypes.instanceOf(Date)
};

const ConnectionStatusMiniListPresentation = listOf(
  ConnectionStatusMiniListEntry,
  {
    dataProvider: 'connections',
    backgroundHint: 'No connections'
  }
);

export default connect(
  state => ({
    connections: getConnectionsInOrder(state),
    mini: true
  }),
  () => ({})
)(ConnectionStatusMiniListPresentation);