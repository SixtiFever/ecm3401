import { View, Text, Button, StyleSheet, TextInput } from "react-native"
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
            <Button title="Login" onPress={() => handleLogin(navigation)} />
            <Button title="Signup" onPress={() => handleToSignup(navigation)} />
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
        height: 50,
        borderWidth: .5,
        borderColor: 'black',
        borderRadius: 4,
        paddingStart: 10,
        marginTop: 12,
    },
})

export default UserLogin;