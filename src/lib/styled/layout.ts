import styled from 'styled-components/native';

import { SpacingProps, spacingStyle } from './spacing';

export type FlexPosition =
  | 'start'
  | 'center'
  | 'end'
  | 'between'
  | 'around'
  | 'even'
  | 'stretch';

export type FlexContainerProps = {
  justify?: FlexPosition;
  items?: FlexPosition;
};

export const VBox = styled.View<FlexContainerProps & SpacingProps>`
  display: flex;
  flex-direction: column;
  justify-content: ${(props) => getFlexPosValue(props.justify || 'start')};
  align-items: ${(props) => getFlexPosValue(props.items || 'stretch')};

  ${spacingStyle};
`;

export const HBox = styled.View<FlexContainerProps & SpacingProps>`
  display: flex;
  flex-direction: row;
  justify-content: ${(props) => getFlexPosValue(props.justify || 'start')};
  align-items: ${(props) => getFlexPosValue(props.items || 'stretch')};

  ${spacingStyle};
`;

const getFlexPosValue = (pos: FlexPosition): string => {
  switch (pos) {
    case 'between':
      return 'space-between';

    case 'even':
      return 'space-evenly';

    case 'around':
      return 'space-around';

    default:
      return pos;
  }
};
