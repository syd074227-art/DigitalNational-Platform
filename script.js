const roleCards = document.querySelectorAll("#roleCards .card");
const rankStep = document.getElementById("rankStep");
const adminStep = document.getElementById("adminStep");
const rankCards = document.getElementById("rankCards");
const adminCards = document.getElementById("adminCards");
const idUploadStep = document.getElementById("idUploadStep");
const submitBtn = document.getElementById("submitBtn");
const message = document.getElementById("message");

let selectedRole = null;

// الرتب
const ranks = {
  interior: ["جندي","جندي أول","عريف","وكيل رقيب","رقيب","رقيب أول","رئيس رقباء"],
  health: ["مسعف","دكتور عام","دكتور","استشاري","جراح"],
  justice: ["محامي","محامي متمرس","قاضي","قاضي محكمة عليا"]
};

// المناصب الإدارية
const admins = {
  interior: ["إدارة القبول والتجنيد","إدارة شؤون الداخلية","إدارة شؤون الأفراد","سلك الضباط"],
  health: ["إدارة القبول والتسجيل","إدارة الشؤون الصحية","مسؤول الشؤون الصحية","إدارة متطوعين الهلال الأحمر","إدارة الشكاوي","إدارة الكلية الصحية"],
  justice: ["إدارة القبول والتسجيل","إدارة الشكاوي","إدارة الشؤون العدلية"]
};

// اختيار الوظيفة
roleCards.forEach(card=>{
  card.addEventListener("click", ()=>{
    roleCards.forEach(c=>c.classList.remove("active"));
    card.classList.add("active");

    selectedRole = card.dataset.role;
    rankCards.innerHTML = "";
    adminCards.innerHTML = "";
    adminStep.classList.add("hidden");
    idUploadStep.classList.add("hidden");

    if(selectedRole === "citizen") return;

    rankStep.classList.remove("hidden");
    ranks[selectedRole].forEach(rank=>{
      const div = document.createElement("div");
      div.className = "card";
      div.textContent = rank;
      div.addEventListener("click", ()=>{
        rankCards.querySelectorAll(".card").forEach(c=>c.classList.remove("active"));
        div.classList.add("active");
        loadAdmins();
      });
      rankCards.appendChild(div);
    });
  });
});

// تحميل المناصب الإدارية
function loadAdmins(){
  adminCards.innerHTML = "";
  adminStep.classList.remove("hidden");
  idUploadStep.classList.remove("hidden");

  admins[selectedRole].forEach(admin=>{
    const div = document.createElement("div");
    div.className = "card";
    div.textContent = admin;
    div.addEventListener("click", ()=>div.classList.toggle("active"));
    adminCards.appendChild(div);
  });
}

// التحقق من رفع الهوية
submitBtn.addEventListener("click", ()=>{
  const fileInput = document.getElementById("idImage");
  if(fileInput.files.length===0){
    message.textContent = "⚠️ يرجى رفع صورة الهوية مع الوجه!";
    message.classList.remove("hidden");
    setTimeout(()=>message.classList.add("hidden"),4000);
    return;
  }
  message.textContent = "تم تقديم طلب تفعيل الهوية بنجاح!";
  message.classList.remove("hidden");
  setTimeout(()=>message.classList.add("hidden"),4000);
});
