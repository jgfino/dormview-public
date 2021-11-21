import React from 'react';
import {TouchableOpacityProps} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import styled from 'styled-components/native';
import Chevron from '../atoms/Chevron';
import Text from '../native-replacements/Text';

export interface ListItemProps extends TouchableOpacityProps {
  title: string;
  subtitle?: string[];
  subtitle2?: string;
  icon?: string;
  italic?: boolean;
  RightComponent?: JSX.Element;
  RightFullComponent?: JSX.Element;
}

/**
 * An item cell with an async image on the left, a title, subtitle, and optional second subtitle
 */
const ListItem: React.FC<ListItemProps> = ({
  title,
  subtitle,
  subtitle2,
  icon,
  italic,
  RightComponent,
  RightFullComponent,
  ...props
}) => {
  const formatSubtitle = (curIndex: number = 0) => {
    if (!subtitle) return null;

    const subtitleComponents: JSX.Element[] = [];

    subtitle.forEach((item, index) => {
      subtitleComponents.push(
        <Text
          size={14}
          weight="semibold"
          color="secondary2"
          numberOfLines={1}
          italic={italic}>
          {item}
        </Text>,
      );

      if (index === subtitle.length - 1) {
        return;
      }

      subtitleComponents.push(
        <Text size={16} color="accent" style={{fontFamily: 'Nunito_SemiBold'}}>
          {' • '}
        </Text>,
      );
    });

    return subtitleComponents;
  };

  return (
    <ItemContainer {...props}>
      {icon && <LeftIcon name={icon} size={24} />}
      <TextContainer>
        <Text size={17} weight="semibold" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <SubtitleContainer>{formatSubtitle()}</SubtitleContainer>
        ) : null}
        {subtitle2 && (
          <Text size={14} weight="semibold" color="secondary2">
            {subtitle2}
          </Text>
        )}
      </TextContainer>
      {RightComponent && RightComponent}
      {RightFullComponent ? RightFullComponent : <Chevron />}
    </ItemContainer>
  );
};

export default ListItem;

const ItemContainer = styled.TouchableOpacity`
  justify-content: space-between;
  flex-direction: row;
  align-items: center;
  padding-top: ${({theme}) => theme.spacing.margins}px;
  padding-bottom: ${({theme}) => theme.spacing.margins}px;
  padding-right: ${({theme}) => theme.spacing.margins}px;
  padding-left: ${({theme}) => theme.spacing.margins}px;
  border-radius: 15px;
  background-color: ${({theme}) => theme.colors.background.secondary2};
`;

const LeftIcon = styled(Icon).attrs(({theme}) => ({
  color: theme.colors.primary,
}))`
  margin-right: ${({theme}) => theme.spacing.itemSpacing}px;
`;

const TextContainer = styled.View`
  justify-content: center;
  flex-direction: column;
  flex: 1;
`;

const SubtitleContainer = styled.View`
  flex-direction: row;
  align-items: center;
`;
