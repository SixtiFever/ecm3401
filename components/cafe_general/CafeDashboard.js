import { View, Text, Button, StyleSheet, Pressable } from 'react-native'
import { useEffect, useState, useLayoutEffect } from 'react'
import { auth, firestore } from '../../firebaseConfig'
import { collection, doc, getDoc, onSnapshot, setDoc } from 'firebase/firestore'


const CafeDashboard = ({route, navigation}) => {

    const [cafe, setCafe] = useState(null);

    useEffect(() => {

        navigation.setOptions({
            'headerRight': () => (
                <Button title='Settings' onPress={() => navigation.navigate('Settings')} />
            )
        })
        
        if ( cafe == null ) {
            getAndSetCafeData(setCafe);
        }

        const cRef = collection(firestore, 'cafes');
        const dRef = doc(cRef, auth.currentUser.email);
        onSnapshot(dRef, (snap) => {
            setCafe(snap.data())
        });
        

    },[]);




    return (
        <View style={styles.container}>
            <View style={styles.dataContainer}>
                <View style={styles.currentPromoContainer}>
                    { cafe && <CurrentPromotionData currentPromotion={cafe.currentPromotion} /> }
                </View>
                <View style={styles.totalDataContainer}>
                    { cafe && <CafeTotalData cafe={cafe} /> }
                </View>
            </View>
            <Pressable style={styles.createNewPromo} onPress={() => navigation.navigate('Create Promotion', { cafeData: cafe })}>
                <Text style={styles.btnText}>Create new Promotion</Text>
            </Pressable>
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
            <Text style={styles.dataHeading}>Total stats</Text>
            <View style={[styles.dataRow, { height: '60%' }]}>
                <View style={styles.dataCol}>
                    <Text>{Object.keys(cafe.customers).length}</Text>
                    <Text>Customers</Text>
                </View>
                <View style={styles.dataCol}>
                    <Text>{cafe.scans}</Text>
                    <Text>Scans</Text>
                </View>
                <View style={styles.dataCol}>
                    <Text>{cafe.redeems}</Text>
                    <Text>Redeems</Text>
                </View>
            </View>
        </View>     
    )
}

const CurrentPromotionData = ({currentPromotion}) => {
    const startDate = currentPromotion.startDate.split(',');
    if ( Object.keys(currentPromotion).length > 0 ) {

        return (
            <View style={styles.currentPromoInner}>
                <Text style={styles.dataHeading}>Current Promotion</Text>
                <View style={styles.dataRow}>
                    <View style={styles.dataCol}>
                        <Text>{currentPromotion.customerScans}</Text>
                        <Text>Scans</Text>
                    </View>
                    <View style={styles.dataCol}>
                        <Text>{currentPromotion.customerRedeems}</Text>
                        <Text>Redeems</Text>
                    </View>
                </View>
                <View style={styles.dataRow}>
                    <View style={styles.dataCol}>
                        <Text>{currentPromotion.scansPerDay}</Text>
                        <Text>Scans/day</Text>
                    </View>
                    <View style={styles.dataCol}>
                        <Text>{currentPromotion.redeemsPerDay}</Text>
                        <Text>Redeems/day</Text>
                    </View>
                </View>
                <View style={styles.dataRow}>
                    <View style={styles.dataCol}>
                        <Text>{startDate[0]}</Text>
                        <Text>Start date</Text>
                    </View>
                    <View style={styles.dataCol}>
                        <Text>{currentPromotion.scansNeeded}</Text>
                        <Text>Scans needed</Text>
                    </View>
                </View>
                <View>
                    <Text>Active reward: {currentPromotion.reward}</Text>
                </View>
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
        height: '85%',
        paddingStart: 15,
        paddingEnd: 15,
        paddingTop: 15,
    },
    createNewPromo: {
        height: '15%',
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'absolute',
        bottom: 0,
        backgroundColor: '#FE4A49',
    },
    btnText: {
        color: 'white',
        fontSize: 18,
        fontWeight: 'bold',
    },
    currentPromoContainer: {
        height: '60%',
        width: '100%',
    },
    currentPromoInner: {
        height: '90%',
        display: 'flex',
        justifyContent: 'space-evenly',
        paddingBottom: '8%'
    },
    totalDataContainer: {
        height: '40%',
        width: '100%',
    },
    dataHeading: {
        fontWeight: 'bold',
        fontSize: 18,
    },
    dataRow: {
        display: 'flex',
        flexDirection: 'row',
        justifyContent: 'space-evenly',
        alignItems: 'center',
        height: '25%',
    },
    dataCol: {
       display: 'flex',
       alignItems: 'center'
    }
})

export default CafeDashboard;