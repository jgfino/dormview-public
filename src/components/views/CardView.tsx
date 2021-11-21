import React, {useContext} from 'react';
import {ViewProps} from 'react-native';
import {ThemeContext} from 'styled-components';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';

interface CardViewProps extends ViewProps {
  label?: string;
}

const CardView: React.FC<CardViewProps> = ({label, ...props}) => {
  const theme = useContext(ThemeContext);
  return (
    <>
      {label && (
        <LabelText size={14} color="secondary2">
          {label}
        </LabelText>
      )}
      <Card {...props}>{props.children}</Card>
    </>
  );
};

export default CardView;

const Card = styled.View`
  border-top-width: 1px;
  border-bottom-width: 1px;
  border-color: ${({theme}) => theme.colors.accent2};
  background-color: ${({theme}) => theme.colors.background.primary};
`;

const LabelText = styled(Text)`
  margin-left: 16px;
  margin-top: 16px;
  margin-bottom: 8px;
`;
