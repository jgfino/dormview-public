import React, {useState} from 'react';
import styled from 'styled-components/native';
import IconButton from '../atoms/IconButton';
import ListItem, {ListItemProps} from './ListItem';

interface ApprovalCardProps extends ListItemProps {
  onApprovePressed: () => Promise<void> | void;
  onRejectPressed: () => Promise<void> | void;
}

const ApprovalCard: React.FC<ApprovalCardProps> = ({
  onApprovePressed,
  onRejectPressed,
  ...props
}) => {
  const [approveLoading, setApproveLoading] = useState(false);
  const [rejectLoading, setRejectLoading] = useState(false);

  return (
    <ListItem
      {...props}
      RightFullComponent={
        <RightContainer>
          <RejectButton
            loading={rejectLoading}
            onPress={async () => {
              setRejectLoading(true);
              try {
                await onRejectPressed();
              } finally {
                setRejectLoading(false);
              }
            }}
          />
          <ApproveButton
            loading={approveLoading}
            onPress={async () => {
              setApproveLoading(true);
              try {
                await onApprovePressed();
              } finally {
                setApproveLoading(false);
              }
            }}
          />
        </RightContainer>
      }
    />
  );
};

export default ApprovalCard;

const RightContainer = styled.View`
  flex-direction: row;
`;

const ApproveButton = styled(IconButton).attrs(props => ({
  icon: 'checkmark',
  iconColor: 'white',
}))`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${({theme}) => theme.colors.confirm};
  margin-left: 10px;
`;

const RejectButton = styled(IconButton).attrs(props => ({
  icon: 'close',
  iconColor: 'white',
}))`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: ${({theme}) => theme.colors.destructive};
`;
