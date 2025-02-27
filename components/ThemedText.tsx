import { Text, TextProps } from 'react-native';
import { useColorScheme } from '@/hooks/useColorScheme';

type ThemedTextProps = TextProps & {
  type?: 'default' | 'defaultSemiBold' | 'title' | 'link';
};

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';

  const baseStyle = {
    color: isDark ? '#FFFFFF' : '#000000',
  };

  const typeStyles = {
    default: {},
    defaultSemiBold: {
      fontWeight: '600' as const,
    },
    title: {
      fontSize: 32,
      fontWeight: 'bold' as const,
      color: isDark ? '#FFFFFF' : '#000000',
    },
    link: {
      color: '#E50914',
      textDecorationLine: 'underline' as const,
    },
  };

  return <Text style={[baseStyle, typeStyles[type], style]} {...props} />;
}