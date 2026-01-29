// جلب الهويات من localStorage
let users = JSON.parse(localStorage.getItem("users")) || [];

// إنشاء حساب Owner إذا ما كان موجود
const ownerExists = users.find(u => u.id === "Owner");

if (!ownerExists) {
  users.push({
    id: "Owner",
    pass: "050910",
    role: "Owner"
  });
  localStorage.setItem("users", JSON.stringify(users));
}

// تسجيل الدخول
function login() {
  const id = document.getElementById("id").value.trim();
  const pass = document.getElementById("pass").value.trim();
  const err = document.getElementById("err");

  const user = users.find(u => u.id === id && u.pass === pass);

  if (!user) {
    err.style.display = "block";
    err.innerHTML =
      "❌ الهوية أو كلمة المرور غير صحيحة.<br>يرجى التوجه إلى سيرفر الإدارة لإنشاء هوية جديدة.";
    return;
  }

  localStorage.setItem("currentUser", JSON.stringify(user));
  window.location.href = "dashboard.html";
}
