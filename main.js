// --- Firebase Config ---
const firebaseConfig = {
  apiKey: "AIzaSyA8b2SO1E0FCUf1BFvpGs4jNZbJSbofIdE",
  authDomain: "detect-and-mark-mobile-system.firebaseapp.com",
  databaseURL: "https://detect-and-mark-mobile-system-default-rtdb.firebaseio.com",
  projectId: "detect-and-mark-mobile-system",
  storageBucket: "detect-and-mark-mobile-system.firebasestorage.app",
  messagingSenderId: "685772763226",
  appId: "1:685772763226:web:aff3564e44d4577b4e6863"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);


// --- REGISTER ---
function sign() {

  email = document.getElementById("email").value;
  password = document.getElementById("password").value;
  confirmPass = document.getElementById("confirmPass").value;

  if (!email || !password || !confirmPass) {
    alert("נא למלא את כל השדות");
    return;
  }

  if (password !== confirmPass) {
    alert("הסיסמאות אינן תואמות");
    return;
  }

  firebase.auth()
    .createUserWithEmailAndPassword(email, password)
    .then((userCredential) => {

      user = userCredential.user;

      newUser = {
        uid: user.uid,
        email: email,
        createdAt: Date.now(),
        role: "user"
      };

      firebase.database().ref("users/" + user.uid).set(newUser)
        .then(() => {

          firebase.auth().signOut().then(() => {
            window.location.href = "index.html";
          });

        });

    })
    .catch((error) => {
      alert(error.message);
    });
}



// --- LOGIN ---
function login() {

    email = document.getElementById("email").value;
    password = document.getElementById("password").value;

    if (!email || !password) {
        alert("נא למלא את כל השדות");
        return;
    }

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then((userCredential) => {

            console.log("User logged in:", userCredential.user.uid);

            // מעבר לעמוד הראשי
            window.location.href = "background_instructions.html";

        })
        .catch((error) => {
            alert("שגיאה: " + error.message);
        });
}




// --- AUTH STATE MANAGER (Navbar + Logout + Page Protection) ---
firebase.auth().onAuthStateChanged(user => {

    navbar = document.getElementById("mainNavbar");
    signOutBtn = document.getElementById("signOutBtn");

    // --- Navbar ---
    if (navbar) navbar.style.display = user ? "block" : "none";

    // --- Logout button ---
    if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none";

    // --- Page protection ---
    protectedPages = [
        "log.html",
        "live_feed.html",
        "background_instructions.html"
    ];

    currentPage = window.location.pathname.split("/").pop();

    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = "index.html";
    }
});



// --- LOGOUT BUTTON HANDLER ---
document.addEventListener("DOMContentLoaded", () => {

    signOutBtn = document.getElementById("signOutBtn");

    if (signOutBtn) {
        signOutBtn.onclick = function () {
            firebase.auth().signOut().then(() => {
                window.location.href = "index.html";
            });
        };
    }
});
