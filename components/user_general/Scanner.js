import { useState, useEffect } from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';
import { AutoFocus, Camera, CameraType, CameraView } from 'expo-camera';
import { firestore, auth } from '../../firebaseConfig';
import { getDoc, collection, doc, setDoc, updateDoc, runTransaction } from 'firebase/firestore';

const Scanner = ({navigation}) => {
    const [type, setType] = useState(CameraType.back);
    const [permission, requestPermission] = Camera.useCameraPermissions();
    const [hasPermission, setHasPermission] = useState(null);
    const [scanned, setScanned] = useState(false);

    useEffect(() => {

        // pull users loyalty card data

    }, []);

    const handleBarCodeScanned = async ({ type, data }) => {
        setScanned(true);

        /*
        - Check if the user has a virtual card for the cafe
            - True -> Increment card by 1
            - False -> Pull cafe data from 'cafes' and create field in user document
        */

        if ( await hasUserVisitedCafeBefore(data) ) {

            console.log('Returning customer');
            await updateLoyaltyCard(data);
            await updateCafeDoc(data);
        } else {
            handleFirstScan(data).then(() => {
                console.log('Handle first scan finished');
            }).catch(err => {
                console.log('Error with handleFirstScan: ' + err);
            })
        }

        alert(`${data} has been scanned!`);
    };

    if (permission) {
        return (
            <View style={styles.container}>

                <Camera 
                    onBarCodeScanned={scanned ? undefined : handleBarCodeScanned} 
                    autoFocus={AutoFocus.on} 
                    style={styles.camera} 
                    type={CameraType.back}>
                </Camera>

            </View>
        );
      } else if (permission === false) {
            return (
                <Text>Permission not granted</Text>
            );
    } else {
            return (
                <Text>Something</Text>
            );
    }
}




/* FUNCTIONS */
/*
@param1 -> Cafe email
creates loyalty instances in cafe.customers and user.cafes 
*/
async function handleFirstScan(cafeEmail) {
    const cafeCollectionRef = collection(firestore, 'cafes');
    const cafeDocRef = doc(cafeCollectionRef, cafeEmail);

    const userCollectionRef = collection(firestore, 'users');
    const userDocRef = doc(userCollectionRef, auth.currentUser.email);

    try {
        await runTransaction(firestore, async ( transaction ) => {
            const cafeSnap = await getDoc(cafeDocRef);
            if ( !cafeSnap.exists() ) {
                throw "<Scanner.js/handleFirstScan> Cafe doc doesn't exist";
            } else {
                const newPromotionScans = cafeSnap.data().currentPromotion.customerScans + 1;
                const newScansTotal = cafeSnap.data().scans + 1;
                transaction.set(cafeDocRef, { customers: { [auth.currentUser.email] : { 'current': 1, 'redeems': 0, 
                'loyaltyPoints': 5, 'rank':0, 'totalScans': 1 } }}, {merge: true});
                transaction.set(cafeDocRef, { currentPromotion: { customerScans: newPromotionScans } }, {merge: true});
                transaction.set(cafeDocRef, { scans: newScansTotal }, {merge: true} );
            }
        })
    } catch(err) {
        console.log(err);
    }

    const cafeSnap = await getCafeData(cafeEmail);
    const card = generateLoyaltyCard(cafeSnap.data());
    await setDoc(userDocRef, {  cards: card } , {merge:true});

}

