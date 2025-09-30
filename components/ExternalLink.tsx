import { openBrowserAsync } from 'expo-web-browser';
import { TouchableOpacity, type TouchableOpacityProps } from 'react-native';
import { Platform } from 'react-native';

type Props = Omit<TouchableOpacityProps, 'onPress'> & { href: string };

export function ExternalLink({ href, ...rest }: Props) {
  return (
    <TouchableOpacity
      {...rest}
      onPress={async () => {
        if (Platform.OS !== 'web') {
          // Open the link in an in-app browser.
          await openBrowserAsync(href);
        } else {
          // On web, open in new tab
          window.open(href, '_blank');
        }
      }}
    />
  );
}
