import { View, type ViewProps } from 'react-native';
import { Colors } from '@/lib/Colors';

export type ThemedViewProps = ViewProps & {
  backgroundColor?: string;
};

export function ThemedView({ 
  style, 
  backgroundColor = Colors.background, 
  className, 
  ...otherProps 
}: ThemedViewProps) {
  return (
    <View 
      className={className}
      style={[
        { backgroundColor },
        style
      ]}
      {...otherProps}
    />
  );
}