/*
 updates cafe document: total scans, customers total scans, customers loyalty points
*/
async function updateCafeDoc(cafeEmail) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, cafeEmail);

    try {
        await runTransaction(firestore, async (transaction) => {
            const cafeDoc = await getDoc(dRef);
            if( !cafeDoc.exists() ) {

                throw "Cafe document doesn't exist";

            } else {

                const email = auth.currentUser.email
                const newCustomerPoints = cafeDoc.data().customers[auth.currentUser.email].loyaltyPoints + 5;
                const newCustomerTotalScans = cafeDoc.data().customers[auth.currentUser.email].totalScans + 1;
                const newCurrent = cafeDoc.data().customers[auth.currentUser.email].current + 1;
                const newPromotionCustomerScans = cafeDoc.data().currentPromotion.customerScans + 1;
                const newCafeTotalScans = cafeDoc.data().scans + 1;

                if ( newCurrent > cafeDoc.data().currentPromotion.scansNeeded ) {

                    const newPromotionRedeem = cafeDoc.data().currentPromotion.customerRedeems + 1;
                    const newCustomerRedeems = cafeDoc.data().customers[auth.currentUser.email].redeems + 1;
                    const newTotalRedeems = cafeDoc.data().redeems + 1;

                    transaction.set(dRef, { customers : { [email]: { current: 0 } } }, { merge: true });
                    transaction.set(dRef, { customers : { [email]: { redeems: newCustomerRedeems } } }, { merge: true });
                    transaction.set(dRef, { currentPromotion : { customerRedeems: newPromotionRedeem  } }, { merge: true });
                    transaction.set(dRef, { redeems : newTotalRedeems }, { merge: true });

                } else {

                    transaction.set(dRef, { customers : { [email]: { current: newCurrent } } }, { merge: true });

                }

                transaction.set(dRef, { customers : { [email]: { totalScans: newCustomerTotalScans } } }, { merge: true });
                transaction.set(dRef, { customers : { [email]: { loyaltyPoints: newCustomerPoints } } }, { merge: true });
                transaction.set(dRef, { currentPromotion: { customerScans: newPromotionCustomerScans }}, { merge: true });
                transaction.set(dRef, { scans: newCafeTotalScans }, { merge: true });

            }
        });
    } catch(err) {
        console.log('<Scanner.js/updateCafeCustomerField> error: ' + err);
    }
}

async function updateLoyaltyCard(cafeEmail) {

    const cRef = collection(firestore, 'users');
    const dRef = doc(cRef, auth.currentUser.email);

    try {
        await runTransaction(firestore, async (transaction) => {
            const userDoc = await getDoc(dRef);
            if ( !userDoc.exists() ) {
                throw "User document doesn't exist";
            } else {
                const newVal = userDoc.data().cards[cafeEmail].currentScans + 1;
                if ( newVal > userDoc.data().cards[cafeEmail].scansNeeded ) {
                    transaction.set(dRef, { cards: { [cafeEmail]: { currentScans: 0 } } }, {merge: true} );
                } else {
                    transaction.set(dRef, { cards: { [cafeEmail]: { currentScans: newVal } } }, {merge: true} );
                }
                
            }
        });
    } catch(err) {
        console.log('<Scanner.js> Error running transaction: ' + err);
    }
}


/*
@param1 -> QR Code data
Checks whether the user currently has a virtual loyalty card for that cafe
*/
async function hasUserVisitedCafeBefore(cafeEmail) {
    const cRef = collection(firestore, 'cafes')
    const dRef = doc(cRef, cafeEmail);
    const snap = await getDoc(dRef);
    if ( snap.data()['customers'][auth.currentUser.email] != undefined ) {
        return true;
    } else {
        return false;
    }
}


/*
@Param1 -> cafe email
returns a snap of the cafe document
*/
async function getCafeData(scanData) {
    const cRef = collection(firestore, 'cafes');
    const dRef = doc(cRef, scanData);
    const snap = await getDoc(dRef);
    if ( snap.exists() ) {
        return snap;
    }
}

/*
@Param1 -> Snapshot of cafe document
Returns object consisting of contents for the users digital loyalty card.
- Email (key), name, currentPromotion.reward, scansNeeded, postcode, currentScans
*/
function generateLoyaltyCard(cafeSnap){

    const card = {
        'cafeEmail': cafeSnap['cafeEmail'],
        'cafeName': cafeSnap['cafeName'],
        'reward': cafeSnap.currentPromotion.reward,
        'scansNeeded': cafeSnap.currentPromotion.scansNeeded,
        'postcode': cafeSnap.postcode,
        'currentScans': 1,
    }
    return { [cafeSnap.cafeEmail]: card };
}


const styles = StyleSheet.create({
    container: {
      flex: 1,
      flexDirection: "column",
      justifyContent: "center",
    },
    camera: {
        width: '100%',
        height: '100%',
    }
});

export default Scanner;