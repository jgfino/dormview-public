import {useNavigation} from '@react-navigation/core';
import React, {useContext, useLayoutEffect} from 'react';
import {ThemeContext} from 'styled-components';
import {ModalButton} from '../components/atoms/ModalButton';

export interface ModalHeaderProps {
  title: string;
  left?: string;
  right: string;
  loading?: boolean;
  onRightPressed: () => void | Promise<void>;
}

/**
 * Sets up the navigation header for modal screens
 */
const useModalHeader = (props: ModalHeaderProps) => {
  const {title, left, right, loading, onRightPressed} = props;
  const navigation = useNavigation();

  const theme = useContext(ThemeContext);

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerStyle: {
        height: 54,
        backgroundColor: theme.colors.background.primary,
        shadowColor: theme.colors.accent2,
      },
      headerLeft: () => (
        <ModalButton
          position="left"
          title={left ?? 'Cancel'}
          onPress={() => {
            navigation.goBack();
          }}
        />
      ),
      headerRight: () => (
        <ModalButton
          position="right"
          title={right}
          onPress={onRightPressed}
          loading={loading}
        />
      ),
    });
  }, [props, navigation]);
};

export default useModalHeader;
