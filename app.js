// User credentials (ในระบบจริงควรเก็บในฐานข้อมูล)
const users = [
    { username: 'admin', password: 'admin123', role: 'admin', displayName: 'ผู้ดูแลระบบ' },
    { username: 'teacher1', password: 'teach123', role: 'teacher', displayName: 'อ.สมศรี' },
    { username: 'teacher2', password: 'teach456', role: 'teacher', displayName: 'อ.สมชาย' }
];

// Current user
let currentUser = null;

// Global variables
let students = [];
let attendanceData = {};
let currentClassroom = '';
let tempImportData = [];

// Initialize
document.addEventListener('DOMContentLoaded', function() {
    checkAuth();
});

// Check if user is logged in
function checkAuth() {
    const savedUser = localStorage.getItem('currentUser');
    if (savedUser) {
        currentUser = JSON.parse(savedUser);
        showMainApp();
    } else {
        showLoginScreen();
    }
}

// Show login screen
function showLoginScreen() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('mainApp').style.display = 'none';
}

// Show main app
function showMainApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('mainApp').style.display = 'block';
    document.getElementById('userDisplay').textContent = `👤 ${currentUser.displayName}`;
    
    // Set teacher name if user is teacher
    if (currentUser.role === 'teacher') {
        document.getElementById('teacherName').value = currentUser.displayName;
    }
    
    // Initialize app
    updateCurrentDate();
    loadSavedData();
}

// Handle login
function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;
    
    const user = users.find(u => u.username === username && u.password === password);
    
    if (user) {
        currentUser = user;
        localStorage.setItem('currentUser', JSON.stringify(user));
        document.getElementById('loginError').style.display = 'none';
        showMainApp();
    } else {
        document.getElementById('loginError').textContent = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง';
        document.getElementById('loginError').style.display = 'block';
    }
}

// Logout
function logout() {
    if (confirm('ต้องการออกจากระบบหรือไม่?')) {
        currentUser = null;
        localStorage.removeItem('currentUser');
        showLoginScreen();
        document.getElementById('username').value = '';
        document.getElementById('password').value = '';
    }
}

// Update current date
function updateCurrentDate() {
    const date = new Date();
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    document.getElementById('currentDate').textContent = date.toLocaleDateString('th-TH', options);
    document.getElementById('reportDate').value = date.toISOString().split('T')[0];
}

// Switch tabs
function switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab').forEach(tab => {
        tab.classList.remove('active');
    });
    event.target.classList.add('active');

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
        content.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');

    // Update attendance info when switching to attendance tab
    if (tabName === 'attendance') {
        updateAttendanceInfo();
    }
}

// Load saved data from localStorage
function loadSavedData() {
    const savedStudents = localStorage.getItem('students');
    const savedAttendance = localStorage.getItem('attendanceData');
    
    if (savedStudents) {
        students = JSON.parse(savedStudents);
    }
    
    if (savedAttendance) {
        attendanceData = JSON.parse(savedAttendance);
    }
}

// Save data to localStorage
function saveData() {
    localStorage.setItem('students', JSON.stringify(students));
    localStorage.setItem('attendanceData', JSON.stringify(attendanceData));
}

// Update class options based on year level
function updateClassOptions() {
    const yearLevel = document.getElementById('yearLevel').value;
    const classSelect = document.getElementById('classSelect');
    
    classSelect.innerHTML = '<option value="">-- เลือกตอนเรียน --</option>';
    
    if (yearLevel === '1') {
        classSelect.innerHTML += `
            <option value="y1-com-sec-1">📱 สื่อสารตอน 1</option>
            <option value="y1-com-sec-2">📱 สื่อสารตอน 2</option>
            <option value="y1-com-sec-3">📱 สื่อสารตอน 3</option>
            <option value="y1-com-comp">💻 สื่อสารคอม</option>
        `;
        classSelect.disabled = false;
    } else if (yearLevel === '2') {
        classSelect.innerHTML += `
            <option value="y2-com-sec-1">📱 สื่อสารตอน 1</option>
            <option value="y2-com-sec-2">📱 สื่อสารตอน 2</option>
            <option value="y2-com-sec-3">📱 สื่อสารตอน 3</option>
            <option value="y2-com-comp">💻 สื่อสารคอม</option>
        `;
        classSelect.disabled = false;
    } else {
        classSelect.disabled = true;
    }
}

// Load students for selected classroom
function loadStudents() {
    const classroom = document.getElementById('classSelect').value;
    currentClassroom = classroom;
    
    if (!classroom) return;

    const classStudents = students.filter(s => s.classroom === classroom);
    displayStudents(classStudents);
}

