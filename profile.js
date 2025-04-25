import { auth, db, storage } from "./firebase.js";
import {
  updateProfile,
  onAuthStateChanged
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-auth.js";
import {
  ref as dbRef,
  update
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-database.js";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL
} from "https://www.gstatic.com/firebasejs/10.12.0/firebase-storage.js";

onAuthStateChanged(auth, user => {
  if (!user) window.location.href = "login.html";

  document.getElementById("saveBtn").addEventListener("click", async () => {
    const displayName = document.getElementById("displayName").value;
    const status = document.getElementById("status").value;
    const imageFile = document.getElementById("profileImage").files[0];

    let imageURL = user.photoURL;

    if (imageFile) {
      const storagePath = storageRef(storage, "profiles/" + user.uid);
      await uploadBytes(storagePath, imageFile);
      imageURL = await getDownloadURL(storagePath);
    }

    await updateProfile(user, { displayName, photoURL: imageURL });
    await update(dbRef(db, "users/" + user.uid), {
      displayName,
      status,
      profileImage: imageURL
    });

    alert("تم تحديث الملف الشخصي بنجاح!");
  });
});
