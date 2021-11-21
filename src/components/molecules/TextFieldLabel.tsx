import React from 'react';
import {TextInputProps} from 'react-native';
import styled from 'styled-components/native';
import Text from '../native-replacements/Text';
import TextInput from '../native-replacements/TextInput';

interface TFLabelProps extends TextInputProps {
  label: string;
}

/**
 * A text field with a label above it
 */
class TextFieldLabel extends React.Component<TFLabelProps> {
  render() {
    const {label, ...props} = this.props;
    return (
      <Container>
        <Text size={14} color="secondary2">
          {label}
        </Text>
        <Field {...props} />
      </Container>
    );
  }
}

export default TextFieldLabel;

const Container = styled.View``;

const Field = styled(TextInput)`
  border-bottom-color: ${({theme}) => theme.colors.accent2};
  border-bottom-width: 1px;
  font-size: 18px;
  margin-bottom: 4px;
`;
