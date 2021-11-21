import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';

const Chevron = styled(Icon).attrs(props => ({
  name: 'chevron-forward-circle',
  size: 24,
  color: props.theme.colors.accent1,
}))``;

export default Chevron;