// Display students in attendance grid
function displayStudents(studentList) {
    const grid = document.getElementById('attendanceGrid');
    grid.innerHTML = '';

    studentList.forEach(student => {
        const card = document.createElement('div');
        card.className = `student-card ${student.status || 'present'}`;
        card.innerHTML = `
            <div class="student-name">${student.name}</div>
            <div class="student-id">รหัส: ${student.id}</div>
            <div class="status-buttons">
                <button class="status-btn ${student.status === 'present' ? 'active' : ''}" 
                        onclick="setStatus('${student.id}', 'present')" style="background: #28a745; color: white;">
                    มา
                </button>
                <button class="status-btn ${student.status === 'absent' ? 'active' : ''}" 
                        onclick="setStatus('${student.id}', 'absent')" style="background: #dc3545; color: white;">
                    ขาด
                </button>
                <button class="status-btn ${student.status === 'sick' ? 'active' : ''}" 
                        onclick="setStatus('${student.id}', 'sick')" style="background: #ffc107; color: #333;">
                    ป่วย
                </button>
                <button class="status-btn ${student.status === 'activity' ? 'active' : ''}" 
                        onclick="setStatus('${student.id}', 'activity')" style="background: #17a2b8; color: white;">
                    กิจกรรม
                </button>
                <button class="status-btn ${student.status === 'home' ? 'active' : ''}" 
                        onclick="setStatus('${student.id}', 'home')" style="background: #6c757d; color: white;">
                    กลับบ้าน
                </button>
            </div>
        `;
        grid.appendChild(card);
    });

    updateSummary();
}

// Set student status
function setStatus(studentId, status) {
    const student = students.find(s => s.id === studentId && s.classroom === currentClassroom);
    if (student) {
        student.status = status;
        saveData();
        loadStudents();
    }
}

// Update attendance summary
function updateSummary() {
    const classStudents = students.filter(s => s.classroom === currentClassroom);
    
    const counts = {
        present: 0,
        absent: 0,
        sick: 0,
        activity: 0,
        home: 0
    };

    classStudents.forEach(student => {
        counts[student.status || 'present']++;
    });

    document.getElementById('presentCount').textContent = counts.present;
    document.getElementById('absentCount').textContent = counts.absent;
    document.getElementById('sickCount').textContent = counts.sick;
    document.getElementById('activityCount').textContent = counts.activity;
    document.getElementById('homeCount').textContent = counts.home;
}

// Update attendance info
function updateAttendanceInfo() {
    const yearLevel = document.getElementById('yearLevel').value;
    const classSelect = document.getElementById('classSelect').value;
    
    // แสดงชั้นปี
    const yearText = {
        '1': 'ชั้นปีที่ 1',
        '2': 'ชั้นปีที่ 2'
    };
    document.getElementById('currentYear').textContent = yearText[yearLevel] || '-';
    
    // แสดงตอนเรียน
    const classText = {
        'y1-com-sec-1': '📱 สื่อสารตอน 1',
        'y1-com-sec-2': '📱 สื่อสารตอน 2',
        'y1-com-sec-3': '📱 สื่อสารตอน 3',
        'y1-com-comp': '💻 สื่อสารคอม',
        'y2-com-sec-1': '📱 สื่อสารตอน 1',
        'y2-com-sec-2': '📱 สื่อสารตอน 2',
        'y2-com-sec-3': '📱 สื่อสารตอน 3',
        'y2-com-comp': '💻 สื่อสารคอม'
    };
    document.getElementById('currentClass').textContent = 
        classText[classSelect] || '-';
    document.getElementById('currentTeacher').textContent = 
        document.getElementById('teacherName').value || '-';
    
    const timeSlot = document.getElementById('timeSlot').value;
    const timeSlotText = {
        'morning': '🌅 ภาคเช้า',
        'afternoon': '☀️ ภาคบ่าย'
    };
    document.getElementById('currentTimeSlot').textContent = 
        timeSlotText[timeSlot] || '-';
}

// Save attendance
function saveAttendance() {
    const date = new Date().toISOString().split('T')[0];
    const time = new Date().toLocaleTimeString('th-TH');
    const teacher = document.getElementById('teacherName').value;
    const timeSlot = document.getElementById('timeSlot').value;
    const classroom = currentClassroom;

    if (!classroom || !teacher || !timeSlot) {
        showAlert('กรุณากรอกข้อมูลให้ครบถ้วน', 'error');
        return;
    }

    const classStudents = students.filter(s => s.classroom === classroom);
    
    if (!attendanceData[date]) {
        attendanceData[date] = [];
    }

    const timeSlotText = {
        'morning': 'ภาคเช้า',
        'afternoon': 'ภาคบ่าย'
    };

    classStudents.forEach(student => {
        attendanceData[date].push({
            time: time,
            studentId: student.id,
            studentName: student.name,
            classroom: classroom,
            status: student.status || 'present',
            teacher: teacher,
            timeSlot: timeSlotText[timeSlot]
        });
    });

    saveData();
    showAlert('บันทึกการเช็กชื่อสำเร็จ', 'success');
}

