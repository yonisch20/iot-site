// ------------------------------------------------------------
// הגדרת קונפיגורציה של Firebase
// ------------------------------------------------------------
const firebaseConfig = {
    apiKey: "AIzaSyA8b2SO1E0FCUf1BFvpGs4jNZbJSbofIdE",
    authDomain: "detect-and-mark-mobile-system.firebaseapp.com",
    databaseURL: "https://detect-and-mark-mobile-system-default-rtdb.firebaseio.com",
    projectId: "detect-and-mark-mobile-system",
    storageBucket: "detect-and-mark-mobile-system.firebasestorage.app",
    messagingSenderId: "685772763226",
    appId: "1:685772763226:web:aff3564e44d4577b4e6863"
};

// ------------------------------------------------------------
// אתחול (initialize) של Firebase בדפדפן
// ------------------------------------------------------------
firebase.initializeApp(firebaseConfig);

// =======================================================================
// ===========================  REGISTER  ================================
// =======================================================================

function sign() {
    console.log("כפתור הרשמה נלחץ");

    const userName = document.getElementById("fullname").value;
    const emailInput = document.getElementById("email").value;
    const passInput = document.getElementById("password").value;
    const confirmInput = document.getElementById("confirmPass").value;
    if (!emailInput || !passInput || !confirmInput || !userName) {
        alert("נא למלא את כל השדות");
        return;
    }

    if (passInput !== confirmInput) {
        alert("הסיסמאות אינן תואמות");
        return;
    }

    if (passInput.length < 6) {
        alert("הסיסמה חייבת להכיל לפחות 6 תווים");
        return;
    }
    

    // ---------------------------------------------------------
    // יצירת משתמש ב-Firebase
    // ---------------------------------------------------------
    firebase.auth()
        .createUserWithEmailAndPassword(emailInput, passInput)
        .then((userCredential) => {
            
            // המשתמש נוצר בהצלחה
            const user = userCredential.user;

            const newUser = {
                uid: user.uid,
                name: userName,
                email: emailInput,
                createdAt: Date.now(),
                role: "user"
            };

            // שמירה ב-Realtime Database
            return firebase.database().ref("users/" + user.uid).set(newUser);
        })
        .then(() => {
            // התנתקות יזומה (כדי שהמשתמש ייכנס ידנית)
            return firebase.auth().signOut();
        })
        .then(() => {
            alert("ההרשמה בוצעה בהצלחה! כעת ניתן להתחבר.");
            window.location.href = "index.html";
        })
        .catch((error) => {
            // טיפול בשגיאות נפוצות
            let errorMsg = error.message;
            
            if (error.code === "auth/email-already-in-use") {
                errorMsg = "כתובת האימייל הזו כבר רשומה במערכת.";
            } else if (error.code === "auth/invalid-email") {
                errorMsg = "כתובת האימייל אינה תקינה.";
            } else if (error.code === "auth/weak-password") {
                errorMsg = "הסיסמה חלשה מדי.";
            }

            alert("שגיאה בהרשמה: \n" + errorMsg);
            console.error("Registration Error:", error);
        });
}



// =======================================================================
// ===============================  LOGIN  ================================
// =======================================================================
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

            return writeLog("Login", user.email, "התחברות מוצלחת");

        })
        .then(() => {
            window.location.href = "background_instructions.html";
        })
        .catch(error => {
            alert("שגיאה: " + error.message);
        });
}

// =======================================================================
// ========================= PASSWORD RESET ==============================
// =======================================================================
function resetPassword() {
    const email = document.getElementById("email").value;

    if (!email) {
        alert("נא להזין כתובת אימייל בשדה למעלה כדי לקבל קישור לאיפוס.");
        return;
    }

    firebase.auth().sendPasswordResetEmail(email)
        .then(() => {
            alert("אימייל לאיפוס הסיסמה נשלח בהצלחה.");
            
            window.location.href = "index.html";
        })
        .catch((error) => {
            let errorMsg = "שגיאה בשליחת המייל: " + error.message;
            
            if (error.code === "auth/user-not-found") {
                errorMsg = "לא נמצא משתמש עם כתובת האימייל הזו.";
            }
            
            alert(errorMsg);
        });
}

