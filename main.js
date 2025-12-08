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

    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    if (!email || !password) {
        alert("נא למלא את כל השדות");
        return;
    }

    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {

            const user = userCredential.user;

            return writeLog(
                "Login",
                user.email,
                "התחברות מוצלחת"
            );

        })
        .then(() => {
            window.location.href = "background_instructions.html";
        })
        .catch(error => {
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
        "background_instructions.html",
        "dc_control.html"
    ];

    currentPage = window.location.pathname.split("/").pop();

    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = "index.html";
    }
});



// --- LOGOUT BUTTON HANDLER ---
document.addEventListener("DOMContentLoaded", () => {

    const signOutBtn = document.getElementById("signOutBtn");

    if (signOutBtn) {
        signOutBtn.onclick = function () {

            const user = firebase.auth().currentUser;

            // קודם כותבים לוג
            writeLog(
                "Logout",
                user ? user.email : "Unknown",
                "התנתקות מוצלחת"
            );

            // ואז מתנתקים
            firebase.auth().signOut().then(() => {
                window.location.href = "index.html";
            });

        };
    }
});


//motor control//
function sendCommand(cmd) {

    const now = Date.now();                               // זמן במילישניות
    const timeString = new Date().toLocaleString("he-IL"); // זמן קריא

    // כתיבה לפיירבייס (של ESP32)
    firebase.database().ref("control/motorCommand").set({
        command: cmd,
        timestamp: now,
        timeString: timeString
    });

    // כתיבת לוג ליומן
    const user = firebase.auth().currentUser;

    writeLog(
        "Motor Direction",
        user ? user.email : "Unknown",
        "כיוון מנוע: " + cmd
    );

    console.log("Sending motor command:", cmd, timeString);
}

// כדי למנוע שליחה כפולה של אותה פקודה
let activeKey = null;

document.addEventListener("keydown", (e) => {

    // מותר רק חצים + רווח
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    if (!allowedKeys.includes(e.key)) return;

    if (activeKey === e.key) return;

    switch (e.key) {
        case "ArrowUp":
            activeKey = e.key;
            sendCommand("forward");
            break;

        case "ArrowDown":
            activeKey = e.key;
            sendCommand("backward");
            break;

        case "ArrowLeft":
            activeKey = e.key;
            sendCommand("left");
            break;

        case "ArrowRight":
            activeKey = e.key;
            sendCommand("right");
            break;

        case " ":
            activeKey = e.key;
            sendCommand("stop");
            break;
    }
});


document.addEventListener("keyup", (e) => {

    // STOP רק אם שחררו אחד מהחצים או רווח
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    if (!allowedKeys.includes(e.key)) return;

    activeKey = null;
    sendCommand("stop");
});


// Laser Toggler //
let laserState = "off";

function toggleLaser() {

    // הופכים מצב
    laserState = (laserState === "off") ? "on" : "off";

    const now = Date.now();
    const timeString = new Date().toLocaleString("he-IL");

    // כתיבה ל-Firebase במבנה זהה ל-motorCommand
    firebase.database().ref("control/laserCommand").set({
        command: laserState,
        timestamp: now,
        timeString: timeString
    });

    console.log("Laser:", laserState, timeString);

    // כתיבת לוג ליומן
    const user = firebase.auth().currentUser;
    writeLog(
        laserState === "on" ? "Laser On" : "Laser Off",
        user ? user.email : "Unknown",
        "שינוי מצב הלייזר ל-" + laserState
    );
}



// --- LOG WRITER ---
function writeLog(type, user, details) {
    return firebase.database().ref("logs").push({
        timestamp: new Date().toLocaleString("he-IL"),
        type,
        user,
        details
    });
}



// --- LOG PAGE DYNAMIC TABLE LOADER ---
document.addEventListener("DOMContentLoaded", () => {
    const logBody = document.getElementById("logTableBody");
    if (!logBody) return; // אם הדף אינו log.html → לא מפעיל

    const db = firebase.database();
    const logRef = db.ref("logs");

    logRef.on("value", snapshot => {
        logBody.innerHTML = ""; // מנקה את הטבלה

        const logs = [];

        // שלב 1 – אוסף את כל הלוגים למערך
        snapshot.forEach(child => {
            logs.push(child.val());
        });

        // שלב 2 – מיון מהחדש לישן
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // שלב 3 – הכנסה לטבלה לפי סדר חדש
        logs.forEach(log => {

            const badgeClass = {
                "Login": "bg-success",
                "Logout": "bg-secondary",
                "Alert": "bg-warning text-dark",
                "Laser On": "bg-danger",
                "Laser Off": "bg-info text-dark",
                "Motor Direction": "bg-primary"
            }[log.type] || "bg-light text-dark";

            const row = `
                <tr>
                    <td>${log.timestamp || "-"}</td>
                    <td><span class="badge ${badgeClass}">${log.type}</span></td>
                    <td>${log.user || "-"}</td>
                    <td>${log.details || "-"}</td>
                </tr>
            `;

            logBody.innerHTML += row;
        });
    });
});

// --- EVENT REPORT (MOBILE) ---
document.addEventListener("DOMContentLoaded", () => {
    const form = document.getElementById("eventFormMobile");
    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const user = firebase.auth().currentUser;

        const title = form.querySelector("input[type='text']").value;
        const target = form.querySelector("select").value;

        const realFake = form.querySelector("input[type='radio']:checked");
        const realFakeValue = realFake ? realFake.nextElementSibling.textContent : "לא נבחר";

        const alerts = [...form.querySelectorAll("input[type='checkbox']:checked")]
            .map(x => x.nextElementSibling.textContent)
            .join(", ");

        const description = form.querySelector("textarea").value;
        const threatLevel = form.querySelector("select:nth-of-type(2)").value;

        const details =
            `כותרת: ${title}\n` +
            `סוג מטרה: ${target}\n` +
            `סוג אירוע: ${realFakeValue}\n` +
            `ערוצי התראה: ${alerts || "ללא"}\n` +
            `תיאור: ${description}\n` +
            `רמת איום: ${threatLevel}`;

        writeLog(
            "Alert",
            user ? user.email : "Unknown",
            details
        );

        alert("האירוע נרשם בהצלחה ביומן.");
        form.reset();
    });
});

