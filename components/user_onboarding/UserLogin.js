import { View, Text, Button, StyleSheet, TextInput, Pressable } from "react-native"
import { useState } from "react";
import { auth } from "../../firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";


const UserLogin = ({navigation}) => {

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

    const handleLogin = (nav) => {
            signInWithEmailAndPassword(auth, email, password)
            .then((userCredential) => {
                // Signed in 
                const user = userCredential.user;
                navigation.navigate('User Cards');
                // ...
              })
              .catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
              });

    }

    return (
        <View style={styles.container}>
            <TextInput style={styles.textInput} placeholder="Email" onChangeText={setEmail} />
            <TextInput style={styles.textInput} placeholder="Password" onChangeText={setPassword} />
            <Pressable style={styles.pressableButton} onPress={() => handleLogin(navigation)}>
                <Text style={styles.pressableText}>Login</Text>
            </Pressable>
            <Pressable style={styles.toSignupContainer} onPress={() => handleToSignup(navigation)} >
                <Text style={{ color: 'blue', fontSize: 18}}>Signup</Text>
            </Pressable>
        </View>
    )
}

function handleToSignup(nav) {
    nav.navigate('Signup');
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textInput : {
        width: '80%',
        height: 60,
        borderRadius: 6,
        color: '#1B0229',
        paddingStart: 15,
        backgroundColor: '#E3E3E3',
        borderWidth: .5,
        marginTop: 12,
    },
    pressableButton: {
        width: '80%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: 6,
        backgroundColor: '#F70084',
        marginTop: 20,
    },
    pressableText: {
        color: 'white',
    },
    toSignupContainer: {
        height: 50,
        marginTop: 10,
        display: 'flex',
        justifyContent: 'center',
    }
})

export default UserLogin;