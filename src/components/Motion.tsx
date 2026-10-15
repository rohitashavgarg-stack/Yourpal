import React, { useEffect, useRef, useState } from 'react';
import { StyleProp, TextStyle, View } from 'react-native';
import Animated from 'react-native-reanimated';
import { Txt } from '@/components/ui';
import { swapIn, wordIn } from '@/theme/motion';

// A headline that writes itself in, word by word (fade in and rise). Line breaks in the text are kept.
// Plays once when it mounts; give it a new `key` to play it again (e.g. a new slide).
export function RevealText({ text, style, delay = 0 }: { text: string; style?: StyleProp<TextStyle>; delay?: number }) {
  let n = 0;
  return (
    <View accessible accessibilityRole="header" accessibilityLabel={text.replace(/\n/g, ' ')}>
      {text.split('\n').map((line, li) => (
        <View key={li} style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {line.split(' ').map((w, wi, arr) => {
            const i = n++;
            return (
              <Animated.View key={wi} entering={wordIn(i, delay)}>
                <Txt style={style}>{wi < arr.length - 1 ? `${w} ` : w}</Txt>
              </Animated.View>
            );
          })}
        </View>
      ))}
    </View>
  );
}

// A short text that changes in place (a status pill, "Now" to "Logged"): the new value fades in, rising a little.
export function SwapText({ value, style, numberOfLines }: { value: string; style?: StyleProp<TextStyle>; numberOfLines?: number }) {
  const [initial] = useState(value); // the first value shows as is; later ones swap in
  return (
    <Animated.View key={value} entering={value === initial ? undefined : swapIn()}>
      <Txt numberOfLines={numberOfLines} style={style}>{value}</Txt>
    </Animated.View>
  );
}

// A number that counts to its new value when it changes (ease out, ~600 ms). The first value shows as is.
export function useCount(value: number, ms = 600) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const a = from.current, b = value;
    if (a === b) return;
    let raf = 0;
    const t0 = Date.now();
    const step = () => {
      const k = Math.min(1, (Date.now() - t0) / ms);
      const v = a + (b - a) * (1 - Math.pow(1 - k, 3));
      setShown(v);
      if (k < 1) raf = requestAnimationFrame(step); else from.current = b;
    };
    raf = requestAnimationFrame(step);
    return () => { cancelAnimationFrame(raf); from.current = b; };
  }, [value, ms]);
  return shown;
}
