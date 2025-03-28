const express = require('express');
const http = require('http');  // استيراد http لإنشاء خادم
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid'); // مكتبة لإنشاء معرّف فريد لكل زائر
const app = express();  //  تعريف `app`  قبل أي استخدام له
const path = require('path'); // لإدارة المسارات
const server = http.createServer(app);
const router = express.Router();
//sql railway
require('dotenv').config();

const io = socketIo(server, {
        cors: 
    {
        origin:"*",
        methods: ["GET", "POST"]
    }});

//view engine setup
app.use(express.static(path.join(__dirname, '..')));

app.set('view engine', 'ejs');

app.set('views',path.join(__dirname, '../views'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../index.html')); // تحديد المسار الصحيح للملف
});

app.get('/script', (req, res) => {
  console.log("جاري تنفيذ الاستعلام...♥️♥️♥️♥️♥️"); 
  sql = 'SELECT * FROM upvote ORDER BY id DESC';
  con.query(sql, function(error,data){
    if (error)
    {
      console.error("error fetching data:",error);
    }
    console.log("البيانات التي تم جلبها من قاعدة البيانات:💙💙💙💙", data); // هنا سيتم طباعة البيانات        res.render('script', {title:'Mhaaaa application', action:'add', sampleData: data});
    res.render('script', { action:'add', sampleData: data});
  });
});

app.use(express.json()); //  تمكين `express.json()` عشان استقبال بيانات JSON
    server.listen(8000, '0.0.0.0', () => {
      console.log('Server is running on http://127.0.0.1:8000');
});

//SQL
const mysql2 = require('mysql2');
const con = mysql2.createConnection({
  host: "localhost",
  user: "root",
  password: "",
  database: "vote"
 // host: process.env.MYSQLHOST,    // استخدم متغير البيئة DB_HOST 
  //port: process.env.MYSQLPORT,    // استخدم متغير البيئة DB_PORT
  //user: process.env.MYSQLUSER,    // استخدم متغير البيئة DB_USER
  //password: process.env.MYSQLPASSWORD,  // استخدم متغير البيئة DB_PASSWORD
  //database: process.env.MYSQL_DATABASE  // استخدم متغير البيئة DB_NAME
});

//التاكد من ان الاتصال بقاعدة البيانات مزبوط
con.connect((err) => {
  if (err) {
    console.error('❌ فشل الاتصال بقاعدة البيانات:', err);
    return;  // إذا فشل الاتصال، نوقف باقي الكود
  }
  console.log('✅ تم الاتصال بقاعدة البيانات بنجاح!');
});



let totalVotes = 0;
let votingPolls = {
    'yes': 0,
    'no': 0
}

io.on('connection',socket =>{ // استقبال اتصال مستخدم 
// إنشاء معرف فريد للمستخدم إذا لم يكن لديه
     if (!socket.handshake.sessionID) {
      socket.handshake.sessionID = uuidv4(); 
  }
  console.log(`🔹 مستخدم جديد متصل، معرف الجلسة: ${socket.handshake.sessionID}`);


//Send Current Data of Votes to user when visited the site
socket.emit('update',{votingPolls,totalVotes, sessionID: socket.handshake.sessionID }) // يرسل للمستخدم اللي توه داخل بيانات التصويت الحاليه والعدد الاجمالي
socket.on('send-vote',voteTo =>{ // استقبال تصويت المستخدم
    totalVotes += 1; // تحديث عدد الاصوات
    console.log(voteTo) // نطبع قيمه المتغير بزيادة 1
    votingPolls[voteTo] += 1;
// تخزين التصويت في قاعدة البيانات
  const sql = 'INSERT INTO upvote (sessionID, votingPolls, totalVotes) VALUES (?, ?,?)';
  const values = [socket.handshake.sessionID,voteTo, 1]; // 1 يعني التصويت من هذا المستخدم
    con.query(sql, values, (err, result) => {
    if (err) {
    console.error("Error inserting vote data into database:", err);
    return;
    }
    console.log("Vote data inserted into database:", result);

    socket.broadcast.emit('receive-vote',{votingPolls,totalVotes}); // يرسل تحديث بالنتائج الجديدة إلى جميع المستخدمين المتصلين ما عدا المُرسلة
    socket.emit('update',{votingPolls,totalVotes})// يُرسل تحديث للكل حتى المستخدم اللي أرسل التصويت حتى يحصل على البيانات الجديدة
  //fetsh

  app.get ("/script", function(request, response, next){
    console.log("جاري تنفيذ الاستعلام...♥️♥️♥️♥️♥️"); 
    sql = 'SELECT * FROM upvote ORDER BY id DESC';
    con.query(sql, function(error,data){
      if (error)
      {
        console.error("error fetching data:",error);
      }
      console.log("البيانات التي تم جلبها من قاعدة البيانات:💙💙💙💙", data); // هنا سيتم طباعة البيانات        res.render('script', {title:'Mhaaaa application', action:'add', sampleData: data});
      response.render('script', {title:'Mhaaaa application', action:'add', sampleData: data});
    });
  });

// تحديث قاعدة البيانات عشان تتحدث  totalVotes
const sql = 'UPDATE upvote SET totalVotes = ? WHERE id = 1'; // نفترض أن هناك سجل واحد في قاعدة البيانات يحمل إجمالي الأصوات
const values = [totalVotes];
  con.query(sql, values, (err, result) => {
    if (err) {
    console.error("❌ خطأ في تحديث totalVotes في قاعدة البيانات:", err);
    return;
    }
console.log("📝 تم تحديث إجمالي الأصوات في قاعدة البيانات:", result);
    });
    
})

// form
socket.on('sendForm', (data) => {
  console.log("تم استلام البيانات من الفورم:", data.value);
           // تخزين النسبة المدخلة في قاعدة البيانات
  const sql = 'UPDATE upvote SET percentage = ? WHERE sessionID = ?';
  const values = [ data.value, socket.handshake.sessionID]; // تغيير 'percentage' إلى القيمة المناسبة في قاعدة البيانات
  con.query(sql, values, (err, result) => {
     if (err) {
     console.error('Error inserting vote percentage:', err);
     return;
     }
});
// إرسال رد للمرسل فقط
  socket.emit('response', { message: "تم استلام بياناتك: " + data.value });
  });
  socket.on('disconnect', () => {
    console.log("مستخدم قطع الاتصال");
});
});
})
