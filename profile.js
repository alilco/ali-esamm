import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

const storage = getStorage();
const user = firebase.auth().currentUser;

const profileImage = document.getElementById('profile-image');
const profilePic = document.getElementById('profile-pic');
const profileForm = document.getElementById('profile-form');

profileForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const file = profileImage.files[0];
  const storageRef = ref(storage, 'profile-pictures/' + user.uid);
  
  uploadBytes(storageRef, file).then(() => {
    getDownloadURL(storageRef).then((url) => {
      firebase.database().ref('users/' + user.uid).update({
        profilePicture: url
      }).then(() => {
        profilePic.src = url;
      });
    });
  });
});

// عرض حالة الاتصال (Online/Offline)
const userStatusDatabaseRef = firebase.database().ref('/status/' + user.uid);

firebase.database().ref('.info/connected').on('value', function(snapshot) {
  if (snapshot.val()) {
    userStatusDatabaseRef.onDisconnect().set('offline');
    userStatusDatabaseRef.set('online');
  } else {
    userStatusDatabaseRef.set('offline');
  }
});
