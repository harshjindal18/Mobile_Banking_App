import React from 'react'
import { Link } from "expo-router";
import { View } from "react-native";

const Profile = () => {

    return (
        <>
            <View className="w-full justify-center items-center pt-3 flex-row mt-20">
                <Link href="/Login" className="text-lg text-secondary mx-2">Logout</Link>
            </View>
        </>
    )
}
export default Profile
