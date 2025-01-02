const fs = require("fs") // file system
const fsPromises = require("fs").promises

const path = require("path")

const fileOps = async () => {
    try {
        const data = await fsPromises.readFile(path.join(__dirname, "starter.txt"), "utf8")
        await fsPromises.writeFile(path.join(__dirname, "starter.txt"), "Hello World Again")
        const readDataAgain = await fsPromises.readFile(path.join(__dirname, "starter.txt"), "utf8")
        console.log(data) // prints Hello World
        console.log(readDataAgain) // prints Hello World Again
        // await fsPromises.unlink() deletes a file
    } catch (err) {
        console.error(err)
    }
}

if (!fs.existsSync("./lesson_three")) {
    fs.mkdir("./lesson_three", (err) => { // creates directory (fs.rmdir deletes directory)
        if (err) throw err
    })
}

/*
fs.readFile("./lesson_two/starter.txt", "utf8", (err, data) => {
    if (err) throw err
    console.log(data) // reads the text file as a string and prints it
})

console.log("Hello...") // this will be printed first, then writeFile, then appendFile, then rename, and lastly readFile

fs.writeFile(path.join(__dirname, "starter.txt"), "Hello World Again", (err) => {
    if (err) throw err
    fs.appendFile(path.join(__dirname, "test.txt"), "Testing Text", (err) => {
        if (err) throw err
        console.log("Append Complete") // If the appended file already exists, it will just append Texting Text in it
        fs.rename(path.join(__dirname, "test.txt"), path.join(__dirname, "newTest.txt"), (err) => {
            if (err) throw err
            console.log("Rename Complete")
        })
    })
})
*/