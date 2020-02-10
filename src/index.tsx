import * as React from 'react';
import {
  requireNativeComponent,
  View,
  findNodeHandle,
  Dimensions,
  ViewStyle,
  StyleProp,
  ViewProps,
  StyleSheet,
} from 'react-native';

type PreviewAction =
  | {
      type?: 'normal';
      selected?: boolean;
      label: string;
      onPress: () => void;
    }
  | {
      type: 'destructive';
      label: string;
      onPress: () => void;
    }
  | {
      type: 'group';
      label: string;
      actions: PreviewAction[];
    };

type MappedAction = (() => void) | undefined;

type TraversedAction =
  | {
      type: 'normal';
      selected?: boolean;
      label: string;
      onPress: () => void;
    }
  | {
      type: 'destructive';
      label: string;
      _key: number;
    }
  | {
      type: 'group';
      label: string;
      actions: TraversedAction[];
    };

type NativePeekAndPopViewRef = {
  setNativeProps(props: { childRef: null | number }): void;
};

type ActionEvent = { nativeEvent: { key: number } };

type Props = ViewProps & {
  renderPreview: () => React.ReactNode;
  previewActions?: PreviewAction[];
  onPeek?: () => void;
  onPop?: () => void;
  onDisappear?: () => void;
  children: React.ReactNode;
};

type State = {
  visible: boolean;
  traversedActions: TraversedAction[];
  mappedActions: MappedAction[];
};

const { width, height } = Dimensions.get('window');

export const NativePeekAndPopView: React.ComponentType<{
  ref: React.RefObject<NativePeekAndPopViewRef>;
  style: StyleProp<ViewStyle>;
  onPeek?: () => void;
  onPop?: () => void;
  onDisappear?: () => void;
  onAction: (event: ActionEvent) => void;
  previewActions: TraversedAction[];
  children: React.ReactNode;
}> = requireNativeComponent('PeekAndPop');

const traverseActions = (
  actions: PreviewAction[],
  actionsMap: MappedAction[]
) => {
  const traversedAction: TraversedAction[] = [];

  actions.forEach(currentAction => {
    if (currentAction.type === 'group') {
      const clonedAction = {
        ...currentAction,
        actions: traverseActions(currentAction.actions, actionsMap),
      };

      traversedAction.push(clonedAction);
    } else {
      const { onPress, ...clonedAction } = currentAction;
      // @ts-ignore
      clonedAction._key = actionsMap.length;
      actionsMap.push(onPress);
      traversedAction.push(clonedAction as TraversedAction);
    }
  });
  return traversedAction;
};

export default class PeekableView extends React.Component<Props, State> {
  static getDerivedStateFromProps(props: Props) {
    const mappedActions: MappedAction[] = [];
    const traversedActions = props.previewActions
      ? traverseActions(props.previewActions, mappedActions)
      : undefined;

    return {
      traversedActions,
      mappedActions,
    };
  }

  state: State = {
    visible: false,
    traversedActions: [],
    mappedActions: [],
  };

  preview = React.createRef<NativePeekAndPopViewRef>();
  sourceView = React.createRef<View>();

  componentDidMount() {
    this.preview.current &&
      this.preview.current.setNativeProps({
        childRef: findNodeHandle(this.sourceView.current),
      });
  }

  onDisappear = () => {
    this.setState({
      visible: false,
    });
    this.props.onDisappear && this.props.onDisappear();
  };

  onPeek = () => {
    this.setState({
      visible: true,
    });
    this.props.onPeek && this.props.onPeek();
  };

  onActionsEvent = ({ nativeEvent: { key } }: ActionEvent) => {
    const action = this.state.mappedActions[key];

    action && action();
  };

  render() {
    const {
      renderPreview,
      /* eslint-disable @typescript-eslint/no-unused-vars */
      previewActions,
      onPeek,
      onDisappear,
      /* eslint-enable @typescript-eslint/no-unused-vars */
      onPop,
      children,
      ...rest
    } = this.props;

    return (
      <React.Fragment>
        <View {...rest} ref={this.sourceView}>
          <NativePeekAndPopView
            // Renders nothing and inside view bound to the screen used by controller
            style={styles.peekAndPopView}
            onDisappear={this.onDisappear}
            onPeek={this.onPeek}
            onPop={onPop}
            ref={this.preview}
            previewActions={this.state.traversedActions}
            onAction={this.onActionsEvent}
          >
            <View style={{ width, height }}>
              {this.state.visible ? renderPreview() : null}
            </View>
          </NativePeekAndPopView>
          {children}
        </View>
      </React.Fragment>
    );
  }
}

const styles = StyleSheet.create({
  peekAndPopView: {
    width: 0,
    height: 0,
  },
});
