import React, {useState} from 'react';
import {ViewProps} from 'react-native';
import FastImage from 'react-native-fast-image';
import styled from 'styled-components/native';
import CircleIconHeaderButton from '../atoms/CircleIconHeaderButton';
import IconButton from '../atoms/IconButton';
import Text from '../native-replacements/Text';
import CardView from '../views/CardView';

interface ApprovalCardPhotoProps extends ViewProps {
  title: string | undefined;
  caption: string;
  uri: string;

  onInfoPressed: () => void;
  onApprovePressed: () => Promise<void> | void;
  onRejectPressed: () => Promise<void> | void;
}

const ApprovalCardPhoto: React.FC<ApprovalCardPhotoProps> = ({
  title,
  caption,
  uri,
  onInfoPressed,
  onApprovePressed,
  onRejectPressed,
}) => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  return (
    <Container>
      <Image source={{uri: uri}} />
      <InfoButton onPress={onInfoPressed} />
      <TextContainer>
        <TitleText size={17} weight="semibold">
          {title}
        </TitleText>
        <CaptionText size={16} color="secondary1">
          {caption}
        </CaptionText>
      </TextContainer>
      <BottomContainer>
        <RejectButton
          onPress={async () => {
            setRejectLoading(true);
            try {
              await onRejectPressed();
            } finally {
              setRejectLoading(false);
            }
          }}
          loading={rejectLoading}
        />
        <ApproveButton
          onPress={async () => {
            setApproveLoading(true);
            try {
              await onApprovePressed();
            } finally {
              setApproveLoading(false);
            }
          }}
          loading={approveLoading}
        />
      </BottomContainer>
    </Container>
  );
};

export default ApprovalCardPhoto;

const Container = styled(CardView)`
  flex: 1;
`;

const InfoButton = styled(CircleIconHeaderButton).attrs(props => ({
  icon: 'information-circle',
  iconVerticalAdjust: 1,
}))`
  top: 16px;
  right: 16px;
  position: absolute;
`;

const Image = styled(FastImage)`
  aspect-ratio: 1;
`;

const TextContainer = styled.View`
  padding: 16px;
  flex: 1;
`;

const TitleText = styled(Text)``;

const CaptionText = styled(Text)``;

const BottomContainer = styled.View`
  flex-direction: row;
  height: 56px;
`;

const RejectButton = styled(IconButton).attrs(props => ({
  icon: 'close',
  iconColor: 'white',
}))`
  background-color: ${({theme}) => theme.colors.destructive};
  flex: 1;
`;

const ApproveButton = styled(IconButton).attrs(props => ({
  icon: 'checkmark',
  iconColor: 'white',
}))`
  background-color: ${({theme}) => theme.colors.confirm};
  flex: 1;
`;
