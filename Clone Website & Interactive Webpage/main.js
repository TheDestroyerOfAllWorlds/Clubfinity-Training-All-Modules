let clicked = false

let shuffle = false
let repeat = false

let previousSongPos = null
let currentAudio = null
let currentButton = null

let [searchablePlaylistSongs, searchableReleases] = [[], ["Die With A Smile"]]

const buttons = [
    {imageSource: "images/music.png"},
    {imageSource: "images/new_releases.png"}
]

function performSearch(input) {
    const playlistResults = findBestMatches(searchablePlaylistSongs, input)
    const releaseResults = findBestMatches(searchableReleases, input)
    if (playlistResults.length > 0 && document.getElementById("header").textContent == "Your Playlist") {
        scrollToFirstMatch(playlistResults)
    } else if (releaseResults.length > 0) {
        if (document.getElementById("header").textContent == "New Releases") {
            scrollToFirstMatch(releaseResults)
        } else if (document.getElementById("header").textContent == "Browse All") {
            buttonEvent(document.getElementById("music_selection_id"), "images/new_releases.png")
            scrollToFirstMatch(releaseResults)
        }
    }
}

function scrollToFirstMatch(results) {
    const textNodes = []
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false)
    let node = null
    while ((node = walker.nextNode())) {
        textNodes.push(node)
    }
    for (let result of results) {
        for (let node of textNodes) {
            if (node.textContent.toLowerCase().includes(result.toLowerCase())) {
                node.parentNode.scrollIntoView({ behavior: "smooth", block: "center" })
                return
            }
        }
    }
}

function findBestMatches(arr, input) {
    let results = []
    for (let i = 0; i < arr.length; i++) {
        let score = calculateSimilarity(arr[i], input)
        if (score > 0.3) {
            results.push({ text: arr[i], score: score })
        }
    }
    results.sort((a, b) => b.score - a.score)
    let bestMatches = []
    for (let i = 0; i < results.length; i++) {
        bestMatches.push(results[i].text)
    }
    return bestMatches
}

function calculateSimilarity(str1, str2) {
    const minLength = Math.min(str1.length, str2.length)
    let matches = 0
    for (let i = 0; i < minLength; i++) {
        if (str1[i].toLowerCase() == str2[i].toLowerCase()) {
            matches++
        }
    }
    return matches/Math.max(str1.length, str2.length)
}

function buttonEvent(button, image) {
    document.getElementById("back_id").src = "images/selected_back_arrow.png"
    document.querySelectorAll("button").forEach(btn => {
        if (btn.className == "music_button") {
            btn.remove()
        }
    })
    switch(image) {
        case "images/music.png":
            document.getElementById("header").textContent = "Your Playlist"
            searchablePlaylistSongs = []
            const fileExplorer = document.createElement("div")
            fileExplorer.id = "file_explorer"
            document.documentElement.appendChild(fileExplorer)
            const addButton = document.createElement("button")
            addButton.id = "open_folder"
            addButton.textContent = "Select Playlist Directory"
            addButton.style.fontFamily = "Verdana, Geneva, Tahoma, sans-serif"
            fileExplorer.appendChild(addButton)
            const files = document.createElement("ul")
            files.id = "files"
            fileExplorer.appendChild(files)
            addButton.addEventListener("click", async () => {
            try {
                const dirHandle = await window.showDirectoryPicker()
                files.innerHTML = ""
                for await (const entry of dirHandle.values()) {
                    if (entry.kind == "file" && entry.name.endsWith(".mp3")) {
                        const fileHandle = await dirHandle.getFileHandle(entry.name)
                        const file = await fileHandle.getFile()
                        const audioURL = URL.createObjectURL(file)
                        const audio = new Audio(audioURL)
                        searchablePlaylistSongs.push(entry.name.slice(0, -4))
                        createSong(entry.name.slice(0, -4), "", "images/local_files.png", audio)
                        fileExplorer.remove()
                    }
                }
            } catch (error) {
                console.error("Error:", error)
            }
        })
        break
        case "images/new_releases.png":
            document.getElementById("header").textContent = "New Releases"
            createSong("Die With A Smile", "Bruno Mars, Lady Gaga", "images/die_with_a_smile.png", new Audio("new_releases/die_with_a_smile.mp3"))
        break
    }
}

