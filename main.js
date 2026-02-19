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

    const emailInput = document.getElementById("email").value;
    const passInput = document.getElementById("password").value;
    const confirmInput = document.getElementById("confirmPass").value;
    if (!emailInput || !passInput || !confirmInput) {
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

// פונקציה לביצוע התחברות עם אימייל וסיסמה קיימים.
function login() {

    // שליפת כתובת אימייל מהטופס
    const email = document.getElementById("email").value;

    // שליפת הסיסמה מהטופס
    const password = document.getElementById("password").value;

    // אם שדה ריק → נציג הודעה
    if (!email || !password) {
        alert("נא למלא את כל השדות");
        return;
    }

    // ניסיון להתחבר דרך Firebase Authentication
    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        .then(userCredential => {

            // הוצאת אובייקט המשתמש
            const user = userCredential.user;

            // כתיבת לוג התחברות ליומן האירועים
            return writeLog("Login", user.email, "התחברות מוצלחת");

        })
        .then(() => {
            // מעבר לדף הבא לאחר התחברות מוצלחת
            window.location.href = "background_instructions.html";
        })
        .catch(error => {
            alert("שגיאה: " + error.message);
        });
}






// =======================================================================
// ======== AUTH STATE MANAGER — ניהול תפריט, הרשאות וגישה לדפים ========
// =======================================================================

// onAuthStateChanged — מאזין קבוע שמופעל בכל פעם שהמשתמש
// נכנס / יוצא / נטען מחדש מתוך Firebase Authentication.
//
// "user" יהיה:
// • אובייקט מידע על המשתמש — אם הוא מחובר
// • null — אם אין משתמש מחובר
firebase.auth().onAuthStateChanged(user => {

    // --------------------------------------------------------------
    // מציאת אלמנט הניווט הראשי (navbar)
    // --------------------------------------------------------------
    // אם הוא קיים בדף — נטפל בו. אם לא — פשוט לא קורה כלום.
    navbar = document.getElementById("navbar");

    // כפתור ההתנתקות
    signOutBtn = document.getElementById("signOutBtn");

    // --------------------------------------------------------------
    // הצגה/הסתרה של ה־Navbar לפי האם המשתמש מחובר
    // --------------------------------------------------------------
    // user ? "block" : "none"
    // טרנרי: אם user קיים → block, אם לא → none
    if (navbar) navbar.style.display = user ? "block" : "none";

    // אותו רעיון לכפתור ההתנתקות
    if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none";

    // --------------------------------------------------------------
    // הגדרת דפים “מוגנים” — רק משתמשים מחוברים יכולים לצפות בהם
    // --------------------------------------------------------------
    protectedPages = [
        "log.html",
        "live_feed.html",
        "background_instructions.html",
        "dc_control.html"
    ];

    // currentPage:
    // 1. window.location.pathname → כל הנתיב, לדוגמה "/folder/log.html"
    // 2. split("/") → ["","folder","log.html"]
    // 3. pop() → "log.html"
    currentPage = window.location.pathname.split("/").pop();

    // אם המשתמש לא מחובר *והדף מוגן* — מפנים אותו לעמוד ההתחברות
    if (!user && protectedPages.includes(currentPage)) {
        window.location.href = "index.html";
    }
});



// =======================================================================
// ====================== LOGOUT BUTTON HANDLER ==========================
// =======================================================================

// מאזין שמופעל כאשר דף ה-HTML סיים להיטען (לא כולל תמונות)
// מאפשר לנו לאתר את כפתור ה־Logout אחרי שהוא קיים בדום.
document.addEventListener("DOMContentLoaded", () => {

    // מוצאים את כפתור ההתנתקות
    const signOutBtn = document.getElementById("signOutBtn");

    // אם אין כפתור כזה בדף → יוצאים
    if (!signOutBtn) return;

    // מגדירים פעולה לכפתור onclick = ...
    signOutBtn.onclick = function () {

        // currentUser — מביא את האובייקט של המשתמש שמחובר כרגע
        const user = firebase.auth().currentUser;

        // קודם רושמים לוג של "Logout"
        writeLog(
            "Logout",
            user ? user.email : "Unknown",
            "התנתקות מוצלחת"
        );

        // ואז מתנתקים בפועל
        firebase.auth().signOut().then(() => {
            window.location.href = "index.html"; // חזרה לעמוד הבית
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


// פונקציה ששולחת פקודה לשליטה במנוע (ל-ESP32 דרך Firebase)
function sendCommand(direction) {
  lastDirection = direction;
  pushMotorCommand(lastDirection, currentSpeedLevel, "direction");
}





let currentSpeedLevel = 1;     // 1..4
let lastDirection = "stop";    // forward/backward/left/right/stop



// -----------------------------------------------------------------------
// מנגנון המונע שליחה כפולה כשמקש נשאר לחוץ + מניעת התנגשות עם טפסים
// -----------------------------------------------------------------------

// activeKey → שומר איזה מקש פעיל כרגע
let activeKey = null;

// האזנה ללחיצה (keydown) על מקש במקלדת
document.addEventListener("keydown", (e) => {

    // --- תיקון: בדיקה האם המשתמש מקליד בתוך טופס ---
    // document.activeElement מחזיר את האלמנט שנמצא כרגע בפוקוס
    const tag = document.activeElement.tagName;
    
    // אם אנחנו בתוך שדה טקסט, תיבת טקסט או בחירה - לא מפעילים מנועים
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
    }
    // ---------------------------------------------------

    // מגדירים רשימת מקשים המותרים לשליטה:
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    // אם המקש שנלחץ *לא* נמצא ברשימה — לא עושים כלום
    if (!allowedKeys.includes(e.key)) return;

    // אם המשתמש עדיין מחזיק את אותו מקש — לא שולחים שוב
    if (activeKey === e.key) return;

    // לפי המקש שנלחץ — שולחים פקודה מתאימה
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

// האזנה לשחרור מקש (keyup)
document.addEventListener("keyup", (e) => {

    // --- תיקון: גם בשחרור מקש, אם אנחנו בטופס - מתעלמים ---
    const tag = document.activeElement.tagName;
    if (tag === "INPUT" || tag === "TEXTAREA" || tag === "SELECT") {
        return;
    }
    // ---------------------------------------------------

    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    if (!allowedKeys.includes(e.key)) return;

    // מאפסים את activeKey — אין כבר מקש לחוץ
    activeKey = null;

    // שולחים פקודת עצירה
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

  // 1) כתיבה לענן (control -> motorCommand)
  firebase.database().ref("control/motorCommand").set({
    command: vector8,          // ✅ ה-8bit
    timestamp: now,
    timeString: timeString
  });

firebase.database().ref("toAltera").set(vector8);

  // 2) לוג
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

// laserState — משתנה שמחזיק את מצב הלייזר הנוכחי.
// ההתחלה מוגדרת כ-"off" — כלומר כבוי.
let laserState = "32";

// הפונקציה מופעלת כאשר המשתמש לוחץ על כפתור הלייזר
function toggleLaser() {

    // --------------------------------------------------------------
    // הפיכת מצב (Toggle):
    // אם laserState הוא "off" → יהפוך ל-"on"
    // אם הוא "on" → יהפוך ל-"off"
    //
    // זהו אופרטור תנאי (Ternary Operator):
    // תנאי ? ערך אם אמת : ערך אם שקר
    // --------------------------------------------------------------
    laserState = (laserState === "32") ? "33" : "32";

    // זמן נוכחי (מספר במילישניות)
    const now = Date.now();

    // יצירת זמן קריא לפי פורמט ישראלי
    const timeString = new Date().toLocaleString("he-IL");

    // --------------------------------------------------------------
    // כתיבה למאגר Firebase תחת הנתיב: control/laserCommand
    //
    // ref(...).set({...})
    // set — מחליף לחלוטין את התוכן בנתיב הזה
    // --------------------------------------------------------------
    firebase.database().ref("control/laserCommand").set({
        command: laserState, // on/off
        timestamp: now,
        timeString: timeString
    });
    firebase.database().ref("toAltera").set(laserState);

    // הדפסה לצורכי בדיקה ודיבאג
    console.log("Laser:", laserState, timeString);

    // --------------------------------------------------------------
    // רושמים לוג של שינוי מצבי הלייזר
    // --------------------------------------------------------------
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

// writeLog(type, user, details)
//
// type → סוג האירוע (Login / Logout / Alert / Motor / Laser...)
// user → המשתמש שביצע את הפעולה
// details → פירוט מלא של מה שקרה
//
// הפונקציה כותבת רשומת לוג חדשה ל-Firebase Realtime Database,
// תחת הנתיב "logs" ומייצרת מפתח אוטומטי (push)
function writeLog(type, user, details, payload = null) {
  return firebase.database().ref("logs").push({
    createdAt: Date.now(), // מספר למיון אמיתי
    timestamp: new Date().toLocaleString("he-IL"), // תצוגה
    type,
    user,
    details,      // טקסט קצר/סיכום
    payload       // אובייקט עם כל פרטי הטופס (או null)
  });
}





// =======================================================================
// ===================== LOG PAGE DYNAMIC TABLE LOADER ===================
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {

    // מאתרים את ה־tbody של הטבלה
    const logBody = document.getElementById("logTableBody");

    // אם אנחנו לא בדף log.html - יוצאים
    if (!logBody) return;

    const db = firebase.database();
    const logRef = db.ref("logs");

    // מאזינים לשינויים בנתיב "logs"
    logRef.on("value", snapshot => {

        // ריקון הטבלה לפני מילוי חדש
        logBody.innerHTML = "";

        // איסוף כל הלוגים למערך
        const logs = [];
        snapshot.forEach(child => {
            logs.push({ id: child.key, ...child.val() });
        });

        // --------------------------------------------------------------
        // תיקון המיון: מהחדש (למעלה) לישן (למטה)
        // משתמשים ב-createdAt שהוא מספר, ולכן המיון מדויק
        // --------------------------------------------------------------
        logs.sort((a, b) => b.createdAt - a.createdAt);

        // הוספת שורות לטבלה
        logs.forEach(log => {
            
            // הגדרת צבעים לפי סוג אירוע
            const badgeClass = {
                "Login":          "bg-success",
                "Logout":         "bg-secondary",
                "Alert":          "bg-warning text-dark",
                "Laser On":       "bg-danger",
                "Laser Off":      "bg-info text-dark",
                "Motor Command":  "bg-primary",
                "Servo Control":  "bg-white text-dark border", // עיצוב לסרוו
                "Lighting Change":"bg-dark text-white",       // עיצוב לתאורה
                "Buzzer":         "bg-warning text-dark border border-dark", 
                "PWM Light":      "bg-warning text-white"
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


// =======================================================================
// ============================ EVENT REPORT ==============================
// =======================================================================

document.addEventListener("DOMContentLoaded", () => {

    // מאתרים את הטופס (תומך גם ב-Desk וגם ב-Mobile)
    const form = document.getElementById("eventFormDesk") || document.getElementById("eventFormMobile");

    if (!form) return;

    form.addEventListener("submit", e => {
        e.preventDefault();

        const user = firebase.auth().currentUser;

        // --- כאן היה הקוד של הכותרת שמחקנו כדי שלא יתקע את המערכת ---

        // שליפת סוג מטרה
        const target = form.querySelector("select").value;

        // בדיקה איזה רדיו נבחר (אמת/שווא)
        // בודקים אם יש input מסומן
        const radioChecked = form.querySelector("input[type='radio']:checked");
        // אם יש מסומן - לוקחים את הטקסט של ה-Label שלידו, אחרת "לא נבחר"
        const realFakeValue = radioChecked ? radioChecked.nextElementSibling.innerText : "לא נבחר";

        // צ'קבוקסים (מערך של כל המסומנים)
        const alerts = [...form.querySelectorAll("input[type='checkbox']:checked")]
            .map(x => x.nextElementSibling.textContent)
            .join(", ");

        // תיאור האירוע (TextArea)
        const description = form.querySelector("textarea").value;
        
        // רמת איום
        const threatLevel = document.getElementById("threatLevelSel").value;

        // בניית מחרוזת הפירוט (בלי הכותרת)
        // בניית מחרוזת הפירוט שתופיע בעמוד ה-LOG

        const details = `מטרה: ${target} | סוג: ${realFakeValue} | איום: ${threatLevel} | התראות: ${alerts || "ללא"} | תיאור: ${description}`;

        // שליחה ל-Firebase
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
  // אם אין כפתורים בדף הזה — לא עושים כלום (כדי שלא יפיל עמודים אחרים)
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

  // ✅ שולח לענן מיד לפי הכיוון האחרון
  pushMotorCommand(lastDirection, currentSpeedLevel, "speed");
}


// ==========================================
//           LIVE CAMERA FEED
// ==========================================
// בדיקה שאנחנו נמצאים בדף שיש בו אלמנט וידאו
const streamElement = document.getElementById('liveStream');

if (streamElement) {
   // האזנה לשינויים בכתובת ה-IP ב-Firebase
   firebase.database().ref("/camIp").on("value", (snapshot) => {
      const ip = snapshot.val();
     if (ip) {
       console.log("IP מצלמה התקבל: " + ip);
       streamElement.src = `http://${ip}/stream`;
      streamElement.style.borderColor = "#28a745"; // מסגרת ירוקה
     } else {
       streamElement.style.borderColor = "#dc3545"; // מסגרת אדומה
     }
   });
}

// ==========================================
//           DISTANCE SENSOR LOGIC
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
    
    const distBox = document.getElementById("distanceAlertBox");
    if (!distBox) return;

    // האזנה לנתיב fromAltera/A
    const distRef = firebase.database().ref("fromAltera/A");

    distRef.on("value", (snapshot) => {
        const val = snapshot.val();
        
        // המרה למספר (אם אין ערך, זה יהפוך ל-0)
        const distance = Number(val);

        // איפוס עיצוב בסיסי
        distBox.className = "p-3 mt-3 text-center fw-bold rounded-3 border";

        // לוגיקה פשוטה: מעל 30 ירוק, מתחת ל-30 מהבהב
        if (distance > 30) {
            // מצב תקין: ירוק
            distBox.classList.add("bg-success", "text-white", "border-success");
            distBox.innerText = `מרחק תקין: ${distance} ס"מ`;
        } else {
            // מצב סכנה: הבהוב אדום/שחור
            distBox.classList.add("blink-active", "border-danger");
            distBox.innerText = `⚠ זהירות! התקרבות: ${distance} ס"מ`;
        }
    });
});