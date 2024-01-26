import { View, Text, Button, StyleSheet } from "react-native"
import { useState, useEffect } from "react"
import { collection, doc, getDoc, onSnapshot } from "firebase/firestore"
import { auth, firestore } from "../../firebaseConfig"
import { CameraView, Camera } from "expo-camera/next";
import Card from "../Card";

const UserCards = ({navigation}) => {

    const [cards, setCards] = useState(null);

    useEffect(() => {

        // pull users loyalty cards from firestore
        getLoyaltyCards(setCards);

        const cRef = collection(firestore, 'users');
        const dRef = doc(cRef, auth.currentUser.email);
        onSnapshot(dRef, (doc) => {
            setCards(doc.data().cards);
            console.log('Current data: ' + JSON.stringify(doc.data()));
        });

    }, []);

    /*
    - Put listener on users cards field -> Trigger re-render upon card updates
    */
    

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
        console.log(cards);
        setCards(cards)
    })
}


const MapCards = ({data}) => {
    return (
        Object.values(data).map( item => {
            return (
                <Card cafeName={item.cafeName} currentScans={item.currentScans} scansNeeded={item.scansNeeded} reward={item.reward} />
            )
        })
    )
}

function handleToScanner(nav) {
    nav.navigate('Scanner');
}

function userCardListener() {
    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);
    onSnapshot(dRef, (doc) => {
        console.log('Current data: ' + doc.data());
    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center'
    },

})

export default UserCards;