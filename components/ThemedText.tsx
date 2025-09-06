import { Text, type TextProps } from 'react-native';
import { Colors } from '@/lib/Colors';

export type ThemedTextProps = TextProps & {
  type?: 'default' | 'title' | 'defaultSemiBold' | 'subtitle' | 'link';
  color?: string;
};

export function ThemedText({
  style,
  type = 'default',
  color = Colors.text,
  className,
  ...rest
}: ThemedTextProps) {
  const typeClasses = {
    default: 'text-base leading-6',
    defaultSemiBold: 'text-base leading-6 font-semibold',
    title: 'text-3xl font-bold leading-8',
    subtitle: 'text-xl font-bold',
    link: 'leading-[30px] text-base',
  };

  return (
    <Text
      className={`${typeClasses[type]} ${className || ''}`}
      style={[{ color }, style]}
      {...rest}
    />
  );
}

