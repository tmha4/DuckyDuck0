const express = require('express');
const http = require('http');  
const socketIo = require('socket.io');
const { v4: uuidv4 } = require('uuid'); 
const app = express();  
const path = require('path'); 
const server = http.createServer(app);
const cors = require('cors');
//sql filess
const mysql2 = require('mysql2/promise'); // استخدم النسخة التي تدعم الوعود (promises)
require('dotenv').config();

const io = socketIo(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

// إنشاء الاتصال بقاعدة البيانات مرة واحدة
let con;

async function connectDB() {
    if (!con) {
        try {
            con = await mysql2.createConnection({
                host: 'at4-x.h.filess.io',
                user: 'vote_makingbend',
                password: 'd39b3f0bd9c784d472220bcf07366460a49ec3bb',
                database: 'vote_makingbend',
                port: 61001
            });
            console.log("تم الاتصال بقاعدة البيانات بنجاح!");
        } catch (err) {
            console.error("❌ حدث خطأ أثناء الاتصال بقاعدة البيانات:", err);
        }
    }
    return con;
}

// إعداد المسارات في Express
app.use(express.static(path.join(__dirname, '..')));
app.use(cors({
    origin: "https://duckyduck0.onrender.com" 
  }));
  app.use(express.json()); 

// استعلام التصويتات
app.get('/api/votes', async (req, res) => {
    const connection = await connectDB();
    if (!connection) {
        return res.status(500).json({ error: 'فشل الاتصال بقاعدة البيانات' });
    }
    try {
        const [rows] = await connection.query('SELECT * FROM upvote');
        res.json(rows);
    } catch (err) {
        console.error('Error fetching votes:', err);
        res.status(500).json({ error: 'Database query failed' });
    }
});

// إضافة المسار /data لجلب البيانات من جدول معين
app.get('/data', async (req, res) => {
    const connection = await connectDB();
    if (!connection) {
        return res.status(500).json({ error: 'فشل الاتصال بقاعدة البيانات' });
    }
    try {
        const [rows] = await connection.query(`
            SELECT 
                id, 
                votingPolls, 
                percentage, 
                DATE_FORMAT(time, '%h:%i %p') AS formattedTime,
                DATE_FORMAT(date, '%d-%m-%Y') AS formattedDate, 
                totalVotes, 
                sessionID 
            FROM upvote
            ORDER BY date DESC;
        `);
                res.json(rows);
    } catch (err) {
        console.error('❌ خطأ في الاستعلام:', err);
        res.status(500).json({ error: 'حدث خطأ في الاستعلام' });
    }
});


server.listen(process.env.PORT || 8000, () => {
    console.log(`Server is running on  ${process.env.PORT || 8000}`);
});

// التعامل مع التوصيل عبر WebSocket
let totalVotes = 0;
let votingPolls = {
    'yes': 0,
    'no': 0
};

io.on('connection', socket => {
    if (!socket.handshake.sessionID) {
        socket.handshake.sessionID = uuidv4();
    }
    console.log(`🔹 مستخدم جديد متصل، معرف الجلسة: ${socket.handshake.sessionID}`);

    socket.emit('update', { votingPolls, totalVotes, sessionID: socket.handshake.sessionID });

    socket.on('send-vote', async (voteTo) => {
        totalVotes += 1;
        console.log(voteTo);
        votingPolls[voteTo] += 1;

        //
            const connection = await connectDB();
    if (!connection) {
        return console.error(" فشل الاتصال بقاعدة البيانات");
    }

        const insertSql = 'INSERT INTO upvote (sessionID, votingPolls, totalVotes, percentage ) VALUES (?, ?, ?,?)';
        const insertValues = [socket.handshake.sessionID, voteTo, totalVotes , 0];
        try {
            await connection.query(insertSql, insertValues);
            const updateSql = 'UPDATE upvote SET totalVotes = ? WHERE id = 1';
            await connection.query(updateSql, [totalVotes]);
            socket.emit('update', { votingPolls, totalVotes, sessionID: socket.handshake.sessionID }); // يحدث خط التصويت دايركت 
            socket.broadcast.emit('update', { votingPolls, totalVotes, sessionID: socket.handshake.sessionID });
        } catch (err) {
            console.error(" خطأ في إدخال أو تحديث البيانات في قاعدة البيانات:", err);
        }
    });

    socket.on('sendForm', async (data) => {
        console.log("تم استلام البيانات من الفورم:", data.value);

        const connection = await connectDB();
        if (!connection) {
            return console.error("❌ فشل الاتصال بقاعدة البيانات");
        }

        const updatePercentageSql = 'UPDATE upvote SET percentage = ? WHERE sessionID = ?';
        const updatePercentageValues = [data.value, socket.handshake.sessionID];
        try {
            await connection.query(updatePercentageSql, updatePercentageValues);
            console.log("✅ تم تحديث النسبة المئوية في قاعدة البيانات");
        } catch (err) {
            console.error('❌ خطأ في تحديث النسبة المئوية في قاعدة البيانات:', err);
        }

        socket.emit('response', { message: "تم استلام بياناتك: " + data.value });
        
    });

    socket.on('disconnect', () => {
        console.log("مستخدم قطع الاتصال");
    });
});
