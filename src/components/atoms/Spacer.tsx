import React from 'react';
import {View, ViewProps} from 'react-native';

interface SpacerProps extends ViewProps {
  size?: number;
  horizontal?: boolean;
  large?: boolean;
}

const Spacer: React.FC<SpacerProps> = props => {
  const size = props.size ? props.size : props.large ? 16 : 8;
  return (
    <View
      {...props}
      style={props.horizontal ? {width: size} : {height: size}}
    />
  );
};

export default Spacer;
