function login(){
  let id = document.getElementById("id").value;
  let pass = document.getElementById("pass").value;
  let err = document.getElementById("err");

  let users = JSON.parse(localStorage.getItem("users"));
  let user = users.find(u=>u.id===id && u.pass===pass);

  if(!user){ err.textContent="بيانات خاطئة"; return; }
  if(!user.active){ err.textContent="الحساب معطل"; return; }

  localStorage.setItem("currentUser", JSON.stringify(user));

  if(user.role==="admin") location="admin.html";
  else if(user.role==="leader") location="leader.html";
  else if(user.role==="employee") location="employee.html";
  else location="citizen.html";
}

function logout(){
  localStorage.removeItem("currentUser");
  location="index.html";
}
