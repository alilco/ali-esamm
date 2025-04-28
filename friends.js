const addFriendButton = document.getElementById('add-friend');
const friendUsername = document.getElementById('friend-username');
const friendsList = document.getElementById('friends-list');

addFriendButton.addEventListener('click', () => {
  const friend = friendUsername.value;
  
  if (friend) {
    firebase.database().ref('users').orderByChild('username').equalTo(friend).once('value', (snapshot) => {
      if (snapshot.exists()) {
        const friendUid = Object.keys(snapshot.val())[0];
        firebase.database().ref('friends/' + user.uid).push(friendUid);
        loadFriends();
      } else {
        alert('اسم المستخدم غير موجود');
      }
    });
  }
});

function loadFriends() {
  firebase.database().ref('friends/' + user.uid).on('value', (snapshot) => {
    friendsList.innerHTML = '';
    snapshot.forEach((childSnapshot) => {
      const friendUid = childSnapshot.val();
      firebase.database().ref('users/' + friendUid).once('value', (friendSnapshot) => {
        const li = document.createElement('li');
        li.textContent = friendSnapshot.val().username;
        friendsList.appendChild(li);
      });
    });
  });
}

loadFriends();
