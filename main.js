// כאן אנחנו מגדירים אובייקט קונפיגורציה שנשלח לפיירבייס כדי לחבר את האתר לפרויקט הנכון בענן
// האובייקט firebaseConfig מכיל פרטי זיהוי ייחודיים לפרויקט שלך (מפתח API, מזהי פרויקט וכו')
 // const = משתנה קבוע שלא משתנה אחרי ההשמה הראשונה
const firebaseConfig = {
  // apiKey = מפתח זיהוי ייחודי שמאפשר לדפדפן שלך לדבר עם פרויקט ה-Firebase שלך
  apiKey: "AIzaSyA8b2SO1E0FCUf1BFvpGs4jNZbJSbofIdE",
  // authDomain = הדומיין שבו מערכת האימות של Firebase עובדת (לוגין / רישום)
  authDomain: "detect-and-mark-mobile-system.firebaseapp.com",
  // databaseURL = הכתובת של בסיס הנתונים בזמן אמת (Realtime Database)
  databaseURL: "https://detect-and-mark-mobile-system-default-rtdb.firebaseio.com",
  // projectId = השם הפנימי של הפרויקט בפיירבייס / GCP
  projectId: "detect-and-mark-mobile-system",
  // storageBucket = באקט האחסון לקבצים (תמונות/וידאו וכו') של Firebase Storage
  storageBucket: "detect-and-mark-mobile-system.firebasestorage.app",
  // messagingSenderId = מזהה השולח עבור Firebase Cloud Messaging (התראות)
  messagingSenderId: "685772763226",
  // appId = מזהה ייחודי של האפליקציה בדפדפן
  appId: "1:685772763226:web:aff3564e44d4577b4e6863"
};

// בשורה הזאת אנחנו מפעילים/מאתחלים את Firebase בצד ה-Client (בדפדפן)
// firebase זה האובייקט הגלובלי שנטען מה-SDK של Firebase (מ-scripts ב-HTML)
// הנקודה "." היא אופרטור גישה לאובייקט: היא אומרת "קח את האובייקט firebase ותיגש למתודה initializeApp בתוכו"
// initializeApp(...) היא פונקציה פנימית של Firebase שמקבלת את אובייקט הקונפיגורציה ומחברת את האפליקציה שלך לפרויקט המתאים
firebase.initializeApp(firebaseConfig);



