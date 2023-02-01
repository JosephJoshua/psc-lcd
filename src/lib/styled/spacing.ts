import theme from '@/theme';
import { css } from 'styled-components/native';

type Theme = typeof theme;
type Spacing = keyof Theme['spacing'];

export type SpacingProps = {
  pl?: Spacing;
  pr?: Spacing;
  pt?: Spacing;
  pb?: Spacing;
  ml?: Spacing;
  mr?: Spacing;
  mt?: Spacing;
  mb?: Spacing;
  mx?: Spacing;
  my?: Spacing;
  px?: Spacing;
  py?: Spacing;
};

export const spacingStyle = css<SpacingProps>`
  margin-left: ${(props) => theme.spacing[props.ml || props.mx || 'none']}px;
  margin-right: ${(props) => theme.spacing[props.mr || props.mx || 'none']}px;
  margin-top: ${(props) => theme.spacing[props.mt || props.my || 'none']}px;
  margin-bottom: ${(props) => theme.spacing[props.mb || props.my || 'none']}px;

  padding-left: ${(props) => theme.spacing[props.pl || props.px || 'none']}px;
  padding-right: ${(props) => theme.spacing[props.pr || props.px || 'none']}px;
  padding-top: ${(props) => theme.spacing[props.pt || props.py || 'none']}px;
  padding-bottom: ${(props) => theme.spacing[props.pb || props.py || 'none']}px;
`;
