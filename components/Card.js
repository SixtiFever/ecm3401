import { View, Text } from 'react-native';


const Card = ({cafeName, currentScans, scansNeeded, reward}) => {
    return (
        <View>
            <Text>Cafe: {cafeName}, Current Scans {currentScans}, Max {scansNeeded}, Reward: {reward}</Text>
        </View>
    )
}

export default Card;