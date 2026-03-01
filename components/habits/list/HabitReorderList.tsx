import React from 'react';
import { Platform } from 'react-native';
import HabitsReorderListWeb from './HabitsReorderListWeb';
import HabitsReorderListMobile from './HabitsReorderListMobile';

const HabitReorderList = () => {
  return (
    Platform.OS === 'web' 
      ? <HabitsReorderListWeb />
      : <HabitsReorderListMobile />
  );
};

export default HabitReorderList;
