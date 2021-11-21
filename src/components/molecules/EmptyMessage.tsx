import React from 'react';
import {Dimensions, ViewProps} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';

interface EmptyMessageProps extends ViewProps {
  icon?: string;
  message?: string;
}

const EmptyMessage: React.FC<EmptyMessageProps> = ({
  icon,
  message,
  ...props
}) => {
  return (
    <Container>
      {icon && <TopIcon name={icon} />}
      <MessageText size={18} color="secondary2" align="center">
        {message}
      </MessageText>
    </Container>
  );
};

export default EmptyMessage;

const Container = styled.View`
  align-items: center;
  justify-content: center;
  align-self: center;
  width: ${Dimensions.get('window').width - 185}px;
  max-width: 300px;
  padding-bottom: 30px;
  flex: 1;
`;

const TopIcon = styled(Icon).attrs(({theme}) => ({
  color: theme.colors.primary,
  size: 40,
}))`
  margin: ${({theme}) => theme.spacing.margins}px;
`;

const MessageText = styled(Text)``;
