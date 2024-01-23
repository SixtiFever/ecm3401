import { View, Text, Button, StyleSheet } from 'react-native'
import { useEffect, useState, useLayoutEffect } from 'react'
import { auth, firestore } from '../../firebaseConfig'
import { collection, doc, getDoc } from 'firebase/firestore'


const CafeDashboard = ({navigation}) => {

    const [cafe, setCafe] = useState(null);

    useEffect(() => {

        navigation.setOptions({
            'headerRight': () => (
                <Button title='Settings' onPress={() => navigation.navigate('Settings')} />
            )
        })
        
        getAndSetCafeData(setCafe);

    },[]);



    return (
        <View style={styles.container}>
            <View style={styles.dataContainer}>
                { cafe && <CurrentPromotionData currentPromotion={cafe.currentPromotion} /> }
                { cafe && <CafeTotalData cafe={cafe} /> }
            </View>
            <View style={styles.buttonContainer}>
                <Button title='Create promotion' onPress={() => console.log('Create promotion pressed')} />
                <Button title='End promotion' onPress={() => console.log('Promotion ended')} />
            </View>
        </View>
    )

}

function handleToCreatePromotion(nav) {
    nav.navigate('Create Promotion');
}

function handleToSettings(nav) {
    nav.navigate('Settings');
}

function getAndSetCafeData(setCafe) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, auth.currentUser.email.toLowerCase());
    getDoc(dRef).then(snap => {
        setCafe(snap.data());
    }).catch(err => {
        console.log('<CafeOnboarding.js> error pulling cafe data: ' + err);
    });
}


const CafeTotalData = ({cafe}) => {
    return (
        <View>
            <Text>Total stats</Text>
            <Text>Customers: {Object.keys(cafe.customers).length}</Text>
            <Text>Total scans: {cafe.scans}</Text>
            <Text>Total redeems: {cafe.redeems}</Text>
        </View>     
    )
}

const CurrentPromotionData = ({currentPromotion}) => {

    if ( Object.keys(currentPromotion).length > 0 ) {

        return (
            <View>
                <Text>Active promotion: {currentPromotion.title}</Text>
                <Text>Scans: {currentPromotion.customerScans}</Text>
                <Text>Redeems: {currentPromotion.customerRedeems}</Text>
                <Text>Scans per day: {currentPromotion.scansPerDay}</Text>
                <Text>Redeems per day: {currentPromotion.redeemsPerDay}</Text>
                <Text>Reward: {currentPromotion.reward}</Text>
                <Text>Scans needed: {currentPromotion.scansNeeded}</Text>
            </View>
        )

        } else {
            return (
                <View>
                    <Text>No promotion active</Text>
                </View>
            )
        }
}



const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    dataContainer: {
        height: '80%'
    },
    buttonContainer: {
        flex: 1,
        flexDirection: 'column',
        justifyContent: 'space-evenly',
        backgroundColor: 'yellow',
    }
})

export default CafeDashboard;