// Load report
function loadReport() {
    const date = document.getElementById('reportDate').value;
    const tbody = document.getElementById('reportBody');
    const table = document.getElementById('reportTable');
    const loading = document.getElementById('loading');

    tbody.innerHTML = '';
    
    if (!date || !attendanceData[date]) {
        table.style.display = 'none';
        return;
    }

    loading.classList.add('active');
    
    setTimeout(() => {
        const records = attendanceData[date];
        
        records.forEach(record => {
            const row = tbody.insertRow();
            row.innerHTML = `
                <td>${record.time}</td>
                <td>${record.studentId}</td>
                <td>${record.studentName}</td>
                <td><span class="status-badge ${record.status}">${getStatusText(record.status)}</span></td>
                <td>${record.teacher}</td>
                <td>${record.timeSlot}</td>
            `;
        });

        loading.classList.remove('active');
        table.style.display = 'table';
    }, 500);
}

// Get status text in Thai
function getStatusText(status) {
    const statusMap = {
        'present': 'มาเรียน',
        'absent': 'ขาดเรียน',
        'sick': 'ลาป่วย',
        'activity': 'ไปกิจกรรม',
        'home': 'ลากลับบ้าน'
    };
    return statusMap[status] || status;
}

// Clear all students
function clearAllStudents() {
    if (confirm('คุณแน่ใจหรือไม่ที่จะลบข้อมูลนักเรียนทั้งหมด?')) {
        students = [];
        attendanceData = {};
        saveData();
        loadStudents();
        showAlert('ลบข้อมูลนักเรียนทั้งหมดแล้ว', 'success');
    }
}

// Show alert
function showAlert(message, type) {
    const alert = document.getElementById(type + 'Alert');
    alert.textContent = message;
    alert.style.display = 'block';
    
    setTimeout(() => {
        alert.style.display = 'none';
    }, 3000);
}

// Show import help modal
function showImportHelp() {
    document.getElementById('importHelpModal').style.display = 'block';
}

// Close modal
function closeModal(modalId) {
    document.getElementById(modalId).style.display = 'none';
}

// Import from Google Sheets
async function importFromSheets() {
    const spreadsheetId = document.getElementById('spreadsheetId').value.trim();
    const range = document.getElementById('sheetRange').value.trim();
    const classroom = document.getElementById('classSelect').value;

    if (!spreadsheetId || !range || !classroom) {
        showAlert('กรุณากรอก Spreadsheet ID, Range และเลือกตอนเรียน', 'error');
        return;
    }

    // Show loading
    showAlert('กำลังเชื่อมต่อกับ Google Sheets...', 'success');

    try {
        // ในการใช้งานจริง คุณต้องใส่ API Key ของคุณเอง
        const API_KEY = 'YOUR_API_KEY_HERE'; // *** ต้องใส่ API Key จริง ***
        const url = `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${range}?key=${API_KEY}`;

        const response = await fetch(url);
        
        if (!response.ok) {
            throw new Error('ไม่สามารถเชื่อมต่อกับ Google Sheets ได้');
        }

        const data = await response.json();
        
        if (!data.values || data.values.length === 0) {
            showAlert('ไม่พบข้อมูลในช่วงที่ระบุ', 'error');
            return;
        }

        // Process and preview data
        tempImportData = data.values.map(row => ({
            id: row[0] || '',
            name: row[1] || '',
            classroom: row[2] || classroom,
            status: 'present'
        })).filter(student => student.id && student.name);

        showImportPreview(tempImportData);

    } catch (error) {
        console.error('Error importing from Google Sheets:', error);
        
        // ถ้าเกิดข้อผิดพลาด แสดงข้อมูลตัวอย่าง
        showAlert('ไม่สามารถเชื่อมต่อ Google Sheets ได้ในสภาพแวดล้อมนี้', 'error');
        
        // แสดงข้อมูลตัวอย่างเพื่อให้เห็นการทำงาน
        if (spreadsheetId === 'demo') {
            const demoData = [
                { id: '12345', name: 'สมชาย ใจดี', classroom: classroom, status: 'present' },
                { id: '12346', name: 'สมหญิง รักเรียน', classroom: classroom, status: 'present' },
                { id: '12347', name: 'สมศักดิ์ ขยันเรียน', classroom: classroom, status: 'present' },
                { id: '12348', name: 'สมศรี ตั้งใจดี', classroom: classroom, status: 'present' },
                { id: '12349', name: 'สมพร เรียนเก่ง', classroom: classroom, status: 'present' },
                { id: '12350', name: 'สมใจ อ่านหนังสือ', classroom: classroom, status: 'present' },
                { id: '12351', name: 'สมคิด วิเคราะห์ดี', classroom: classroom, status: 'present' },
                { id: '12352', name: 'สมทรง ความรู้', classroom: classroom, status: 'present' },
                { id: '12353', name: 'สมบัติ ขยันทำงาน', classroom: classroom, status: 'present' },
                { id: '12354', name: 'สมหวัง พัฒนาตน', classroom: classroom, status: 'present' }
            ];
            tempImportData = demoData;
            showImportPreview(demoData);
            showAlert('แสดงข้อมูลตัวอย่าง (พิมพ์ "demo" ใน Spreadsheet ID)', 'success');
        }
    }
}

