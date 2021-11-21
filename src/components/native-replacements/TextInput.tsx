import React from 'react';
import {TextInputProps} from 'react-native';
import styled from 'styled-components/native';

class TextInput extends React.Component<TextInputProps> {
  render() {
    return (
      //@ts-ignore
      <BaseTextInput
        {...this.props}
        style={[
          {
            paddingVertical: 0,
            fontSize: 17,
            paddingTop: 10,
            paddingBottom: 10,
            fontFamily: 'Nunito',
            minHeight: 44,
          },
          this.props.style,
        ]}>
        {this.props.children}
      </BaseTextInput>
    );
  }
}

export default TextInput;

const BaseTextInput = styled.TextInput.attrs(({theme}) => ({
  selectionColor: theme.colors.primary,
  placeholderTextColor: theme.colors.accent2,
}))`
  color: ${({theme}) => theme.colors.text.primary};
`;
