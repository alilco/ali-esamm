const auth = firebase.auth();
const resetEmail = document.getElementById('resetEmail');
const resetPasswordBtn = document.getElementById('resetPasswordBtn');
const resetMessage = document.getElementById('resetMessage');

// إرسال رابط إعادة تعيين كلمة المرور
resetPasswordBtn.addEventListener('click', () => {
  const email = resetEmail.value;
  if (email) {
    auth.sendPasswordResetEmail(email)
      .then(() => {
        resetMessage.innerText = "تم إرسال رابط إعادة تعيين كلمة المرور إلى بريدك.";
        resetMessage.style.color = "green";
      })
      .catch(error => {
        resetMessage.innerText = "خطأ: " + error.message;
        resetMessage.style.color = "red";
      });
  } else {
    resetMessage.innerText = "الرجاء إدخال بريد إلكتروني صحيح.";
    resetMessage.style.color = "red";
  }
});
