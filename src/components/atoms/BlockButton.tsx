import React from 'react';
import {Dimensions, TouchableOpacityProps} from 'react-native';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';

export interface BlockButtonProps extends TouchableOpacityProps {
  loading?: boolean;
  text?: string;
}

/**
 * A large rounded button with text in the app's primary color. Can be put in loading mode
 */
const BlockButton = ({loading, text, ...props}: BlockButtonProps) => {
  return (
    <Container pointerEvents="box-none">
      <TouchableOpacity {...props}>
        {loading ? (
          <LoadingIndicator />
        ) : (
          <Text size={16} color="white" weight="semibold">
            {text}
          </Text>
        )}
      </TouchableOpacity>
    </Container>
  );
};

export default BlockButton;

const TouchableOpacity = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.primary};
  justify-content: center;
  align-items: center;
  padding: 10px;
  align-self: center;
  min-height: 40px;
  min-width: ${Math.min(Dimensions.get('window').width - 32, 250)}px;
  width: ${Dimensions.get('window').width - 64}px;
  border-radius: 15px;
`;

const Container = styled.View``;

const LoadingIndicator = styled.ActivityIndicator``;
