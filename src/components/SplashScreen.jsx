import PropTypes from 'prop-types';
import React from 'react';
import { CoverPagePresentation as CoverPage } from 'react-cover-page';

import 'react-cover-page/themes/_common.css';

import logo from '~/../assets/icons/flyai_logo_webside_2.png';

const SplashScreen = ({ loading, visible }) => (
  <CoverPage
    loading={loading}
    icon={<img src={logo} width={300} height={150} alt='' />}
    title={
      <span>
      </span>
    }
    style={{
      background: "#000",
    }}
    visible={visible}
  />
);

SplashScreen.propTypes = {
  loading: PropTypes.bool,
  visible: PropTypes.bool,
};

export default SplashScreen;
