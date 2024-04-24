import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { auth, firestore } from '../../firebaseConfig';
import { collection, getDoc, runTransaction, doc } from 'firebase/firestore';

class NotificationController {

    constructor(){

        Notifications.setNotificationHandler({
            handleNotification: async () => ({
              shouldShowAlert: true,
              shouldPlaySound: false,
              shouldSetBadge: false,
            }),
          });
          
    }

    async sendPushNotification(expoPushToken, promotion) {

        // check display name containes a value, else push notification won't send
        const displayName = auth.currentUser.displayName != undefined ? auth.currentUser.displayName : 'Mangos';

        const message = {
          to: expoPushToken,
          sound: 'default',
         title: displayName,
          body: "New reward dropped: " + promotion.reward,
          data: { someData: 'goes here' },
        };

        await fetch('https://exp.host/--/api/v2/push/send', {
          method: 'POST',
          headers: {
            Accept: 'application/json',
            'Accept-encoding': 'gzip, deflate',
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(message),
        });

      }
      
      async registerForPushNotificationsAsync() {
        let token;
      
        if (Platform.OS === 'android') {
          Notifications.setNotificationChannelAsync('default', {
            name: 'default',
            importance: Notifications.AndroidImportance.MAX,
            vibrationPattern: [0, 250, 250, 250],
            lightColor: '#FF231F7C',
          });
        }
      
        if (Device.isDevice) {
          const { status: existingStatus } = await Notifications.getPermissionsAsync();
          let finalStatus = existingStatus;
          if (existingStatus !== 'granted') {
            const { status } = await Notifications.requestPermissionsAsync();
            finalStatus = status;
          }
          if (finalStatus !== 'granted') {
            alert('Failed to get push token for push notification!');
            return;
          }
          token = await Notifications.getExpoPushTokenAsync({
            projectId: Constants.expoConfig.extra.eas.projectId
          });
          console.log('Register for token async: ' + JSON.stringify(token));
      
        } else {
          alert('Must use physical device for Push Notifications');
        }

        /*
        
        Update tokens push tokens in user document, and then all associated cafe documents

        */

        runTransaction(firestore, async(transaction) => {
            const cRef = collection(firestore, 'users');
            const dRef = doc(cRef, auth.currentUser.email);
            const userDoc = await getDoc(dRef);


            // if new device -> Add token to user document, update each customer takens
            // in each cafe document that user has a card for
            try {
                let pushTokensArr = userDoc.data()['push_tokens']

                if ( pushTokensArr.includes(token.data) ) return;

                pushTokensArr.push(token.data)

                transaction.update(dRef, { 'push_tokens': pushTokensArr });

                const cafeCollection = collection(firestore, 'cafes');
                const cafeEmails = Object.keys(userDoc.data().cards);
                for ( let i = 0; i < cafeEmails.length; i++ ) {
                    const cafeDocRef = doc(cafeCollection, cafeEmails[i]);
                    transaction.set(cafeDocRef, { 'customers': { [auth.currentUser.email]: { 'push_tokens': pushTokensArr } } }, {merge: true} );
                }
            } catch (err) {
                console.log('<NotificationController.js/registerForPushNotificationsAsync> : ' + err);
            }

        }).catch(err => {
            console.log('<NotificationController.js/registerForPush...> : ' + err);
        })
      
        return token.data;
      }

}

export default NotificationController;