// =======================================================================
// ======== AUTH STATE MANAGER — ניהול תפריט, הרשאות וגישה לדפים ========
// =======================================================================

firebase.auth().onAuthStateChanged(user => {

    navbar = document.getElementById("navbar");
    signOutBtn = document.getElementById("signOutBtn");

    if (navbar) navbar.style.display = user ? "block" : "none";

    if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none";

    protectedPages = [
        "log.html",
        "live_feed.html",
        "background_instructions.html",
        "form.html"
    ];

    currentPage = window.location.pathname.split("/").pop();

    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = "index.html";
    }
});

// =======================================================================
// ====================== LOGOUT BUTTON HANDLER ==========================
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {

    const signOutBtn = document.getElementById("signOutBtn");

    if (!signOutBtn) return;

    signOutBtn.onclick = function () {

        const user = firebase.auth().currentUser;

        writeLog(
            "Logout",
            user ? user.email : "Unknown",
            "התנתקות מוצלחת"
        );

        firebase.auth().signOut().then(() => {
            window.location.href = "index.html";
        });
    };
});

// =======================================================================
// ================================ MOTOR CONTROL ========================
// =======================================================================
const MOTOR_MAP = {
  forward:  { 1: "9", 2: "10", 3: "11" },
  backward: { 1: "5", 2: "6", 3: "7" },
  left:     { 1: "13", 2: "14", 3: "15" },
  right:    { 1: "17", 2: "18", 3: "19" },
  stop:     { 1: "31", 2: "31", 3: "31" }
};


function sendCommand(direction) {
  lastDirection = direction;
  pushMotorCommand(lastDirection, currentSpeedLevel, "direction");
}

let currentSpeedLevel = 1;
let lastDirection = "stop";

// -----------------------------------------------------------------------
// מנגנון המונע שליחה כפולה + הגבלה לעמוד שליטה בלבד
// -----------------------------------------------------------------------
let activeKey = null;

document.addEventListener("keydown", (e) => {

    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "live_feed.html") {
        return;
    }

    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
    }

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

    const currentPage = window.location.pathname.split("/").pop();
    if (currentPage !== "live_feed.html") {
        return;
    }

    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
    }

    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
    if (!allowedKeys.includes(e.key)) return;

    activeKey = null;
    sendCommand("stop");
});

function pushMotorCommand(direction, speedLevel, reason) {
  const vector8 = MOTOR_MAP?.[direction]?.[speedLevel];

  if (!vector8 || vector8.includes("x")) {
    console.error("Missing mapping:", { direction, speedLevel, vector8 });
    alert(`חסר מיפוי ל-${direction} במהירות ${speedLevel}`);
    return;
  }

  const now = Date.now();
  const timeString = new Date().toLocaleString("he-IL");

  firebase.database().ref("control/motorCommand").set({
    command: vector8,
    timestamp: now,
    timeString: timeString
  });

firebase.database().ref("toAltera").set(vector8);

  const user = firebase.auth().currentUser;
  writeLog(
    "Motor Command",
    user ? user.email : "Unknown",
    `נשלח: ${vector8} | dir=${direction} | speed=${speedLevel}/4 | reason=${reason}`
  );

  console.log("Pushed motorCommand:", vector8, { direction, speedLevel, reason }, timeString);
}

// =======================================================================
// ============================ LASER TOGGLER =============================
// =======================================================================
let laserState = "32";

function toggleLaser() {

    laserState = (laserState === "32") ? "33" : "32";

    const now = Date.now();

    const timeString = new Date().toLocaleString("he-IL");

    firebase.database().ref("control/laserCommand").set({
        command: laserState,
        timestamp: now,
        timeString: timeString
    });
    firebase.database().ref("toAltera").set(laserState);

    console.log("Laser:", laserState, timeString);

    const user = firebase.auth().currentUser;

    writeLog(
        laserState === "33" ? "Laser On" : "Laser Off",
        user ? user.email : "Unknown",
        "שינוי מצב הלייזר ל-" + laserState
    );
}

// =======================================================================
// ============================= WRITE LOG ================================
// =======================================================================
function writeLog(type, user, details, payload = null) {
  return firebase.database().ref("logs").push({
    createdAt: Date.now(),
    timestamp: new Date().toLocaleString("he-IL"),
    type,
    user,
    details,
    payload
  });
}

