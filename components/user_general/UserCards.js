import { View, Text, Button, StyleSheet } from "react-native"
import { useState, useEffect } from "react"
import { collection, doc, getDoc } from "firebase/firestore"
import { auth, firestore } from "../../firebaseConfig"
import { CameraView, Camera } from "expo-camera/next";

const UserCards = ({navigation}) => {

    const [cards, setCards] = useState(null);

    useEffect(() => {

        // pull users loyalty cards from firestore
        getLoyaltyCards(setCards)

    }, []);

    return (
        <View style={styles.container}>
            { console.log(cards) }
            <View>
                { cards && <MapCards data={cards} /> }
            </View>
            <View>
                <Button title="Scan" onPress={() => handleToScanner(navigation)} />
            </View>

        </View>
    )
}

function getLoyaltyCards(setCards){
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    getDoc(dRef).then(snap => {
        const cards = snap.data()['cards'];
        setCards(cards)
    })
}


const MapCards = ({data}) => {
    return (
        Object.entries(data).map( item => {
            return (
                <Text>{item[0]}: {item[1]}</Text>
            )
        })
    )
}

function handleToScanner(nav) {
    nav.navigate('Scanner');
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

})

export default UserCards;