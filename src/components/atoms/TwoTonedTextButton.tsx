import React from 'react';
import {TouchableOpacityProps} from 'react-native';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';

interface TwoTonedTextButtonProps extends TouchableOpacityProps {
  first: string;
  second?: string;
  underline?: boolean;
}

const TwoTonedTextButton: React.FC<TwoTonedTextButtonProps> = ({
  first,
  second,
  underline,
  ...props
}) => {
  return (
    <TextButton {...props}>
      <Text size={16} color="secondary1" underline={underline}>
        {first}
        {second && (
          <Text size={18} weight="semibold" color="accent">
            {' ' + second}
          </Text>
        )}
      </Text>
    </TextButton>
  );
};

export default TwoTonedTextButton;

const TextButton = styled.TouchableOpacity``;