// --- REGISTER ---
// כאן אנחנו מגדירים פונקציה בשם sign, שתופעל כנראה כשמשתמש ילחץ על כפתור "הרשמה"
// function מגדירה פונקציה גלובלית שניתן לקרוא לה מה-HTML (onclick למשל)
function sign() {

  // כאן אנחנו לוקחים את הערך (value) מתוך אלמנט אינפוט עם id="email"
  // document = מייצג את כל דף ה-HTML
  // הנקודה "." שוב אופרטור גישה לאובייקט → ניגשים למתודה getElementById של האובייקט document
  // getElementById("email") מחזירה אובייקט שמייצג את תגית ה-HTML עם המזהה הזה
  // הנקודה "." אחרי האלמנט מאפשרת לגשת לשדה value שלו, כלומר לטקסט שהמשתמש הקליד בפועל
  // אין כאן var/let/const → המשתנה email הופך לגלובלי באופן לא רצוי (אבל זה עדיין עובד)
  email = document.getElementById("email").value;

  // אותו רעיון כמו בשורה הקודמת, רק עם שדה הסיסמה
  password = document.getElementById("password").value;

  // כאן אנחנו מקבלים את הערך של שדה "אימות סיסמה" (confirmPass)
  confirmPass = document.getElementById("confirmPass").value;

  // כאן אנחנו בודקים אם אחד משלושת השדות ריק (falsy)
  // !email = אם email ריק/undefined/"" → זה true
  // if בודק תנאי בוליאני — אם אחד מהשדות ריק, נכנסים לבלוק של ה-if
  if (!email || !password || !confirmPass) {
    // alert מציג הודעה קופצת למשתמש בדפדפן
    alert("נא למלא את כל השדות");
    // return יוצא מהפונקציה ולא ממשיך לקוד למטה
    return;
  }

  // כאן אנחנו בודקים אם הסיסמה לא שווה לסיסמה לאימות
  // !== זה השוואה קפדנית: גם ערך וגם טיפוס (כמו === אבל הפוך)
  if (password !== confirmPass) {
    alert("הסיסמאות אינן תואמות");
    return;
  }

  // firebase.auth() = ניגשים לשירות האימות (Authentication) של Firebase
  // "." = גישה לאובייקט auth מתוך האובייקט firebase
  // createUserWithEmailAndPassword = פונקציה של Firebase שיוצרת משתמש חדש עם אימייל וסיסמה
  // הפונקציה מחזירה Promise → ולכן אנחנו משתמשים ב-then ו-catch
  firebase.auth()
    .createUserWithEmailAndPassword(email, password)
    // then(...) מופעל כשיצירת המשתמש הצליחה
    // userCredential הוא אובייקט שמחזיק מידע על המשתמש שנוצר (user, uid, email וכו')
    .then((userCredential) => {

      // כאן אנחנו מוציאים את אובייקט המשתמש מתוך userCredential
      // הנקודה "." כאן שוב: גישה לשדה user מתוך האובייקט userCredential
      user = userCredential.user;

      // כאן אנחנו בונים אובייקט חדש שאותו נרצה לשמור במסד הנתונים שלנו ב"Users"
      // uid: מזהה ייחודי של המשתמש בפיירבייס
      // email: האימייל שהמשתמש הקליד
      // createdAt: חותמת זמן (מילישניות) מ-Date.now()
      // role: "user" – אפשר להרחיב בעתיד לתפקידים אחרים (admin וכו')
      newUser = {
        uid: user.uid,
        email: email,
        createdAt: Date.now(),
        role: "user"
      };

      // כאן אנחנו ניגשים למסד הנתונים בזמן אמת: firebase.database()
      // "." ניגשים לפונקציה ref() שמקבלת מחרוזת עם הנתיב ברמת ה-JSON
      // "users/" + user.uid → כל משתמש שמור בנתיב משלו לפי ה-UID שלו
      firebase.database().ref("users/" + user.uid).set(newUser)
        // then() יופעל לאחר שהכתיבה למסד הנתונים הסתיימה בהצלחה
        .then(() => {

          // לאחר שהמשתמש נוצר וגם נרשם במסד הנתונים, אנחנו מנתקים אותו מהחשבון
          // firebase.auth().signOut() מחזיר Promise שמתבצע כשההתנתקות מצליחה
          firebase.auth().signOut().then(() => {
            // אחרי ההתנתקות אנחנו מעבירים את המשתמש חזרה לעמוד הראשי
            // window.location.href = כתובת ה-URL שאליה הדפדפן יעבור
            window.location.href = "index.html";
          });

        });

    })
    // catch יתפוס כל שגיאה שקרתה באחד השלבים ב-Promise chain
    .catch((error) => {
      // error.message = טקסט השגיאה שהגיעה מפיירבייס (למשל "Email already in use")
      alert(error.message);
    });
}



// --- LOGIN ---
// פונקציה שאחראית על התחברות משתמש קיים באמצעות אימייל וסיסמה
function login() {

    // קריאה לפקודת document.getElementById("email") כדי להביא את השדה
    // .value: שוב גישה לשדה הערך של אלמנט input
    const email = document.getElementById("email").value;

    // שליפת הסיסמה מהאינפוט
    const password = document.getElementById("password").value;

    // בדיקה אם אחד השדות ריק
    if (!email || !password) {
        alert("נא למלא את כל השדות");
        return;
    }

    // כאן אנחנו שוב משתמשים ב-service של Authentication של Firebase
    // signInWithEmailAndPassword = פונקציה שמבצעת התחברות (Login) עם אימייל וסיסמה
    firebase.auth()
        .signInWithEmailAndPassword(email, password)
        // then מקבל את userCredential אם ההתחברות הצליחה
        .then(userCredential => {

            // מוציאים את אובייקט המשתמש מהתשובה
            const user = userCredential.user;

            // כאן אנחנו כותבים לוג ליומן האירועים שהייתה התחברות מוצלחת
            // writeLog היא פונקציה שהגדרנו למטה בקובץ הזה
            // type = "Login", user.email → כתובת אימייל של המשתמש
            return writeLog(
                "Login",
                user.email,
                "התחברות מוצלחת"
            );

        })
        // אחרי שהלוג נכתב, אנחנו מעבירים את המשתמש לעמוד "רקע והוראות"
        .then(() => {
            window.location.href = "background_instructions.html";
        })
        // אם הייתה שגיאה (או בהתחברות או במהלך שרשרת ה-then), נגיע לכאן
        .catch(error => {
            alert("שגיאה: " + error.message);
        });
}







