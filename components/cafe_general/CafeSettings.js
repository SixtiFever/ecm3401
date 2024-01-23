import { View, Text, Button } from "react-native"
import { auth, firestore } from "../../firebaseConfig";
import { deleteUser, signOut } from "firebase/auth";
import { collection, deleteDoc, setDoc, doc }    from "firebase/firestore";

const CafeSettings = ({navigation}) => {
    return (
        <View>
            <Text>Settings</Text>
            <Button title="Logout" onPress={() => handleLogout(navigation)} />
            <Button title="Delete account" onPress={null} />
        </View>
    )
}

function handleLogout(nav) {
    signOut(auth).then(() => {
        nav.navigate('Cafe Login');
    }).catch(err => {
        console.log('<CafeSettings.js> Error signing out: ' + err);
    })
}

function handleDeleteAccount(nav) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email);
    deleteUser(auth.currentUser).then(() => {
        setDoc(dRef, {}).then(() => {
            deleteDoc(dRef).then(() => {
                console.log('Successfully deleted document');
                nav.navigate('Cafe Login');
            }).catch(err => {
                console.log('<CafeSettings.js>: ' + err);
            })
        }).catch(err => {
            console.log('<CafeSettings.js>: ' + err);
        })
    }).catch(err => {
        console.log('<CafeSettings.js> Error deleting user: ' + err);
    })
}

export default CafeSettings;