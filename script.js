<!DOCTYPE html>
<html lang="ar">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>تطبيق دردشة مع Firebase</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            background-color: #f4f4f4;
            margin: 0;
            padding: 0;
        }

        .chat-container {
            width: 400px;
            margin: 50px auto;
            border: 1px solid #ccc;
            border-radius: 5px;
            background: white;
            box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }

        .chat-header {
            background: #007bff;
            color: white;
            padding: 10px;
            text-align: center;
            border-top-left-radius: 5px;
            border-top-right-radius: 5px;
        }

        .chat-box {
            height: 300px;
            overflow-y: auto;
            padding: 10px;
        }

        .chat-message {
            margin: 5px 0;
        }

        #message-input {
            width: calc(100% - 80px);
            padding: 10px;
            border: 1px solid #ccc;
            border-radius: 5px;
        }

        #send-button {
            padding: 10px;
            background: #007bff;
            color: white;
            border: none;
            border-radius: 5px;
            cursor: pointer;
        }

        #send-button:hover {
            background: #0056b3;
        }
    </style>
</head>
<body>
    <div class="chat-container">
        <div class="chat-header">
            <h2>الدردشة العالمية</h2>
        </div>
        <div class="chat-box" id="chat-box"></div>
        <input type="text" id="message-input" placeholder="اكتب رسالتك هنا..." />
        <button id="send-button">إرسال</button>
    </div>

    <script type="module">
        // Firebase configuration and initialization
        import { initializeApp } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-app.js";
        import { getFirestore, collection, addDoc, onSnapshot, orderBy, query } from "https://www.gstatic.com/firebasejs/9.1.0/firebase-firestore.js";

        const firebaseConfig = {
            apiKey: "AIzaSyDkL37i0-pd885YbCBYOkADYQVQINcswhk",
            authDomain: "messengerapp-58f7a.firebaseapp.com",
            projectId: "messengerapp-58f7a",
            storageBucket: "messengerapp-58f7a.appspot.com",
            messagingSenderId: "46178168523",
            appId: "1:46178168523:web:cba8a71de3d7cc5910f54e"
        };

        const app = initializeApp(firebaseConfig);
        const db = getFirestore(app);

        // Send message
        document.getElementById('send-button').addEventListener('click', async () => {
            const messageInput = document.getElementById('message-input');
            const messageText = messageInput.value;

            if (messageText.trim() !== '') {
                try {
                    await addDoc(collection(db, "messages"), {
                        text: messageText,
                        timestamp: new Date()
                    });
                    messageInput.value = ''; // Clear input after sending
                    console.log("Message sent: ", messageText);
                } catch (error) {
                    console.error("Error sending message: ", error);
                }
            }
        });

        // Receive messages
        const messagesRef = query(collection(db, "messages"), orderBy("timestamp"));
        onSnapshot(messagesRef, (snapshot) => {
            const chatBox = document.getElementById('chat-box');
            chatBox.innerHTML = ''; // Clear existing messages
            snapshot.forEach(doc => {
                const messageElement = document.createElement('div');
                messageElement.classList.add('chat-message');
                messageElement.textContent = doc.data().text;
                chatBox.appendChild(messageElement);
            });
        });
    </script>
</body>
</html>