// --- AUTH STATE MANAGER (Navbar + Logout + Page Protection) ---
// כאן אנחנו מאזינים למצב האימות (אם משתמש מחובר או לא)
// onAuthStateChanged = פונקציה שנותנת callback כל פעם שהמשתמש מתחבר/מתנתק
firebase.auth().onAuthStateChanged(user => {

    // כאן אנחנו מביאים את אלמנט הניווט הראשי לפי ה-id שלו
    // נשמור אותו במשתנה navbar (ללא let/const → הופך גלובלי)
    navbar = document.getElementById("mainNavbar");

    // אותו דבר עבור כפתור ההתנתקות
    signOutBtn = document.getElementById("signOutBtn");

    // --- Navbar ---
    // אם קיים אלמנט navbar (לא null) → נסתיר/נציג אותו לפי אם יש user (מחובר) או לא
    // user ? "block" : "none" זה תנאי (ternary operator):
    // אם user לא null → display "block", אחרת "none"
    if (navbar) navbar.style.display = user ? "block" : "none";

    // --- Logout button ---
    // אותו רעיון, רק לכפתור Logout
    if (signOutBtn) signOutBtn.style.display = user ? "inline-block" : "none";

    // --- Page protection ---
    // כאן אנחנו מגדירים מערך של שמות קבצי HTML שדורשים התחברות
    protectedPages = [
        "log.html",
        "live_feed.html",
        "background_instructions.html",
        "dc_control.html"
    ];

    // כאן אנחנו מוציאים את שם הקובץ הנוכחי מה-URL
    // window.location.pathname = כל הנתיב (למשל /folder/log.html)
    // split("/") מחלק את המחרוזת למערך לפי "/"
    // pop() מחזיר את האיבר האחרון במערך (שם הקובץ)
    currentPage = window.location.pathname.split("/").pop();

    // אם אין משתמש מחובר וגם הדף הנוכחי נמצא ברשימת הדפים המוגנים
    // includes בודק האם currentPage קיים בתוך המערך protectedPages
    if (!user && protectedPages.includes(currentPage)) {
        // נעשה redirect לעמוד ההתחברות
        window.location.href = "index.html";
    }
});



// --- LOGOUT BUTTON HANDLER ---
// כאן אנחנו מוסיפים האזנה לאירוע DOMContentLoaded
// כלומר: כשכל ה-HTML נטען, נריץ את הפונקציה הפנימית
document.addEventListener("DOMContentLoaded", () => {

    // מחפשים את כפתור ההתנתקות (למקרה שהוא קיים בדף)
    const signOutBtn = document.getElementById("signOutBtn");

    // אם אכן יש כפתור כזה בדף (לא null)
    if (signOutBtn) {
        // נגדיר לו פונקציית onclick → מה קורה כשלוחצים על הכפתור
        signOutBtn.onclick = function () {

            // ניקח את המשתמש הנוכחי שמחובר כרגע
            const user = firebase.auth().currentUser;

            // קודם כותבים לוג
            // type = "Logout", user.email או "Unknown" אם אין משתמש
            writeLog(
                "Logout",
                user ? user.email : "Unknown",
                "התנתקות מוצלחת"
            );

            // ואז מתנתקים בפועל
            firebase.auth().signOut().then(() => {
                // אחרי שההתנתקות הצליחה, נעבור לעמוד הראשי
                window.location.href = "index.html";
            });

        };
    }
});