function createButtons() {
    buttons.forEach(data => {
        const button = document.createElement("button")
        button.className = "music_button"
        button.id = "music_selection_id"
        const image = document.createElement("img")
        image.src = data.imageSource
        image.className = "music_image"
        button.appendChild(image)
        document.getElementById("box_id").appendChild(button)
        button.addEventListener("click",()=> buttonEvent(button, data.imageSource))
    })
}

function createSong(song, artist, src, audio) {
    const songInfo = document.createElement("div")
    songInfo.className = "song_info"
    songInfo.id = "song_info_id"
    
    const songImage = document.createElement("img")
    songImage.className = "song_image"
    songImage.src = src

    const playButton = document.createElement("input")
    playButton.className = "play_song_button"
    playButton.type = "image"
    playButton.src = "images/chosen_song.png"
    playButton.style.position = "absolute"
    playButton.style.width = "50px"
    playButton.style.right = "75px"
    playButton.style.top = "5px"
    playButton.appendChild(audio)
    playButton.addEventListener("click", () => {pauseResume(playButton, audio)})

    const imageWrapper = document.createElement("div")
    imageWrapper.className = "song_wrapper"
    imageWrapper.style.position = "relative"
    imageWrapper.appendChild(songImage)
    imageWrapper.appendChild(playButton)

    const textInfo = document.createElement("div")
    textInfo.className = "text_info"
        
    const songName = document.createElement("div")
    songName.className = "song_name"
    songName.textContent = song
        
    const artistName = document.createElement("div")
    artistName.className = "artist_name"
    artistName.textContent = artist

    songInfo.appendChild(imageWrapper)
    songInfo.appendChild(textInfo)
    textInfo.appendChild(songName)
    textInfo.appendChild(artistName)

    const numberOfSongs = document.getElementById("box_id").children.length - 1
    playButton.id = "play_song_button_id" + numberOfSongs
    songInfo.style.backgroundColor = "transparent"
    songInfo.style.position = "absolute"
    songInfo.style.left = "5%"
    if (numberOfSongs == 1) {
        songInfo.style.top = "-55%"
    } else if (numberOfSongs > 5) {
        if (numberOfSongs > 6) {
            songInfo.style.top = `${parseFloat(previousSongPos) + 15}%`
        } else {
            songInfo.style.top = `${parseFloat(previousSongPos) + 30}%`
        }
        document.getElementById("box_id").style.overflowY = "scroll"
    } else {
        songInfo.style.top = `${parseFloat(previousSongPos) + 30}%`
    }
    previousSongPos = parseFloat(songInfo.style.top)
    document.getElementById("box_id").appendChild(songInfo)
}

function checkPlays() {
    return Array.from(document.querySelectorAll("input")).some(btn =>
        btn.className == "play_song_button" && btn.src.includes("images/chosen_song_2.png")
    )
}

function resetPlays() {
    document.querySelectorAll("input").forEach(btn => {
        if (btn.className == "play_song_button") {
            btn.src = "images/chosen_song.png"
        }
    })
}

function updateProgress(audio) {
    if (audio && !isNaN(audio.duration)) {
        const progressPercent = (audio.currentTime/audio.duration) * 100
        document.getElementById("progress_handler").style.width = `${progressPercent}%`
        const minutes = Math.floor(audio.currentTime/60)
        const seconds = Math.floor(audio.currentTime%60)
        if (seconds < 10) {
            document.getElementById("current_time").textContent = minutes + ":0" + seconds
        } else {
            document.getElementById("current_time").textContent = minutes + ":" + seconds
        }
    }
}

