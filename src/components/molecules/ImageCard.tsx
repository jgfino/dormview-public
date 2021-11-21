import React from 'react';
import {ViewProps} from 'react-native';
import FastImage from 'react-native-fast-image';
//@ts-ignore
import Pinchable from 'react-native-pinchable';
import styled from 'styled-components/native';
import BlockButton, {BlockButtonProps} from '../atoms/BlockButton';
import ListSeparator from '../atoms/ListSeparator';
import Text from '../native-replacements/Text';

interface ImageCardProps extends ViewProps {
  uri: string;
  date: string;
  schoolName: string;
  dormName: string;
  number?: string;
  caption: string;
  showsBottomButton?: boolean;
  bottomButtonProps?: BlockButtonProps;
}

const ImageCard: React.FC<ImageCardProps> = ({
  uri,
  date,
  schoolName,
  dormName,
  caption,
  number,
  showsBottomButton,
  bottomButtonProps,
  ...props
}) => {
  return (
    <Container {...props}>
      <Pinchable>
        <Image source={{uri: uri}} />
      </Pinchable>
      <Card>
        <DateContainer>
          <Text size={16} weight="semibold" color="secondary2">
            {date}
          </Text>
        </DateContainer>
        <ListSeparator />
        <Text size={18} weight="semibold" color="primary">
          {schoolName}
        </Text>
        <Text size={18} weight="semibold" color="primary">
          {dormName}
        </Text>
        {number && (
          <Text size={17} weight="semibold" color="secondary1">
            {`Rm #${number}`}
          </Text>
        )}
        <ListSeparator />
        <Text size={16} weight="semibold">
          {caption}
        </Text>
        {showsBottomButton && <BottomButton {...bottomButtonProps} />}
      </Card>
    </Container>
  );
};

export default ImageCard;

const Container = styled.View`
  flex: 1;
`;

const Image = styled(FastImage)`
  aspect-ratio: 1;
`;

const Card = styled.View`
  justify-content: space-around;
  flex-grow: 1;
  margin-left: 16px;
  margin-right: 16px;
  margin-top: 16px;
  padding-left: 16px;
  padding-right: 16px;
  padding-top: 16px;
  padding-bottom: 16px;
  border-top-left-radius: 15px;
  border-top-right-radius: 15px;
  background-color: ${({theme}) => theme.colors.background.secondary2};
`;

const DateContainer = styled.View`
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
`;

const BottomButton = styled(BlockButton)`
  margin: 16px;
  background-color: ${({theme}) => theme.colors.destructive};
`;

const TextContainer = styled.TouchableOpacity``;
