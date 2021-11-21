import React from 'react';
import {ViewProps} from 'react-native';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';

interface PendingRibbonProps extends ViewProps {
  message: string;
  visible?: boolean;
}

/**
 * A short red ribbon with a message to display at the top of a screen
 */
const PendingRibbon: React.FC<PendingRibbonProps> = ({
  message,
  visible = true,
  ...props
}) => {
  if (visible) {
    return (
      <RibbonContainer {...props}>
        <Text size={14} align="center" color="white" weight="semibold">
          {message}
        </Text>
      </RibbonContainer>
    );
  } else {
    return null;
  }
};

export default PendingRibbon;

const RibbonContainer = styled.View`
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
  padding-top: ${({theme}) => theme.spacing.itemSpacing}px;
  padding-bottom: ${({theme}) => theme.spacing.itemSpacing}px;
  min-height: 44px;
  background-color: ${({theme}) => theme.colors.destructive};
  align-items: center;
  justify-content: center;
`;
