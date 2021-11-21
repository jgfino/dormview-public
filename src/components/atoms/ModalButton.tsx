import React, {useContext} from 'react';
import {Platform, TouchableOpacityProps} from 'react-native';
import styled, {ThemeContext} from 'styled-components/native';
import Text from '../native-replacements/Text';

interface ModalButtonProps extends TouchableOpacityProps {
  title: string;
  position: 'left' | 'right';
  loading?: boolean;
}

/**
 * Top left button for a modal; not bold
 */
const ModalButton: React.FC<ModalButtonProps> = ({
  title,
  position,
  loading,
  ...props
}) => {
  const theme = useContext(ThemeContext);

  return (
    <Container {...props}>
      {loading ? (
        <LoadingIndicator
          color={Platform.select({
            ios: undefined,
            android: theme.colors.primary,
          })}
        />
      ) : (
        <Text
          size={20}
          color="accent"
          weight={position === 'right' ? 'semibold' : 'medium'}>
          {title}
        </Text>
      )}
    </Container>
  );
};

export {ModalButton};

const Container = styled.TouchableOpacity`
  padding-left: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
`;

const LoadingIndicator = styled.ActivityIndicator``;