//motor control//
// כאן אנחנו מגדירים פונקציה לשליחת פקודה למנוע (קדימה/אחורה/ימינה/שמאלה/עצור)
function sendCommand(cmd) {

    // מקבלים את הזמן הנוכחי כמספר מילישניות מאז 1.1.1970 (Unix time)
    const now = Date.now();                               // זמן במילישניות

    // יוצרים מחרוזת זמן קריאה בפורמט תאריך ושעה ישראלי ("he-IL")
    const timeString = new Date().toLocaleString("he-IL"); // זמן קריא

    // כתיבה לפיירבייס (של ESP32)
    // firebase.database() → גישה ל-Realtime Database
    // ref("control/motorCommand") → נתיב שבו נשמור את הפקודה
    // set({ ... }) → כתיבה של אובייקט JSON לנתיב הזה (מחליף את התוכן הקודם)
    firebase.database().ref("control/motorCommand").set({
        // command: הפקודה שהתקבלה לפונקציה (forward/backward/left/right/stop)
        command: cmd,
        // timestamp: הזמן הגולמי במילישניות
        timestamp: now,
        // timeString: מחרוזת קריאה לספר האדם
        timeString: timeString
    });

    // כתיבת לוג ליומן
    // מביאים את המשתמש הנוכחי המחובר
    const user = firebase.auth().currentUser;

    // קוראים לפונקציה writeLog שלנו כדי לשמור ביומן את הפעולה
    writeLog(
        "Motor Direction",
        user ? user.email : "Unknown",
        "כיוון מנוע: " + cmd
    );

    // הדפסה לקונסול לצורכי דיבאג
    console.log("Sending motor command:", cmd, timeString);
}

// כדי למנוע שליחה כפולה של אותה פקודה
// כאן אנחנו מגדירים משתנה גלובלי שמחזיק את המקש הפעיל כרגע
// אם המשתמש מחזיק עדיין את אותו חץ, לא נשלח שוב את אותה פקודה
let activeKey = null;

// כאן מאזינים לאירוע keydown על כל המסמך (document)
// כל פעם שמשתמש לוחץ על מקש, הפונקציה הזו תופעל
document.addEventListener("keydown", (e) => {

    // רשימת מקשים מותרים: ארבעת החיצים + רווח
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    // אם המקש שנלחץ לא נמצא ברשימה — יוצאים מהפונקציה (לא עושים כלום)
    if (!allowedKeys.includes(e.key)) return;

    // אם כבר יש activeKey והוא אותו מקש שנלחץ, לא נשלח שוב פקודה
    if (activeKey === e.key) return;

    // switch בודק את הערך של e.key ומבצע פקודה לפי המקרה
    switch (e.key) {
        case "ArrowUp":
            // במצב הזה מגדירים את activeKey להיות החץ למעלה
            activeKey = e.key;
            // שולחים פקודת forward למנוע
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
            // רווח מייצר פקודת stop
            activeKey = e.key;
            sendCommand("stop");
            break;
    }
});


// כאן מאזינים לאירוע keyup (שחרור מקש)
document.addEventListener("keyup", (e) => {

    // שוב בודקים אם המקש הוא אחד מהמקשיים המותרים
    const allowedKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];

    if (!allowedKeys.includes(e.key)) return;

    // ברגע ששחררו כל מקש מותר, אנחנו מאפסים את activeKey
    activeKey = null;
    // ושולחים פקודת stop למנוע (כדי לעצור את הרכב)
    sendCommand("stop");
});


// Laser Toggler //
// כאן נגדיר את המצב ההתחלתי של הלייזר כ"off"
let laserState = "off";

