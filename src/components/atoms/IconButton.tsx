import React, {useState} from 'react';
import {TouchableOpacityProps} from 'react-native';
import Ionicon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';

interface IconButtonProps extends TouchableOpacityProps {
  icon: string;
  iconColor: string;
  loading?: boolean;
}

/**
 * A Button with a centered icon
 */
const IconButton: React.FC<IconButtonProps> = ({
  icon,
  iconColor,
  loading,
  ...props
}) => {
  const [iconSize, setIconSize] = useState(0);
  return (
    <Container
      {...props}
      onLayout={event => setIconSize(event.nativeEvent.layout.height - 10)}>
      {loading ? (
        <Indicator />
      ) : (
        <Icon name={icon} color={iconColor} size={iconSize} />
      )}
    </Container>
  );
};

export default IconButton;

const Container = styled.TouchableOpacity`
  align-items: center;
  justify-content: center;
`;

const Icon = styled(Ionicon)``;

const Indicator = styled.ActivityIndicator`
  flex: 1;
`;
