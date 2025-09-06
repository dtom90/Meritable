
import { useState, useEffect } from 'react';
import { Platform, Dimensions } from 'react-native';

const useWindowWidth = () => {
  // For React Native, use Dimensions API; for web, use window
  const getInitialWidth = () => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      return window.innerWidth;
    }
    return Dimensions.get('window').width;
  };

  const [width, setWidth] = useState(getInitialWidth);

  useEffect(() => {
    if (Platform.OS === 'web' && typeof window !== 'undefined') {
      // Web environment - use window events
      const handleResize = () => setWidth(window.innerWidth);
      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    } else {
      // React Native environment - use Dimensions API
      const subscription = Dimensions.addEventListener('change', ({ window: { width: newWidth } }) => {
        setWidth(newWidth);
      });
      return () => subscription?.remove();
    }
  }, []);

  return width;
};

export default useWindowWidth;