// פונקציה שמופעלת כשלוחצים על כפתור הלייזר
function toggleLaser() {

    // הופכים מצב: אם היה "off" נהפוך ל-"on", ואם "on" נהפוך ל-"off"
    // זה נקרא תנאי טרנרי: condition ? valueIfTrue : valueIfFalse
    laserState = (laserState === "off") ? "on" : "off";

    // שוב: זמן נוכחי במילישניות
    const now = Date.now();
    // וגרסה קריאה של הזמן בעברית
    const timeString = new Date().toLocaleString("he-IL");

    // כתיבה ל-Firebase במבנה זהה ל-motorCommand
    // רק שהפעם כותבים לנתיב control/laserCommand
    firebase.database().ref("control/laserCommand").set({
        command: laserState,
        timestamp: now,
        timeString: timeString
    });

    // הדפסה לקונסול לצורכי בדיקה
    console.log("Laser:", laserState, timeString);

    // כתיבת לוג ליומן
    const user = firebase.auth().currentUser;
    writeLog(
        // הטיפוס יהיה "Laser On" או "Laser Off" לפי המצב החדש
        laserState === "on" ? "Laser On" : "Laser Off",
        user ? user.email : "Unknown",
        "שינוי מצב הלייזר ל-" + laserState
    );
}



// --- LOG WRITER ---
// פונקציה כללית לכתיבת רשומת לוג למסד הנתונים
// היא מקבלת type (סוג האירוע), user (מי ביצע) ו-details (תיאור חופשי)
function writeLog(type, user, details) {
    // firebase.database().ref("logs") → נתיב logs במסד הנתונים
    // push({ ... }) → מוסיף ילד חדש עם מפתח אוטומטי (unique key)
    // הפונקציה מחזירה Promise ולכן אפשר להשתמש בה ב-then במקומות אחרים
    return firebase.database().ref("logs").push({
        // timestamp = תאריך/שעה בפורמט קריא לטבלה
        timestamp: new Date().toLocaleString("he-IL"),
        // type, user, details — שימוש בקיצור של ES6 (שם המשתנה זהה לשם השדה)
        type,
        user,
        details
    });
}



// --- LOG PAGE DYNAMIC TABLE LOADER ---
// מאזינים ל-DOMContentLoaded כדי לוודא שהטבלה קיימת בדף
document.addEventListener("DOMContentLoaded", () => {
    // מחפשים את tbody של הטבלה ביומן, לפי ה-id שלו
    const logBody = document.getElementById("logTableBody");

    // אם אין כזה אלמנט (לא בדף הזה) → יוצאים ולא עושים כלום
    if (!logBody) return; // אם הדף אינו log.html → לא מפעיל

    // יוצרים משתנה שמחזיק את ה-Reference לבסיס הנתונים
    const db = firebase.database();

    // מפנים לנתיב "logs" במסד הנתונים
    const logRef = db.ref("logs");

    // on("value", callback) → מאזין לכל שינוי בערך של "logs"
    // snapshot מייצג את הנתונים בצורת עץ JSON
    logRef.on("value", snapshot => {
        // מנקים את גוף הטבלה, כדי למלא אותה מחדש
        logBody.innerHTML = ""; // מנקה את הטבלה

        // נגדיר מערך ריק שיכיל את כל הלוגים
        const logs = [];

        // snapshot.forEach עובר על כל ילד (רשומת לוג) מתחת ל"logs"
        // child.val() מחזיר את הערך (האובייקט) של אותו לוג
        // שלב 1 – אוסף את כל הלוגים למערך
        snapshot.forEach(child => {
            logs.push(child.val());
        });

        // שלב 2 – מיון מהחדש לישן
        // new Date(b.timestamp) - new Date(a.timestamp) → סדר יורד
        logs.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

        // שלב 3 – הכנסה לטבלה לפי סדר חדש
        // עוברים על כל לוג במערך לאחר המיון
        logs.forEach(log => {

            // כאן אנחנו מחליטים על מחלקת ה-Badge לפי סוג הלוג
            // אובייקט עם map בין type לבין class של Bootstrap
            const badgeClass = {
                "Login": "bg-success",
                "Logout": "bg-secondary",
                "Alert": "bg-warning text-dark",
                "Laser On": "bg-danger",
                "Laser Off": "bg-info text-dark",
                "Motor Direction": "bg-primary"
            }[log.type] || "bg-light text-dark";
            // השורה ]...[log.type] לוקחת את המחלקה המתאימה מהאובייקט לפי type
            // אם אין התאמה (undefined) משתמשים בברירת מחדל "bg-light text-dark"

            // כאן אנחנו בונים מחרוזת HTML שמייצגת שורת טבלה אחת
            // משתמשים ב-Template literal (`...`) כדי לשלב ערכים בתוך המחרוזת
            const row = `
                <tr>
                    <td>${log.timestamp || "-"}</td>
                    <td><span class="badge ${badgeClass}">${log.type}</span></td>
                    <td>${log.user || "-"}</td>
                    <td>${log.details || "-"}</td>
                </tr>
            `;

            // מוסיפים את שורת ה-HTML לטבלה באמצעות innerHTML +=
            logBody.innerHTML += row;
        });
    });
});

