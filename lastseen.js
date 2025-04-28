const lastSeenRef = firebase.database().ref('users/' + user.uid + '/lastSeen');
lastSeenRef.set(firebase.database.ServerValue.TIMESTAMP);

// لعرض آخر ظهور في صفحة الملف الشخصي:
firebase.database().ref('users/' + user.uid).once('value').then((snapshot) => {
  const lastSeen = snapshot.val().lastSeen;
  document.getElementById('last-seen').textContent = new Date(lastSeen).toLocaleString();
});
