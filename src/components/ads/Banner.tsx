import {AdMobBanner} from 'expo-ads-admob';
import React, {useContext} from 'react';
import {Platform} from 'react-native';
import styled from 'styled-components/native';
import {AuthContext} from '../../context/AuthProvider';
import {ConsentContext} from '../../context/ConsentProvider';

interface BannerProps {
  adUnitID: string;
  position: 'top' | 'bottom';
  visible: boolean;
  bannerSize?:
    | 'smartBannerPortrait'
    | 'banner'
    | 'largeBanner'
    | 'mediumRectangle'
    | 'fullBanner'
    | 'leaderboard'
    | 'smartBannerLandscape';
}

/**
 * Custom AdMob banner
 */
const Banner: React.FC<BannerProps> = ({
  adUnitID,
  position,
  visible,
  bannerSize = Platform.OS === 'ios' ? 'smartBannerPortrait' : 'banner',
}) => {
  const {hasConsent} = useContext(ConsentContext);
  const {profile} = useContext(AuthContext);

  if (!visible || profile?.admin) return null;

  return (
    <AdContainer
      style={
        position === 'top'
          ? {borderBottomWidth: 0.5, marginBottom: 8}
          : {borderTopWidth: 0.5}
      }>
      <AdMobBanner
        adUnitID={adUnitID}
        bannerSize={bannerSize}
        servePersonalizedAds={hasConsent}
      />
    </AdContainer>
  );
};

export default Banner;

const AdContainer = styled.View`
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  border-top-color: ${({theme}) => theme.colors.accent2};
  border-bottom-color: ${({theme}) => theme.colors.accent2};
`;