// --- EVENT REPORT (MOBILE) ---
// שוב מאזינים ל-DOMContentLoaded, כי אנחנו רוצים להיות בטוחים שהטופס נטען
document.addEventListener("DOMContentLoaded", () => {
    // לוקחים את טופס הדיווח לפי ה-id שלו
    const form = document.getElementById("eventFormMobile");

    // אם אין טופס כזה בדף הנוכחי → יוצאים מהפונקציה
    if (!form) return;

    // כאן אנחנו מאזינים לאירוע "submit" על הטופס
    form.addEventListener("submit", e => {
        // e.preventDefault() מונע מהטופס את ההתנהגות הרגילה שלו (רענון דף ושליחה לשרת)
        e.preventDefault();

        // לוקחים את המשתמש הנוכחי שמחובר
        const user = firebase.auth().currentUser;

        // שליפת הכותרת מתוך האינפוט הראשון מסוג text בתוך הטופס
        const title = form.querySelector("input[type='text']").value;

        // שליפת סוג המטרה מתוך ה-select הראשון
        const target = form.querySelector("select").value;

        // שליפת כפתור הרדיו שנבחר (input[type='radio']:checked)
        const realFake = form.querySelector("input[type='radio']:checked");
        // אם יש כפתור רדיו שנבחר → ניקח את הטקסט של הלייבל אחריו (nextElementSibling.textContent)
        // אם לא נבחר שום דבר → "לא נבחר"
        const realFakeValue = realFake ? realFake.nextElementSibling.textContent : "לא נבחר";

        // כאן לוקחים את כל הצ'קבוקסים המסומנים
        // [...NodeList] הופך את רשימת הגרומים למערך כדי שנוכל להשתמש ב-map
        const alerts = [...form.querySelectorAll("input[type='checkbox']:checked")]
            // map על הצ'קבוקסים, מחזיר את הטקסט של התווית אחרי כל צ'קבוקס
            .map(x => x.nextElementSibling.textContent)
            // join(", ") מחבר את כל המחרוזות למחרוזת אחת מופרדת בפסיקים
            .join(", ");

        // לוקחים את תיאור האירוע מתוך ה-textarea
        const description = form.querySelector("textarea").value;

        // לוקחים את רמת האיום מתוך ה-select השני בטופס
        // querySelector("select:nth-of-type(2)") → ה-select השני לפי סדר הופעה
        const threatLevel = form.querySelector("select:nth-of-type(2)").value;

        // כאן אנחנו בונים מחרוזת אחת ארוכה שמכילה את כל פרטי האירוע
        // כל שורה מסתיימת ב-\n כדי ליצור ירידת שורה
        const details =
            `כותרת: ${title}\n` +
            `סוג מטרה: ${target}\n` +
            `סוג אירוע: ${realFakeValue}\n` +
            `ערוצי התראה: ${alerts || "ללא"}\n` +
            `תיאור: ${description}\n` +
            `רמת איום: ${threatLevel}`;

        // כותבים את האירוע ליומן הלוגים בעזרת writeLog
        writeLog(
            "Alert",
            user ? user.email : "Unknown",
            details
        );

        // מציגים הודעת הצלחה למשתמש
        alert("האירוע נרשם בהצלחה ביומן.");

        // מאפסים את הטופס כדי שיתחיל מחדש
        form.reset();
    });
});
