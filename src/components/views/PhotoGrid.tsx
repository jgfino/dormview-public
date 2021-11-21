import {useNavigation} from '@react-navigation/core';
import React from 'react';
import {Dimensions, ListRenderItem, SectionListRenderItem} from 'react-native';
import FastImage from 'react-native-fast-image';
import {FlatGrid, SectionGrid} from 'react-native-super-grid';
import styled from 'styled-components/native';
import {spacing} from '../../../themes';
import {Photo} from '../../hooks/useSupabase';
import {Section} from '../../utils/generateSections';
import EmptyMessage from '../molecules/EmptyMessage';
import Text from '../native-replacements/Text';

interface PhotoGridProps {
  onRefresh: () => void;
  refreshing: boolean;
  pending: boolean;
  loadMore?: () => void | Promise<void>;
  emptyIcon?: string;
  emptyMessage?: string;
  onEndReached?: () => void | Promise<void>;
  initialNumToRender?: number;
  bypassAd?: boolean;
}

interface PhotoFlatGridProps extends PhotoGridProps {
  data: Photo[];
}

const PhotoFlatGrid: React.FC<PhotoFlatGridProps> = ({
  pending,
  emptyIcon,
  emptyMessage,
  bypassAd,
  ...props
}) => {
  const navigation = useNavigation();

  const renderItem: ListRenderItem<Photo> = ({item}) => {
    return (
      <ImageContainer
        onPress={() =>
          //@ts-ignore
          navigation.push('PhotoScreen', {
            photoId: item.id,
            pending: pending,
            bypassAd: bypassAd,
          })
        }>
        <Image source={{uri: item.thumb_url}} />
      </ImageContainer>
    );
  };

  return (
    <FlatGrid
      {...props}
      ListEmptyComponent={() => (
        <EmptyMessage icon={emptyIcon} message={emptyMessage} />
      )}
      contentContainerStyle={
        props.data.length === 0
          ? {
              flexGrow: 1,
              padding: spacing.margins,
            }
          : undefined
      }
      renderItem={renderItem}
      spacing={0}
      itemDimension={Dimensions.get('window').width / 3.1}
      onEndReachedThreshold={0.7}
      keyExtractor={(item, index) => item.id}
    />
  );
};

interface PhotoSectionGridProps extends PhotoGridProps {
  sections: Section<Photo>[];
}

const PhotoSectionGrid: React.FC<PhotoSectionGridProps> = ({
  pending,
  emptyIcon,
  emptyMessage,
  bypassAd,
  ...props
}) => {
  const navigation = useNavigation();

  const renderItem: ListRenderItem<Photo> = ({item}) => {
    return (
      <ImageContainer
        onPress={() =>
          //@ts-ignore
          navigation.push('PhotoScreen', {
            photoId: item.id,
            pending: pending,
            bypassAd: bypassAd,
          })
        }>
        <Image source={{uri: item.thumb_url}} />
      </ImageContainer>
    );
  };

  const renderSectionHeader: SectionListRenderItem<Photo, Section<Photo>> = ({
    section,
  }) => {
    return (
      <SectionHeaderContainer>
        <Text size={18} weight="semibold" color="secondary1">
          {section.title}
        </Text>
      </SectionHeaderContainer>
    );
  };

  return (
    // @ts-ignore
    <SectionGrid
      {...props}
      ListEmptyComponent={() => (
        <EmptyMessage icon={emptyIcon} message={emptyMessage} />
      )}
      renderItem={renderItem}
      spacing={0}
      itemDimension={Dimensions.get('window').width / 3.1}
      // SectionSeparatorComponent={<Spacer large />}
      //@ts-ignore
      renderSectionHeader={renderSectionHeader}
      contentContainerStyle={
        props.sections.length === 0
          ? {
              flexGrow: 1,
              padding: spacing.margins,
            }
          : undefined
      }
      onEndReachedThreshold={0.7}
      keyExtractor={(item, index) => item.id + index.toString()}
    />
  );
};

export {PhotoFlatGrid, PhotoSectionGrid};

const ImageContainer = styled.TouchableOpacity``;

const Image = styled(FastImage)`
  aspect-ratio: 1;
  flex: 1;
  min-height: ${Dimensions.get('window').width / 3}px;
`;

const SectionHeaderContainer = styled.View`
  background-color: ${({theme}) => theme.colors.background.secondary2};
  padding: 10px;
`;