function changeSong(audio) {
    const children = document.getElementById("box_id").children
    const numberOfSongs = children.length - 2
    const randomSong = Math.floor(Math.random() * numberOfSongs) + 2
    if (shuffle) {
        for (let i = 2; i < children.length; i++) {
            if (i == randomSong) {
                if (currentButton.id != children[i].children[0].children[1].id) {
                    audio.removeEventListener("ended", onAudioEnded)
                }
                children[i].children[0].children[1].src = "images/chosen_song.png"
                pauseResume(children[i].children[0].children[1], children[i].children[0].children[1].children[0])
            }
        }
    } else if (repeat) {
        currentButton.src = "images/chosen_song.png"
        pauseResume(currentButton, audio)
    } else {
        audio.removeEventListener("ended", onAudioEnded)
        if (currentButton.id.endsWith(children.length - 2)) {
            pauseResume(children[2].children[0].children[1], children[2].children[0].children[1].children[0])
        } else {
            const nextButton = document.getElementById("box_id").children[parseInt(currentButton.id.slice(-1), 10) + 2]
            pauseResume(nextButton.children[0].children[1], nextButton.children[0].children[1].children[0])
        }
    }
}

function onAudioEnded(event) {
    changeSong(event.target)
}

function pauseResume(pauseButton, audio) {
    const pauseControl = document.getElementById("pause_id")
    if (pauseButton.id == "pause_id") {
        if (currentAudio) {
            if (pauseButton.src.includes("images/pause.png")) {
                pauseButton.src = "images/play.png"
                currentAudio.pause()
            } else {
                pauseButton.src = "images/pause.png"
                currentAudio.play()
            }
        }
        return
    }
    if (pauseButton.src.includes("images/chosen_song.png")) {
        if (currentAudio) {
            currentAudio.pause()
            currentButton.src = "images/chosen_song.png"
            currentAudio.removeEventListener("timeupdate", () => updateProgress(currentAudio))
        }
        if (audio) {
            currentAudio = audio
            currentButton = pauseButton
            audio.currentTime = 0
            if (Math.floor(audio.duration%60) < 10) {
                document.getElementById("duration").textContent = Math.floor(audio.duration/60) + ":0" + Math.floor(audio.duration%60)
            } else {
                document.getElementById("duration").textContent = Math.floor(audio.duration/60) + ":" + Math.floor(audio.duration%60)
            }
            audio.addEventListener("ended", onAudioEnded)
            audio.addEventListener("timeupdate", () => updateProgress(audio))
            audio.play()
        }
        pauseButton.src = "images/chosen_song_2.png"
        pauseControl.src = "images/pause.png"
        const songContainer = pauseButton.parentElement
        const songDetails = songContainer.parentElement
        document.getElementById("current_song_image").src = songContainer.querySelector(".song_image").src
        document.getElementById("current_song_name").textContent = songDetails.querySelector(".song_name").textContent
        document.getElementById("current_artist_name").textContent = songDetails.querySelector(".artist_name").textContent
    } else {
        if (audio) {
            audio.pause()
            audio.currentTime = 0
            audio.removeEventListener("timeupdate", () => updateProgress(audio))
            currentAudio = null
        }
        pauseButton.src = "images/chosen_song.png"
        pauseControl.src = "images/play.png"
        document.getElementById("current_song_image").src = "images/local_files.png"
        document.getElementById("current_song_name").textContent = "..."
        document.getElementById("current_artist_name").textContent = "..."
    }
}

function updateTime(event, audio) {
    const rect = document.getElementById("progress_bar").getBoundingClientRect()
    const clickPosition = event.clientX - rect.left
    audio.currentTime = (clickPosition/rect.width) * audio.duration
    const minutes = Math.floor(audio.currentTime/60)
    const seconds = Math.floor(audio.currentTime%60)
    if (seconds < 10) {
        document.getElementById("current_time").textContent = minutes + ":0" + seconds
    } else {
        document.getElementById("current_time").textContent = minutes + ":" + seconds
    }
    document.getElementById("progress_handler").style.width = `${(clickPosition/rect.width) * 100}%`
}

