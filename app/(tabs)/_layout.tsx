import React from 'react';
import {useColorScheme} from '@/hooks/useColorScheme';
import HomeScreen from "@/app/(tabs)/index";

export default function TabLayout() {
    const colorScheme = useColorScheme();
    return (
        <HomeScreen/>
    );
}
