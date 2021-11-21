import {useNavigation} from '@react-navigation/native';
import React, {useLayoutEffect} from 'react';
import {Platform} from 'react-native';
import Animated from 'react-native-reanimated';
import styled from 'styled-components/native';
import CircleIconHeaderButton from '../components/atoms/CircleIconHeaderButton';
import Spacer from '../components/atoms/Spacer';
import Text from '../components/native-replacements/Text';

interface RightIconHeaderProps {
  title: string;
  backTitle?: string;
  icons?: string[];
  iconActions?: (() => void | Promise<void>)[];
  animated?: boolean;
  opacity?: Animated.Node<number> | number;
  useBackArrow?: boolean;
}

/**
 * Sets up the main type of header for the app (back button + right icons)
 */
const useRightIconHeader = (props: RightIconHeaderProps) => {
  const {
    title,
    backTitle,
    icons,
    iconActions,
    opacity = 1,
    animated = false,
    useBackArrow = true,
  } = props;
  const navigation = useNavigation();

  const generateRightComponent = (curIndex: number = 0) => {
    if (!icons || !iconActions) return;

    if (curIndex >= icons.length) {
      return null;
    } else {
      return (
        <IconContainer>
          <StyledButton
            icon={icons[curIndex]}
            onPress={iconActions[curIndex]}
          />
          {curIndex < icons.length - 1 && <Spacer horizontal />}
          {generateRightComponent(curIndex + 1)}
        </IconContainer>
      );
    }
  };

  useLayoutEffect(() => {
    navigation.setOptions({
      title: title,
      headerShown: true,
      headerBackTitle: backTitle,
      headerStyle: {
        opacity: 1,
      },
      headerTransparent: animated,
      headerTitle: animated
        ? () => (
            <Animated.View style={{opacity: opacity}}>
              <TitleText size={17} weight="semibold" numberOfLines={1}>
                {title}
              </TitleText>
            </Animated.View>
          )
        : undefined,
      headerBackground: () => <NavBackground style={{opacity: opacity}} />,
      headerLeft: animated
        ? () =>
            navigation.canGoBack() &&
            useBackArrow && (
              <ComponentContainer>
                <StyledButton
                  icon={
                    Platform.select({
                      ios: 'chevron-back',
                      android: 'arrow-back',
                    }) ?? 'arrow-back'
                  }
                  onPress={() => navigation.goBack()}
                />
              </ComponentContainer>
            )
        : undefined,
      headerRight: () => (
        <ComponentContainer>{generateRightComponent()}</ComponentContainer>
      ),
    });
  }, [props, navigation]);
};

export default useRightIconHeader;

const TitleText = styled(Text)`
  max-width: 200px;
`;

const IconContainer = styled.View`
  flex-direction: row;
`;

const NavBackground = styled(Animated.View)`
  background-color: ${({theme}) => theme.colors.background.primary};
  border-bottom-color: ${({theme}) => theme.colors.accent2};
  border-bottom-width: 0.5px;
  flex: 1;
`;

const StyledButton = styled(CircleIconHeaderButton)``;

const ComponentContainer = styled.View`
  margin-left: ${({theme}) => theme.spacing.margins}px;
  margin-right: ${({theme}) => theme.spacing.margins}px;
`;
