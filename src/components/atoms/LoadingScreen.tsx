import React, {useContext} from 'react';
import {ActivityIndicator, ColorValue, Platform, View} from 'react-native';
import {ThemeContext} from 'styled-components';

interface LoadingScreenProps {
  loading?: boolean;
  backgroundColor?: ColorValue;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({
  loading = true,
  backgroundColor,
}) => {
  const theme = useContext(ThemeContext);

  if (!loading) return null;

  return (
    <View
      style={{
        position: 'absolute',
        left: 0,
        top: 0,
        right: 0,
        bottom: 0,
        backgroundColor: backgroundColor
          ? backgroundColor
          : theme.colors.background.primary,
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <ActivityIndicator
        color={Platform.select({ios: undefined, android: theme.colors.primary})}
      />
    </View>
  );
};

export default LoadingScreen;
