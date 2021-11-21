import React, {useState} from 'react';
import {TouchableOpacityProps} from 'react-native';
import Animated from 'react-native-reanimated';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';

interface CircleIconButtonProps extends TouchableOpacityProps {
  icon: string;
  iconVerticalAdjust?: number;
}

/**
 * Circular button with an icon and a shadow. Background opacity is customizable
 */
const CircleIconHeaderButton: React.FC<CircleIconButtonProps> = ({
  iconVerticalAdjust = 0,
  icon,
  ...props
}) => {
  const [iconSize, setIconSize] = useState(0);
  return (
    <IconContainer
      {...props}
      onLayout={event => setIconSize(event.nativeEvent.layout.height - 8)}>
      <IconBackground />
      <HeaderIcon
        name={icon}
        style={{height: iconSize + iconVerticalAdjust}}
        size={iconSize}
      />
    </IconContainer>
  );
};

export default CircleIconHeaderButton;

const IconContainer = styled.TouchableOpacity`
  height: 40px;
  width: 40px;
  border-radius: 20px;
  align-items: center;
  justify-content: center;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const IconBackground = styled(Animated.View)`
  position: absolute;
  height: 40px;
  width: 40px;
  border-radius: 20px;
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const HeaderIcon = styled(Icon).attrs(props => ({
  color: props.theme.colors.primary,
}))`
  position: absolute;
  text-align: center;
`;
