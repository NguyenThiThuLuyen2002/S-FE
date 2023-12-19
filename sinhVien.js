
const path = require('path');
const fs = require('fs').promises;
const readline = require('readline');

const filePath = path.resolve('./danh-sach.txt');
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

let listStudents = [];
let studentIDCounter = 1;

async function questionAsync(prompt) {
    return new Promise((resolve) => {
        rl.question(prompt, resolve);
    });
}

async function readDataFromFile() {
    try {
        const data = await fs.readFile(filePath, 'utf-8');
        const lines = data.split('\n');
        listStudents = lines.map(line => {
            const [studentID, name, age, className] = line.split(',');
            return { studentID, name, age, className };
        }).filter(student => student.studentID && student.name && student.age && student.className);

        // Find the maximum studentID to set the counter
        const maxStudentID = Math.max(...listStudents.map(student => parseInt(student.studentID, 10)), 0);
        studentIDCounter = maxStudentID + 1;
    } catch (error) {
        console.error('Error reading from file:', error);
    }
}

async function writeDataToFile() {
    try {
        await fs.writeFile(filePath, listStudents.map(x => {
            return x.studentID + ',' + x.name + ',' + x.age + ',' + x.className + '\n';
        }).join(''));
    } catch (error) {
        console.error('Error writing to file:', error);
    }
}

async function askQuestions() {
    const student = {};

    student.studentID = studentIDCounter++;
    console.log('Mã sinh viên mới:', student.studentID);

    student.name = await questionAsync('Tên: ');
    console.log('Bạn đã nhập:', student.name);

    student.age = await questionAsync('Tuổi: ');
    console.log('Bạn đã nhập:', student.age);

    student.className = await questionAsync('Lớp: ');
    console.log('Bạn đã nhập:', student.className);

    listStudents.push(student);

    const answer = await questionAsync('Bạn có muốn tiếp tục không? Nếu có nhập Y, ngược lại nhấn phím bất kỳ để thoát: ');

    return answer.toLowerCase() === 'y';
}

async function displayStudents() {
    console.log('\nDanh sách sinh viên:');
    listStudents.forEach((student, index) => {
        console.log(`${index + 1}. ${student.studentID}, ${student.name}, ${student.age} tuổi, ${student.className}`);
    });
    console.log('\n');
}

async function searchStudent() {
    const searchID = parseInt(await questionAsync('Nhập mã sinh viên cần tìm kiếm: '), 10);
    const foundStudents = listStudents.filter(student => student.studentID === searchID);

    if (foundStudents.length > 0) {
        console.log('Sinh viên được tìm thấy:');
        foundStudents.forEach(student => {
            console.log(`${student.studentID}, ${student.name}, ${student.age} tuổi, ${student.className}`);
        });
    } else {
        console.log('Không tìm thấy sinh viên có mã được nhập.');
    }
}

async function updateStudent() {
    const updateID = parseInt(await questionAsync('Nhập mã sinh viên cần cập nhật: '), 10);
    const foundIndex = listStudents.findIndex(student => student.studentID === updateID);

    if (foundIndex !== -1) {
        const updatedStudent = {};

        updatedStudent.studentID = updateID;

        updatedStudent.name = await questionAsync('Tên mới: ');
        console.log('Bạn đã nhập:', updatedStudent.name);

        updatedStudent.age = await questionAsync('Tuổi mới: ');
        console.log('Bạn đã nhập:', updatedStudent.age);

        updatedStudent.className = await questionAsync('Lớp mới: ');
        console.log('Bạn đã nhập:', updatedStudent.className);

        listStudents[foundIndex] = updatedStudent;
        console.log('Sinh viên đã được cập nhật.');
    } else {
        console.log('Không tìm thấy sinh viên có mã được nhập.');
    }
}

async function deleteStudent() {
    const deleteID = parseInt(await questionAsync('Nhập mã sinh viên cần xóa: '), 10);
    const foundIndex = listStudents.findIndex(student => student.studentID === deleteID);

    if (foundIndex !== -1) {
        listStudents.splice(foundIndex, 1);
        console.log('Sinh viên đã được xóa.');
    } else {
        console.log('Không tìm thấy sinh viên có mã được nhập.');
    }
}

async function main() {
    await readDataFromFile();

    let isContinue = true;

    while (isContinue) {
        console.log('\nChọn hành động:');
        console.log('1. Nhập sinh viên mới');
        console.log('2. Hiển thị danh sách sinh viên');
        console.log('3. Tìm kiếm sinh viên');
        console.log('4. Cập nhật sinh viên');
        console.log('5. Xóa sinh viên');
        console.log('6. Thoát\n');

        const choice = await questionAsync('Nhập lựa chọn của bạn: ');

        switch (choice) {
            case '1':
                isContinue = await askQuestions();
                break;
            case '2':
                await displayStudents();
                break;
            case '3':
                await searchStudent();
                break;
            case '4':
                await updateStudent();
                break;
            case '5':
                await deleteStudent();
                break;
            case '6':
                isContinue = false;
                break;
            default:
                console.log('Lựa chọn không hợp lệ. Hãy chọn lại.');
        }
    }

    rl.close();
    await writeDataToFile();
}

main();

rl.on('close', () => {
    console.log('Đã đóng terminal.');
});

