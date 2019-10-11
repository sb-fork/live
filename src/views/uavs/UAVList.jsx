/**
 * @file Component that displays the status of the known UAVs in a Flockwave
 * flock.
 */

import Immutable from 'immutable';

import IconButton from '@material-ui/core/IconButton';
import ListItem from '@material-ui/core/ListItem';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import ListItemText from '@material-ui/core/ListItemText';
import Search from '@material-ui/icons/Search';

import { autobind } from 'core-decorators';
import { pick } from 'lodash';
import { boundingExtent, buffer } from 'ol/extent';
import PropTypes from 'prop-types';
import React from 'react';
import { connect } from 'react-redux';
import u from 'updeep';

import { setSelectedUAVIds } from '../../actions/map';
import { multiSelectableListOf } from '../../components/helpers/lists';
import Flock from '../../model/flock';
import { getSelectedUAVIds } from '../../selectors/selection';
import { mapViewToExtentSignal, mapViewToLocationSignal } from '../../signals';
import { coordinateFromLonLat, formatCoordinate } from '../../utils/geography';
import UAVToolbar from './UAVToolbar';
import CountMonitor from './CountMonitor';

/**
 * Formats the secondary text to be shown for a single UAV in the UAV list.
 *
 * @param {UAV} uav  the UAV to format
 * @return {string} the formatted secondary text of the UAV
 */
function formatSecondaryTextForUAV(uav) {
  return (
    `${formatCoordinate([uav.lon, uav.lat])}, ${uav.heading.toFixed(1)}°` +
    (uav.agl === undefined ? '' : ` @ ${uav.agl.toFixed(1)}m`)
  );
}

const jumpToUAV = function(uav) {
  mapViewToLocationSignal.dispatch(
    {
      center: {
        lon: uav.lon,
        lat: uav.lat
      }
    },
    500
  );
};

/**
 * Presentation component for the entire UAV list.
 */
const UAVListPresentation = multiSelectableListOf(
  (uav, props, selected) => {
    const rightIconButton = (
      <IconButton onClick={() => jumpToUAV(uav)}>
        <Search />
      </IconButton>
    );

    return (
      <ListItem
        key={uav.id}
        button
        className={selected ? 'selected-list-item' : undefined}
        onClick={props.onItemSelected}
      >
        <ListItemText
          primary={uav.id}
          secondary={formatSecondaryTextForUAV(uav)}
        />
        <ListItemSecondaryAction>{rightIconButton}</ListItemSecondaryAction>
      </ListItem>
    );
  },
  {
    backgroundHint: 'No UAVs',
    dataProvider: 'uavs'
  }
);
UAVListPresentation.displayName = 'UAVListPresentation';

/**
 * React component that shows the state of the known UAVs in a Flockwave
 * flock.
 */
class UAVList extends React.Component {
  static propTypes = {
    flock: PropTypes.instanceOf(Flock),
    selectedUAVIds: PropTypes.arrayOf(PropTypes.string).isRequired,
    onSelectionChanged: PropTypes.func
  };

  state = {
    uavs: new Immutable.List(),
    uavIdToIndex: new Immutable.Map()
  };

  constructor(props) {
    super(props);

    this._eventBindings = {};
  }

  componentDidMount() {
    this._onFlockMaybeChanged(undefined, this.props.flock);
  }

  componentDidUpdate(oldProps) {
    this._onFlockMaybeChanged(oldProps.flock, this.props.flock);
  }

  componentWillUnmount() {
    this._onFlockMaybeChanged(this.props.flock, undefined);
  }

  @autobind
  _fitSelectedUAVs() {
    const { selectedUAVIds } = this.props;
    const { uavs } = this.state;

    const selectedUAVCoordinates = uavs
      .filter(uav =>
        selectedUAVIds.length === 0 ? true : selectedUAVIds.includes(uav.id)
      )
      .map(uav => coordinateFromLonLat([uav.lon, uav.lat]))
      .toArray();

    const bounds = boundingExtent(selectedUAVCoordinates);
    const bufferedBounds = buffer(bounds, 16);
    mapViewToExtentSignal.dispatch(bufferedBounds, 500);
  }

  /**
   * Function that is called when we suspect that the flock associated to
   * the component may have changed.
   *
   * This function subscribes to the events from the new flock and
   * unsubscribes from the events of the old flock. It also performs a
   * strict equality check on the two flocks because they may be equal.
   *
   * @param {Flock} oldFlock  the old flock associated to the component
   * @param {Flock} newFlock  the new flock associated to the component
   */
  _onFlockMaybeChanged(oldFlock, newFlock) {
    if (oldFlock === newFlock) {
      return;
    }

    if (oldFlock) {
      oldFlock.uavsUpdated.detach(this._eventBindings.uavsUpdated);
      delete this._eventBindings.uavsUpdated;
    }

    if (newFlock) {
      this._eventBindings.uavsUpdated = newFlock.uavsUpdated.add(
        this._onUAVsUpdated
      );
    }
  }

  /**
   * Event handler that is called when the status of some of the UAVs has
   * changed in the flock and the list should be re-rendered.
   *
   * @listens Flock#uavsUpdated
   * @param {UAV[]} updatedUavs  the UAVs that should be refreshed
   */
  @autobind
  _onUAVsUpdated(updatedUavs) {
    let { uavs, uavIdToIndex } = this.state;

    for (const uav of updatedUavs) {
      const index = uavIdToIndex.get(uav.id);
      const uavRepr = this._pickRelevantUAVProps(uav);

      if (index === undefined) {
        uavIdToIndex = uavIdToIndex.set(uav.id, uavs.size);
        uavs = uavs.push(uavRepr);
      } else {
        uavs = uavs.set(index, uavRepr);
      }
    }

    const newState = u({ uavs, uavIdToIndex }, this.state);
    this.setState(newState);
  }

  /**
   * Picks the properties from an UAV object that are relevant for the list
   * items in this list.
   *
   * @param {UAV} uav  the UAV to pick the properties from
   * @return {Object}  the object containing the picked props
   */
  _pickRelevantUAVProps(uav) {
    return pick(uav, [
      'id',
      'lastUpdated',
      'lat',
      'lon',
      'heading',
      'error',
      'agl'
    ]);
  }

  render() {
    const { selectedUAVIds, onSelectionChanged } = this.props;
    const { uavs } = this.state;

    return (
      <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <UAVToolbar
          selectedUAVIds={selectedUAVIds}
          fitSelectedUAVs={this._fitSelectedUAVs}
        />

        <div style={{ height: '100%', overflow: 'auto' }}>
          <UAVListPresentation
            dense
            uavs={uavs}
            value={selectedUAVIds || []}
            onChange={onSelectionChanged}
          />
        </div>

        <CountMonitor selectedUAVIds={selectedUAVIds} uavs={uavs} />
      </div>
    );
  }
}

const SmartUAVList = connect(
  // mapStateToProps
  state => ({
    selectedUAVIds: getSelectedUAVIds(state)
  }),
  // mapDispatchToProps
  dispatch => ({
    onSelectionChanged: (event, uavIds) => {
      dispatch(setSelectedUAVIds(uavIds));
    }
  })
)(UAVList);

export default SmartUAVList;
