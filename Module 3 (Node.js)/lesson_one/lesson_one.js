console.log("node js runs on the terminal window")

const os = require("os") // operating system
const path = require("path") // alternative to os where you can locate directories and files

const math = require("./math")
console.log(math.add(2, 3))

/*
console.log(os.type()) // Windows 11
console.log(os.version()) // 
console.log(os.homedir()) // 

console.log(__dirname) // Module 3 (Node.js)/lesson_one
console.log(__filename) // Module 3 (Node.js)/lesson_one/lesson_one.js 
console.log(path.basename(__filename)) // lesson_one.js
console.log(path.extname(__filename)) // .js

console.log(path.parse(__filename)) // displays all the attributes of the file
*/