// =======================================================================
// ===================== LOG PAGE DYNAMIC TABLE LOADER ===================
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {

    const logBody = document.getElementById("logTableBody");

    if (!logBody) return;

    const db = firebase.database();
    const logRef = db.ref("logs");

    logRef.on("value", snapshot => {

        logBody.innerHTML = "";

        const logs = [];
        snapshot.forEach(child => {
            logs.push({ id: child.key, ...child.val() });
        });

        logs.sort((a, b) => b.createdAt - a.createdAt);

        logs.forEach(log => {
            
            const badgeClass = {
                "Login":          "bg-success",
                "Logout":         "bg-secondary",
                "Alert":          "bg-warning text-dark",
                "Laser On":       "bg-danger",
                "Laser Off":      "bg-info text-dark",
                "Motor Command":  "bg-primary"
            }
            [log.type] || "bg-light text-dark";

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

// =======================================================================
// ============================ EVENT REPORT ==============================
// =======================================================================
document.addEventListener("DOMContentLoaded", () => {

    const form = document.getElementById("eventFormDesk") || document.getElementById("eventFormMobile");

    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const user = firebase.auth().currentUser;

        const target = form.querySelector("select").value;

        const radioChecked = form.querySelector("input[type='radio']:checked");

        const realFakeValue = radioChecked ? radioChecked.nextElementSibling.innerText : "לא נבחר";

        const alerts = [...form.querySelectorAll("input[type='checkbox']:checked")]
            .map(x => x.nextElementSibling.textContent)
            .join(", ");

        const description = form.querySelector("textarea").value;
        
        const threatLevel = document.getElementById("threatLevelSel").value;

        const details = `מטרה: ${target} | סוג: ${realFakeValue} | איום: ${threatLevel} | התראות: ${alerts || "ללא"} | תיאור: ${description}`;

        writeLog(
            "Alert",
            user ? user.email : "Unknown",
            details
        );

        alert("האירוע נרשם בהצלחה ביומן.");
        form.reset();
    });
});

// ===== SPEED UI (כפתורים 1-4) =====
function paintSpeedButtons(level) {
  for (let i = 1; i <= 3; i++) {
    const btn = document.getElementById(`spd${i}`);
    if (!btn) continue;

    if (i === level) {
      btn.classList.remove("btn-outline-info");
      btn.classList.add("btn-info", "text-dark");
    } else {
      btn.classList.remove("btn-info", "text-dark");
      btn.classList.add("btn-outline-info");
    }
  }

  const txt = document.getElementById("speedLevelText");
  if (txt) txt.textContent = String(level);
}


function setSpeedLevel(level) {
  level = Number(level);
  if (![1,2,3,4].includes(level)) return;

  currentSpeedLevel = level;

  if (typeof paintSpeedButtons === "function") paintSpeedButtons(level);

  pushMotorCommand(lastDirection, currentSpeedLevel, "speed");
}

// ==========================================
//           LIVE CAMERA FEED
// ==========================================
const streamElement = document.getElementById('liveStream');

if (streamElement) {
   firebase.database().ref("/camIp").on("value", (snapshot) => {
      const ip = snapshot.val();
     if (ip) {
       console.log("IP מצלמה התקבל: " + ip);
       streamElement.src = `http://${ip}/stream`;
      streamElement.style.borderColor = "#28a745";
     } else {
       streamElement.style.borderColor = "#dc3545";
     }
   });
}

// ==========================================
//           DISTANCE SENSOR LOGIC
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
    
    const distBox = document.getElementById("distanceAlertBox");
    if (!distBox) return;

    const distRef = firebase.database().ref("fromAltera/A");

    distRef.on("value", (snapshot) => {
        const val = snapshot.val();
        
        const distance = Number(val);

        distBox.className = "p-3 mt-3 text-center fw-bold rounded-3 border";

        if (distance > 30) {
            distBox.classList.add("bg-success", "text-white", "border-success");
            distBox.innerText = `מרחק תקין: ${distance} ס"מ`;

        } else {
            distBox.classList.add("blink-active", "border-danger");
            distBox.innerText = `⚠ זהירות! התקרבות: ${distance} ס"מ`;
        }
    });
});