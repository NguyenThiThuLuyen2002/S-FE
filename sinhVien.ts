import * as path from 'path';
import * as fs from 'fs/promises';
import * as readline from 'readline';

interface Student {
    studentID: number;
    name: string;
    age: string;
    className: string;
}

class StudentManagementSystem {
    private filePath: string;
    private rl: readline.Interface;
    private listStudents: Student[] = [];
    private studentIDCounter: number = 1;

    constructor(filePath: string) {
        this.filePath = path.resolve(filePath);
        this.rl = readline.createInterface({
            input: process.stdin,
            output: process.stdout
        });
    }

    private async questionAsync(prompt: string): Promise<string> {
        return new Promise<string>((resolve) => {
            this.rl.question(prompt, resolve);
        });
    }

    private async readDataFromFile(): Promise<void> {
        try {
            const data = await fs.readFile(this.filePath, 'utf-8');
            const lines = data.split('\n');
            this.listStudents = lines
                .map(line => {
                    const [studentID, name, age, className] = line.split(',');
                    return { studentID: parseInt(studentID), name, age, className } as Student;
                })
                .filter(student => student.studentID && student.name && student.age && student.className);

            const maxStudentID = Math.max(...this.listStudents.map(student => student.studentID), 0);
            this.studentIDCounter = maxStudentID + 1;
        } catch (error) {
            console.error('Error reading from file:', error.message);
        }
    }

    private async writeDataToFile(): Promise<void> {
        try {
            await fs.writeFile(this.filePath, this.listStudents.map(x =>
                `${x.studentID},${x.name},${x.age},${x.className}\n`
            ).join(''));
        } catch (error) {
            console.error('Error writing to file:', error.message);
        }
    }

    private async askQuestions(): Promise<boolean> {
        const student: Student = {
            studentID: this.studentIDCounter++,
            name: '',
            age: '',
            className: ''
        };

        console.log('Mã sinh viên mới:', student.studentID);

        student.name = await this.questionAsync('Tên: ');
        console.log('Bạn đã nhập:', student.name);

        student.age = await this.questionAsync('Tuổi: ');
        console.log('Bạn đã nhập:', student.age);

        student.className = await this.questionAsync('Lớp: ');
        console.log('Bạn đã nhập:', student.className);

        this.listStudents.push(student);

        const answer = await this.questionAsync('Bạn có muốn tiếp tục không? Nếu có nhập Y, ngược lại nhấn phím bất kỳ để thoát: ');

        return answer.toLowerCase() === 'y';
    }

    private async displayStudents(): Promise<void> {
        console.log('\nDanh sách sinh viên:');
        this.listStudents.forEach((student, index) => {
            console.log(`${index + 1}. ${student.studentID}, ${student.name}, ${student.age} tuổi, ${student.className}`);
        });
        console.log('\n');
    }

    private async searchStudent(): Promise<void> {
        const searchID = parseInt(await this.questionAsync('Nhập mã sinh viên cần tìm kiếm: '), 10);
        const foundStudents = this.listStudents.filter(student => student.studentID === searchID);

        if (foundStudents.length > 0) {
            console.log('Sinh viên được tìm thấy:');
            foundStudents.forEach(student => {
                console.log(`${student.studentID}, ${student.name}, ${student.age} tuổi, ${student.className}`);
            });
        } else {
            console.log('Không tìm thấy sinh viên có mã được nhập.');
        }
    }

    private async updateStudent(): Promise<void> {
        const updateID = parseInt(await this.questionAsync('Nhập mã sinh viên cần cập nhật: '), 10);
        const foundIndex = this.listStudents.findIndex(student => student.studentID === updateID);

        if (foundIndex !== -1) {
            const updatedStudent: Student = {
                studentID: updateID,
                name: '',
                age: '',
                className: ''
            };

            updatedStudent.name = await this.questionAsync('Tên mới: ');
            console.log('Bạn đã nhập:', updatedStudent.name);

            updatedStudent.age = await this.questionAsync('Tuổi mới: ');
            console.log('Bạn đã nhập:', updatedStudent.age);

            updatedStudent.className = await this.questionAsync('Lớp mới: ');
            console.log('Bạn đã nhập:', updatedStudent.className);

            this.listStudents[foundIndex] = updatedStudent;
            console.log('Sinh viên đã được cập nhật.');
        } else {
            console.log('Không tìm thấy sinh viên có mã được nhập.');
        }
    }

    private async deleteStudent(): Promise<void> {
        const deleteID = parseInt(await this.questionAsync('Nhập mã sinh viên cần xóa: '), 10);
        const foundIndex = this.listStudents.findIndex(student => student.studentID === deleteID);

        if (foundIndex !== -1) {
            this.listStudents.splice(foundIndex, 1);
            console.log('Sinh viên đã được xóa.');
        } else {
            console.log('Không tìm thấy sinh viên có mã được nhập.');
        }
    }

    public async start(): Promise<void> {
        await this.readDataFromFile();

        let isContinue = true;

        while (isContinue) {
            console.log('\nChọn hành động:');
            console.log('1. Nhập sinh viên mới');
            console.log('2. Hiển thị danh sách sinh viên');
            console.log('3. Tìm kiếm sinh viên');
            console.log('4. Cập nhật sinh viên');
            console.log('5. Xóa sinh viên');
            console.log('6. Thoát\n');

            const choice = await this.questionAsync('Nhập lựa chọn của bạn: ');

            switch (choice) {
                case '1':
                    isContinue = await this.askQuestions();
                    break;
                case '2':
                    await this.displayStudents();
                    break;
                case '3':
                    await this.searchStudent();
                    break;
                case '4':
                    await this.updateStudent();
                    break;
                case '5':
                    await this.deleteStudent();
                    break;
                case '6':
                    isContinue = false;
                    break;
                default:
                    console.log('Lựa chọn không hợp lệ. Hãy chọn lại.');
            }
        }

        this.rl.close();
        await this.writeDataToFile();
        console.log('Đã đóng terminal.');
    }
}

const filePath = './danh-sach.txt';
const studentManagementSystem = new StudentManagementSystem(filePath);
studentManagementSystem.start();