// Show import preview
function showImportPreview(data) {
    const modal = document.getElementById('importPreviewModal');
    const content = document.getElementById('importPreviewContent');
    
    let html = `
        <p>พบข้อมูลนักเรียน ${data.length} คน</p>
        <table class="preview-table">
            <thead>
                <tr>
                    <th>รหัสนักเรียน</th>
                    <th>ชื่อ-นามสกุล</th>
                    <th>ตอนเรียน</th>
                </tr>
            </thead>
            <tbody>
    `;

    data.forEach(student => {
        html += `
            <tr>
                <td>${student.id}</td>
                <td>${student.name}</td>
                <td>${student.classroom}</td>
            </tr>
        `;
    });

    html += `
            </tbody>
        </table>
    `;

    content.innerHTML = html;
    modal.style.display = 'block';
}

// Confirm import
function confirmImport() {
    const classroom = document.getElementById('classSelect').value;
    let imported = 0;
    let skipped = 0;

    tempImportData.forEach(newStudent => {
        // Check if student already exists
        const exists = students.find(s => 
            s.id === newStudent.id && s.classroom === classroom
        );

        if (!exists) {
            students.push({
                ...newStudent,
                classroom: classroom
            });
            imported++;
        } else {
            skipped++;
        }
    });

    saveData();
    loadStudents();
    closeModal('importPreviewModal');
    
    let message = `นำเข้าสำเร็จ ${imported} คน`;
    if (skipped > 0) {
        message += ` (ข้ามที่ซ้ำ ${skipped} คน)`;
    }
    showAlert(message, 'success');
    
    tempImportData = [];
}

// Export to Excel
function exportToExcel() {
    const date = document.getElementById('reportDate').value || new Date().toISOString().split('T')[0];
    
    if (!attendanceData[date]) {
        showAlert('ไม่มีข้อมูลการเช็กชื่อในวันที่เลือก', 'error');
        return;
    }
    
    const records = attendanceData[date];
    
    // เตรียมข้อมูลสำหรับ Excel
    const data = records.map(record => ({
        'วันที่': date,
        'เวลา': record.time,
        'รหัสนักเรียน': record.studentId,
        'ชื่อ-นามสกุล': record.studentName,
        'ตอนเรียน': record.classroom,
        'สถานะ': getStatusText(record.status),
        'ครูผู้เช็ก': record.teacher,
        'ช่วงเวลา': record.timeSlot
    }));
    
    // สร้าง workbook
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'รายงานการเช็กชื่อ');
    
    // กำหนดความกว้างคอลัมน์
    const colWidths = [
        { wch: 12 }, // วันที่
        { wch: 10 }, // เวลา
        { wch: 12 }, // รหัสนักเรียน
        { wch: 25 }, // ชื่อ-นามสกุล
        { wch: 15 }, // ตอนเรียน
        { wch: 12 }, // สถานะ
        { wch: 20 }, // ครูผู้เช็ก
        { wch: 12 }  // ช่วงเวลา
    ];
    ws['!cols'] = colWidths;
    
    // ดาวน์โหลดไฟล์
    const filename = `รายงานการเช็กชื่อ_${date}.xlsx`;
    XLSX.writeFile(wb, filename);
    
    showAlert(`ส่งออกไฟล์ Excel สำเร็จ! 📊`, 'success');
}

// Close modal when clicking outside
window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = 'none';
    }
}