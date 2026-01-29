if (!localStorage.getItem("users")) {
  const users = [
    {id:"ADMIN-0001",pass:"admin",role:"admin",active:true},
    {id:"MOA-ID2828",pass:"1234",role:"employee",active:true},
    {id:"MOA-CHEF18272",pass:"chef",role:"leader",active:true},
    {id:"CIV-ID8282",pass:"1111",role:"citizen",active:true}
  ];
  localStorage.setItem("users", JSON.stringify(users));
}
