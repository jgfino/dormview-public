import React from 'react';
import {FlatList, FlatListProps} from 'react-native';
import styled from 'styled-components/native';
import {spacing} from '../../../themes';
import BlockButton from '../atoms/BlockButton';
import Spacer from '../atoms/Spacer';
import EmptyMessage from '../molecules/EmptyMessage';

export interface CustomFlatListProps<T> extends FlatListProps<T> {
  showsTopButton?: boolean;
  topButtonTitle?: string;
  showsBottomButton?: boolean;
  bottomButtonTitle?: string;
  onTopButtonPressed?: () => void;
  onBottomButtonPressed?: () => void;
  emptyIcon?: string;
  emptyMessage?: string;
  hasPadding?: boolean;
  bottomButtonDestructive?: boolean;
}

class CustomFlatList<T> extends React.Component<CustomFlatListProps<T>, {}> {
  render() {
    const {
      showsTopButton = true,
      showsBottomButton = false,
      topButtonTitle,
      bottomButtonDestructive = true,
      bottomButtonTitle,
      onTopButtonPressed,
      onBottomButtonPressed,
      emptyIcon,
      emptyMessage,
      ListHeaderComponent,
      hasPadding = true,
      ...props
    } = this.props;
    return (
      <>
        <FlatList
          {...props}
          showsVerticalScrollIndicator={false}
          ListHeaderComponent={
            <HeaderContainer>
              {ListHeaderComponent}
              {showsTopButton ? (
                <TopButton text={topButtonTitle} onPress={onTopButtonPressed} />
              ) : null}
            </HeaderContainer>
          }
          ListEmptyComponent={() => (
            <EmptyMessage icon={emptyIcon} message={emptyMessage} />
          )}
          ItemSeparatorComponent={() => <Spacer />}
          contentContainerStyle={[
            {
              flexGrow: 1,
              padding: hasPadding ? spacing.margins : 0,
            },
            props.contentContainerStyle,
          ]}
          ListFooterComponentStyle={{
            flex: props.data!.length > 0 ? 1 : 0,
            justifyContent: 'flex-end',
          }}
          ListFooterComponent={
            showsBottomButton && bottomButtonDestructive ? (
              <DestructiveBottomButton
                text={bottomButtonTitle}
                onPress={onBottomButtonPressed}
              />
            ) : showsBottomButton ? (
              <BottomButton
                text={bottomButtonTitle}
                onPress={onBottomButtonPressed}
              />
            ) : null
          }
        />
      </>
    );
  }
}

export default CustomFlatList;

const HeaderContainer = styled.View``;

const TopButton = styled(BlockButton)`
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
  margin-bottom: ${({theme}) => theme.spacing.margins}px;
`;

const BottomButton = styled(BlockButton)`
  margin-top: ${({theme}) => theme.spacing.margins}px;
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
  background-color: ${({theme}) => theme.colors.primary};
`;

const DestructiveBottomButton = styled(BlockButton)`
  margin-top: ${({theme}) => theme.spacing.margins}px;
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
  background-color: ${({theme}) => theme.colors.destructive};
`;
