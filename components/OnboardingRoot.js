import { View, Text, Button, StyleSheet } from "react-native"

const OnboardingRoot = ({navigation}) => {
    return (
        <View style={styles.container}>
            <Text>Are you a...</Text>
            <Button title="Customer" onPress={() => handleToUser(navigation)} />
            <Button title="Cafe" onPress={() => handleToCafe(navigation)} />
        </View>
    )
}

function handleToUser(nav) {
    nav.navigate('Login');
}

function handleToCafe(nav) {
    nav.navigate('Cafe Login');
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    }
})
    

export default OnboardingRoot;