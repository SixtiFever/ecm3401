import { View, Text, Button, StyleSheet, Pressable, Image } from "react-native"

const logo = require('../assets/lb_logo.png');

const OnboardingRoot = ({navigation}) => {
    return (
        <View style={styles.container}>
            <View style={styles.logoContainer}>
                <Image style={styles.logoImage} source={logo} />
            </View>
            <View style={styles.inputsContainer}>

                <Pressable style={styles.pressableButton} onPress={() => handleToUser(navigation)}>
                    <Text style={styles.pressableText}>I'm a customer</Text>
                </Pressable>
                <Pressable style={[styles.pressableButton, {backgroundColor: 'blue'}]} onPress={() => handleToCafe(navigation)}>
                    <Text style={styles.pressableText}>I'm a cafe</Text>
                </Pressable>

            </View>
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
    },
    logoContainer: {
        width: '100%',
        height: '60%',
        position: 'absolute',
        top: 0,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
    },
    inputsContainer: {
        width: '100%',
        height: '40%',
        position: 'absolute',
        bottom: 0,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-evenly'
    },
    pressableButton: {
        width: '80%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#F70084',
    },
    pressableText: {
        color: 'white',
    },
    logoImage: {
        height: 150,
        width: 150,
    }
})
    

export default OnboardingRoot;