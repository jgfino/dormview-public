import React from 'react';
import Text from '../native-replacements/Text';

interface BoldLabelTextProps {
  first: string;
  second: string;
  center?: boolean;
}
const BoldLabelText: React.FC<BoldLabelTextProps> = ({
  first,
  second,
  center,
}) => {
  return (
    <Text color="secondary1" align={center ? 'center' : 'left'} size={15}>
      {first}
      <Text size={17} weight="semibold" align={center ? 'center' : 'left'}>
        {second}
      </Text>
    </Text>
  );
};

export default BoldLabelText;
