import React from 'react';
import {Platform, SwitchProps} from 'react-native';
import styled from 'styled-components/native';
import Text from './Text';

interface SwitchLabelProps extends SwitchProps {
  label: string;
  sublabel?: string;
  showsBottomBorder?: boolean;
}

/**
 * A slider with 1-2 lines of text
 */
const SwitchLabel: React.FC<SwitchLabelProps> = ({
  label,
  sublabel,
  showsBottomBorder = true,
  ...props
}) => {
  return (
    <Container style={{borderBottomWidth: showsBottomBorder ? 1 : 0}}>
      <LabelContainer>
        <Text size={17}>{label}</Text>
        {sublabel ? (
          <Text size={14} color="secondary2">
            {sublabel}
          </Text>
        ) : null}
      </LabelContainer>
      <Switch {...props} />
    </Container>
  );
};

export default SwitchLabel;

const Container = styled.View`
  flex-direction: row;
  border-bottom-color: ${({theme}) => theme.colors.accent2};
  min-height: 50px;
  padding-top: 8px;
  padding-bottom: 8px;
  align-items: center;
  justify-content: space-between;
`;

const LabelContainer = styled.View`
  flex-direction: column;
  flex-shrink: 1;
`;

const oldIOS =
  parseInt(Platform.Version.toString(), 10) < 13 && Platform.OS === 'ios';

const Switch = styled.Switch.attrs(props => ({
  trackColor: {
    true: props.theme.colors.primary,
    false: props.theme.colors.background.secondary2,
  },
  ios_backgroundColor: oldIOS ? props.theme.colors.accent2 : undefined,
  thumbColor:
    Platform.OS === 'android' ? props.theme.colors.background.secondary1 : null,
}))`
  margin-right: 16px;
`;
