import React from 'react';
import { Platform } from 'react-native';
import HabitsListWeb from './HabitsListWeb';
import HabitsListMobile from './HabitsListMobile';

const HabitReorderList = () => {
  return (
    Platform.OS === 'web' 
      ? <HabitsListWeb />
      : <HabitsListMobile />
  );
};

export default HabitReorderList;
