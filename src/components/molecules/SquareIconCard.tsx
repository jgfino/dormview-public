import React from 'react';
import {TouchableOpacityProps} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Spacer from '../atoms/Spacer';
import Text from '../native-replacements/Text';

interface SquareIconCardProps extends TouchableOpacityProps {
  iconName: string;
  title: string;
  subtitle: string;
}

const SquareIconCard: React.FC<SquareIconCardProps> = ({
  iconName,
  title,
  subtitle,
  ...props
}) => (
  <Container {...props}>
    <TopIcon name={iconName} size={40} />
    <TextContainer>
      <Text size={17} numberOfLines={3} weight="semibold" align="center">
        {title}
      </Text>
      <Spacer />
      <Text
        size={14}
        numberOfLines={1}
        italic
        color="secondary1"
        align="center">
        {subtitle}
      </Text>
    </TextContainer>
  </Container>
);

export default SquareIconCard;

const Container = styled.TouchableOpacity`
  background-color: ${({theme}) => theme.colors.background.secondary2};
  height: 170px;
  width: 170px;
  align-items: center;
  border-radius: 20px;
  padding: 16px;
`;

const TextContainer = styled.View`
  flex: 2;
  align-items: center;
  justify-content: center;
`;

const TopIcon = styled(Icon).attrs(props => ({
  color: props.theme.colors.primary,
}))`
  flex: 1;
`;
