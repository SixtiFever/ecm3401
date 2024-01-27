import { View, Text, StyleSheet } from 'react-native';


const Card = ({cafeName, currentScans, scansNeeded, reward}) => {
    return (
        <View style={styles.cardBackground}>
            <Text>Cafe: {cafeName}</Text>
            <Text>Current Scans: {currentScans}</Text>
            <Text>Scans Needed: {scansNeeded}</Text>
            <Text>Reward: {reward}</Text>
        </View>
    )
}

const styles = StyleSheet.create({
    cardBackground: {
        backgroundColor: 'white',
        borderRadius: 8,
        padding: 4,
        height: 150,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        marginTop: 25,
        width: '100%'
      }
    })

export default Card;