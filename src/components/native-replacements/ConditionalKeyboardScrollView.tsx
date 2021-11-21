import {useBottomTabBarHeight} from '@react-navigation/bottom-tabs';
import {useHeaderHeight} from '@react-navigation/elements';
import React, {useEffect, useState} from 'react';
import {
  Dimensions,
  Keyboard,
  Platform,
  ScrollViewProps,
  View,
} from 'react-native';
import {KeyboardAwareScrollView} from 'react-native-keyboard-aware-scroll-view';
import StaticSafeAreaInsets from 'react-native-static-safe-area-insets';

interface ConditionalKeyboardScrollViewProps extends ScrollViewProps {
  align?: 'top' | 'center';
  modal?: boolean;
}

/**
 * A ScrollView in which scrolling is only enabled if the content height overfills
 * the screen. It is keyboard aware and will adjust scrolling if neccessary when
 * the keyboard is visible. Also allows for centering content within the view while
 * maintaining keyboard-awareness and
 */
const ConditionalKeyboardScrollView: React.FC<ConditionalKeyboardScrollViewProps> =
  ({align = 'top', contentContainerStyle, children, modal, ...props}) => {
    const [isKeyboardVisible, setKeyboardVisible] = useState(false);
    const [contentHeight, setContentHeight] = useState(0);

    const adjustModal = Platform.OS === 'ios' && modal;

    let nav = 0;
    let tabBar = 0;

    try {
      nav = useHeaderHeight();
      tabBar = useBottomTabBarHeight();
    } catch {
      nav = 0;
      tabBar = 0;
    }

    const height =
      Dimensions.get('screen').height -
      (adjustModal
        ? StaticSafeAreaInsets.safeAreaInsetsTop +
          StaticSafeAreaInsets.safeAreaInsetsBottom +
          +25
        : nav + tabBar) +
      5;
    const margin = (height - contentHeight) / 2;

    // Setup keyboard listeners
    useEffect(() => {
      const keyboardDidShowListener = Keyboard.addListener(
        'keyboardDidShow',
        () => {
          setKeyboardVisible(true);
        },
      );
      const keyboardDidHideListener = Keyboard.addListener(
        'keyboardDidHide',
        () => {
          setKeyboardVisible(false);
        },
      );

      return () => {
        keyboardDidHideListener.remove();
        keyboardDidShowListener.remove();
      };
    }, []);

    return (
      <KeyboardAwareScrollView
        showsVerticalScrollIndicator={false}
        extraScrollHeight={Platform.select({ios: -margin, android: 0})}
        enableOnAndroid={true}
        {...props}
        contentContainerStyle={{
          flexGrow: 1,
          justifyContent: align === 'center' ? 'center' : 'flex-start',
        }}
        scrollEnabled={isKeyboardVisible || contentHeight >= height}>
        <View
          style={contentContainerStyle}
          onLayout={event => setContentHeight(event.nativeEvent.layout.height)}>
          {children}
        </View>
      </KeyboardAwareScrollView>
    );
  };

export default ConditionalKeyboardScrollView;