function skipSong(currentButton, currentAudio, direction) {
    const children = document.getElementById("box_id").children
    let targetButton = null

    if (!currentButton) return

    if (direction == "next") {
        if (parseInt(currentButton.id.slice(-1), 10) == children.length - 2) {
            targetButton = children[2]
        } else {
            targetButton = children[parseInt(currentButton.id.slice(-1), 10) + 2]
        }
    } else if (direction == "previous") {
        if (currentButton.id == children[2].children[0].children[1].id) {
            targetButton = children[children.length - 1]
        } else {
            targetButton = children[parseInt(currentButton.id.slice(-1), 10)]
        }
    }
    if (targetButton) {
        pauseResume(targetButton.children[0].children[1], targetButton.children[0].children[1].children[0])
    }
}

function updateShuffle() {
    if (document.getElementById("shuffle_id").src.includes("images/off_shuffle_play.png")) {
        document.getElementById("shuffle_id").src = "images/on_shuffle_play.png"
        shuffle = true
    } else {
        document.getElementById("shuffle_id").src = "images/off_shuffle_play.png"
        shuffle = false
    }
}

function updateRepeat() {
    if (document.getElementById("repeat_id").src.includes("images/off_repeat.png")) {
        document.getElementById("repeat_id").src = "images/on_repeat.png"
        repeat = true
    } else {
        document.getElementById("repeat_id").src = "images/off_repeat.png"
        repeat = false
    }
}

function updatePage() {
    if (document.getElementById("back_id").src.includes("images/selected_back_arrow.png")) {
        if (currentButton && currentAudio) {
            pauseResume(currentButton, currentAudio)
        }
        if (document.getElementById("file_explorer")) {
            document.getElementById("file_explorer").remove()
        }
        document.querySelectorAll("div").forEach(div => {
            if (div.id == "song_info_id" && document.getElementById("header").textContent != "Your Playlist") {
                div.remove()
            } else if (div.id == "song_info_id") {
                div.remove()
            }
        })
        currentAudio = null
        currentButton = null
        document.getElementById("header").textContent = "Browse All"
        document.getElementById("pause_id").src = "images/play.png"
        document.getElementById("progress_handler").style.width = "0%"
        document.getElementById("current_time").textContent = "0:00"
        document.getElementById("duration").textContent = "0:00"
        document.getElementById("current_song_image").src = "images/local_files.png"
        document.getElementById("current_song_name").textContent = "..."
        document.getElementById("current_artist_name").textContent = "..."
        document.getElementById("back_id").src = "images/default_back_arrow.png"
        createButtons()
    }
}

document.addEventListener("keydown", (event) => {
    if (event.code === "Space" && !(event.target.tagName === "INPUT" || event.target.tagName === "TEXTAREA")) {
        event.preventDefault()
        pauseResume(document.getElementById("pause_id"))
    }
})

document.getElementById("input_box").addEventListener("input", () => {performSearch(document.getElementById("input_box").value)})
document.getElementById("input_box").addEventListener("click", () => {document.getElementById("input_image").src = "images/magnifying_glass_2.png"; clicked = true})
document.getElementById("input_box").addEventListener("blur", () => {document.getElementById("input_image").src = "images/magnifying_glass.png"; clicked = false})
document.getElementById("input_box").addEventListener("mouseover",() => document.getElementById("input_image").src = "images/magnifying_glass_2.png")
document.getElementById("input_box").addEventListener("mouseout", () => {if (!clicked) {document.getElementById("input_image").src = "images/magnifying_glass.png"}})
document.getElementById("pause_id").addEventListener("click", () => {pauseResume(document.getElementById("pause_id"))})
document.getElementById("progress_bar").addEventListener("click", (event) => {updateTime(event, currentAudio)})
document.getElementById("previous_song_id").addEventListener("click", () => {skipSong(currentButton, currentAudio, "previous")})
document.getElementById("skip_id").addEventListener("click", () => {skipSong(currentButton, currentAudio, "next")})
document.getElementById("shuffle_id").addEventListener("click", () => {updateShuffle()})
document.getElementById("repeat_id").addEventListener("click", () => {updateRepeat()})
document.getElementById("back_id").addEventListener("click", () => {updatePage()})
document.addEventListener("DOMContentLoaded", createButtons)