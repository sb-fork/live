import { layer as olLayer } from '@collmot/ol-react';
import PropTypes from 'prop-types';
import React, { useCallback } from 'react';
import { connect } from 'react-redux';

import ActiveUAVsLayerSource from '../sources/ActiveUAVsLayerSource';

import { setLayerParameterById } from '~/actions/layers';
import CircleColorPicker from '~/components/CircleColorPicker';
import Header from '~/components/dialogs/FormHeader';
import flock from '~/flock';
import { getSelection } from '~/selectors/selection';
import { mapViewCoordinateFromLonLat } from '~/utils/geography';

// === Settings for this particular layer type ===

const UAVsLayerSettingsPresentation = ({ layer, setLayerParameter }) => {
  const { parameters } = layer;
  const { labelColor } = parameters || {};

  const onColorChanged = useCallback(
    (color) => {
      setLayerParameter('labelColor', color.hex);
    },
    [setLayerParameter]
  );

  return (
    <>
      <Header>Label color</Header>
      <CircleColorPicker
        color={labelColor || '#000000'}
        onChangeComplete={onColorChanged}
      />
    </>
  );
};

UAVsLayerSettingsPresentation.propTypes = {
  layer: PropTypes.object,
  layerId: PropTypes.string,

  setLayerParameter: PropTypes.func,
};

export const UAVsLayerSettings = connect(
  // mapStateToProps
  () => ({}),
  // mapDispatchToProps
  (dispatch, ownProps) => ({
    setLayerParameter: (parameter, value) => {
      dispatch(setLayerParameterById(ownProps.layerId, parameter, value));
    },
  })
)(UAVsLayerSettingsPresentation);

// === The actual layer to be rendered ===

const UAVsLayerPresentation = ({ layer, projection, selection, zIndex }) => (
  <olLayer.Vector updateWhileAnimating updateWhileInteracting zIndex={zIndex}>
    <ActiveUAVsLayerSource
      selection={selection}
      labelColor={layer.parameters.labelColor}
      flock={flock}
      projection={projection}
    />
  </olLayer.Vector>
);

UAVsLayerPresentation.propTypes = {
  layer: PropTypes.object,
  zIndex: PropTypes.number,

  selection: PropTypes.arrayOf(PropTypes.string).isRequired,
  projection: PropTypes.func,
};

UAVsLayerPresentation.defaultProps = {
  projection: mapViewCoordinateFromLonLat,
};

export const UAVsLayer = connect(
  // mapStateToProps
  (state) => ({
    selection: getSelection(state),
  }),
  // mapDispatchToProps
  () => ({})
)(UAVsLayerPresentation);
