const socket = io ('https://duckyduck0.onrender.com'); //انشاء الاتصال مع الخادم, عشان تبادل البيانات بين العميل والخادم في الوقت الفعلي
const progressBoxes = document.querySelectorAll('.progress-box');
const percentTags = document.querySelectorAll('.percent-tag');
const totalVotesElem = document.getElementById('totalVotes');

let vote = false;

for (let i = 0; i < progressBoxes.length; i++) {
    const elem = progressBoxes[i];
    elem.addEventListener('click',()=>{
        addVote(elem,elem.id)
    });
}


const addVote = (elem,id)=>{
    if (vote) {
        return
    }
    let voteTo = id;
    elem.classList.add('active');
    socket.emit('send-vote',voteTo);
    vote = true;
}


socket.on('receive-vote', data => {
    updatePolls(data);
});

socket.on('update', data => {
    updatePolls(data)
    console.log(data);

})

const updatePolls = (data)=>{
    let votingObject = data.votingPolls;
    let totalVotes = data.totalVotes;
    totalVotesElem.innerHTML = totalVotes
    for (let i = 0; i < percentTags.length; i++) {
        let vote = votingObject[progressBoxes[i].id]; //حساب نسبة التصويت لكل خيار 
        let setWidth = Math.round(vote / totalVotes * 100); // counting 
        const elem = document.querySelector(`#${progressBoxes[i].id}`)
        .querySelector('.percent-tag');
        elem.setAttribute('data',`${!setWidth? 0: setWidth}%`); // يعدل خاصية data لعرض النسبة المئوية
        elem.style.width = `${!setWidth? 0: setWidth}%`; // يعدل width لتحديث طول شريط التقدم
        console.log(elem)
    }
}




// استهداف جميع الفورم في الصفحة
const form = document.querySelectorAll(".FormBlank").forEach(form => {
    form.addEventListener("submit", function(event) {
        event.preventDefault(); // منع تحديث الصفحة

        let inputData = form.querySelector(".inputField").value.trim(); // الحصول على المدخل داخل الفورم الحالي فقط

        if (inputData) { 
            console.log("🔹 تم إرسال البيانات:", inputData);
            socket.emit("sendForm", { value: inputData }); // إرسال البيانات إلى الخادم
            form.querySelector(".inputField").value = ""; // مسح الحقل بعد الإرسال
        } else {
            console.log("⚠️ الحقل فارغ!");
        }
    });
});

// استقبال الرد من الخادم وعرضه في الصفحة
socket.on("response", (data) => {
    console.log("✅ استجابة الخادم:", data);

    // تحديث جميع الفقرات التي تعرض الرد
    document.querySelectorAll(".responseMessage").forEach(response => {
        response.innerText = "رد الخادم: " + data.message;
    });
});
//اذا اختار yes  يظهر فورم النسبة
function yes(x){
    if (x==0) 
    document.getElementById('yesForm').style.display = 'block';   
 }
