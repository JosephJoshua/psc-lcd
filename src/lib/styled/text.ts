import { TextStyle } from 'react-native';
import theme from '@/theme';
import styled from 'styled-components/native';

import { SpacingProps, spacingStyle } from './spacing';

type Theme = typeof theme;

export type TextProps = {
  size?: keyof Theme['fontSize'];
  weight?: keyof Theme['fontWeight'];
  color?: keyof Theme['colors'];
  align?: TextStyle['textAlign'];
  lineHeight?: TextStyle['lineHeight'];
} & SpacingProps;

export const Text = styled.Text<TextProps>`
  font-size: ${(props) => theme.fontSize[props.size || 'sm']}px;
  font-weight: ${(props) => theme.fontWeight[props.weight || 'normal']};
  color: ${(props) => theme.colors[props.color || 'black']};
  text-align: ${(props) => props.align || 'left'};
  line-height: ${(props) =>
    theme.fontSize[props.size || 'sm'] * (props.lineHeight || 1.2)}px;

  ${spacingStyle};
`;
