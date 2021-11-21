import React, {useContext} from 'react';
import {Platform, Text, TextProps} from 'react-native';
import {ThemeContext} from 'styled-components';

interface CustomTextProps extends TextProps {
  size: number;
  color?:
    | 'primary'
    | 'secondary1'
    | 'secondary2'
    | 'inverted'
    | 'accent'
    | 'white';
  weight?: 'bold' | 'semibold' | 'medium' | 'light';
  align?: 'left' | 'center' | 'right';
  italic?: boolean;
  underline?: boolean;
}

const CustomText: React.FC<CustomTextProps> = ({...props}) => {
  const theme = useContext(ThemeContext);
  const size = props.size;

  const weight = props.weight
    ? theme.fontWeight[props.weight]
    : theme.fontWeight.medium;

  const color = props.color
    ? props.color === 'accent'
      ? theme.colors.primary
      : theme.colors.text[props.color]
    : theme.colors.text.primary;

  let androidFontFamily =
    weight === '700'
      ? 'Nunito_Bold'
      : weight === '500'
      ? 'Nunito_SemiBold'
      : weight === '400'
      ? 'Nunito'
      : 'Nunito_Light';
  if (props.italic) {
    if (weight === '400') androidFontFamily += '_';
    androidFontFamily += 'Italic';
  }

  const align = props.align ?? 'left';

  return (
    <Text
      {...props}
      style={[
        props.style,
        // @ts-ignore
        {
          fontSize: Platform.select({ios: size, android: size}),
          fontFamily: Platform.select({
            ios: 'Nunito',
            android: androidFontFamily,
          }),
          fontWeight: Platform.select({ios: weight, android: undefined}),
          color: color,
          fontStyle: Platform.select({
            ios: props.italic ? 'italic' : 'normal',
            android: 'normal',
          }),
          textDecorationLine: props.underline ? 'underline' : 'none',
          textAlign: align,
        },
      ]}>
      {props.children}
    </Text>
  );
};

export default CustomText;
