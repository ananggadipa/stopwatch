let startTime;
let updatedTime;
let difference;
let tInterval;
let running = false;
let history = [];

const display = document.getElementById("display");
const historyList = document.getElementById("history");
const noteInput = document.getElementById("noteInput"); // Reference to the note input field
const toggleBtn = document.getElementById("toggleBtn"); // Reference to the toggle button

function startTimer() {
    if (!running) {
        startTime = new Date().getTime() - (difference || 0); // Adjust for any previous difference
        tInterval = setInterval(getShowTime, 1);
        running = true;
        toggleBtn.textContent = "Pause"; // Change button text to "Pause"
    }
}

function stopTimer() {
    clearInterval(tInterval);
    running = false;
    toggleBtn.textContent = "Start"; // Change button text back to "Start"
}

function resetTimer() {
    clearInterval(tInterval);
    running = false;
    difference = 0;
    display.innerHTML = "00:00.00";
    noteInput.value = ""; // Clear the note input when resetting
    toggleBtn.textContent = "Start"; // Reset button text to "Start"
}

function recordTime() {
    const time = display.innerHTML;
    const now = new Date();
    
    // Format the date and time
    const dateTime = now.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false
    }).replace(',', '');

    const note = noteInput.value.trim(); // Get the note from the input field

    // If no new note is provided, use the last note from history if available
    let finalNote = note;
    if (!finalNote && history.length > 0) {
        const lastRecord = history[0]; // Get the most recent record
        const lastNote = lastRecord.split(' ').slice(2).join(' '); // Extract the last note
        finalNote = lastNote; // Use the last note
    }

    // Record the time with the note (or last note if no new note is provided)
    const record = `${dateTime}<br>${time}${finalNote ? ` ${finalNote}` : ''}`;
    history.unshift(record); // Add new record to the beginning of the array
    addHistoryItem(record);
    saveHistory(); // Save history after recording
    noteInput.value = ""; // Clear the note input after recording
}


function addHistoryItem(record) {
    const listItem = document.createElement("li");
    
    // Split the record into date/time, stopwatch time, and note
    const dateTime = record.split('<br>')[0];
    const time = record.split('<br>')[1].split(' ')[0]; // Get the stopwatch time
    const note = record.split(' ').slice(2).join(' ') || ""; // Get the note if it exists

    // Create a span for the date/time
    const dateTimeSpan = document.createElement("span");
    dateTimeSpan.textContent = dateTime;

    // Create a span for the stopwatch time
    const timeSpan = document.createElement("span");
    timeSpan.textContent = time;
    timeSpan.className = "time-result"; // Add a class for styling

    // Create a span for the note
    const noteSpan = document.createElement("span");
    noteSpan.textContent = note ? ` ${note}` : ""; // Include the note without parentheses
    noteSpan.className = "note"; // Add a class for styling

    // Append the spans to the list item
    listItem.appendChild(dateTimeSpan);
    listItem.appendChild(timeSpan); // This is the time result
    listItem.appendChild(noteSpan); // This is the note

    // Create a container for the buttons
    const buttonContainer = document.createElement("div");
    buttonContainer.className = "button-container"; // Add the button container class

    // Create an edit button with an icon and a specific class
    const editBtn = document.createElement("button");
    editBtn.className = "edit-btn"; // Add a class for styling
    editBtn.innerHTML = '<i class="fas fa-edit"></i>'; // Font Awesome edit icon
    editBtn.onclick = function() {
        const newNote = prompt("Edit the note:", note || ""); // Prompt for new note, use last note if empty
        if (newNote !== null) {
            // Update the record with the new note
            const updatedRecord = dateTime + '<br>' + time + (newNote ? ` ${newNote}` : '');
            history[history.indexOf(record)] = updatedRecord; // Update the history array
            listItem.innerHTML = ''; // Clear the list item
            listItem.appendChild(dateTimeSpan);
            listItem.appendChild(timeSpan); // Re-append the time span
            noteSpan.textContent = newNote ? ` ${newNote}` : ""; // Update the note span
            listItem.appendChild(noteSpan); // Re-append the note span
            listItem.appendChild(buttonContainer); // Re-append the button container
            buttonContainer.appendChild(editBtn);
            buttonContainer.appendChild(deleteBtn); // Ensure the delete button is re-added
            
            saveHistory(); // Update local storage
        }
    };

    // Create a delete button with an icon and a specific class
    const deleteBtn = document.createElement("button");
    deleteBtn.className = "delete-btn"; // Add a class for styling
    deleteBtn.innerHTML = '<i class="fas fa-times"></i>'; // Font Awesome delete (X) icon
    deleteBtn.onclick = function() {
        historyList.removeChild(listItem);
        history = history.filter(item => item !== record); // Remove from history array
        saveHistory(); // Update local storage
    };

    buttonContainer.appendChild(editBtn);
    buttonContainer.appendChild(deleteBtn); // Append the delete button
    listItem.appendChild(buttonContainer); // Append the button container to the list item
    historyList.prepend(listItem); // Insert the new item at the beginning of the list
}



function clearAllHistory() {
    // Prompt the user for confirmation
    const confirmClear = window.confirm("Are you sure you want to delete all history?");
    if (confirmClear) {
        history = []; // Clear the history array
        historyList.innerHTML = ""; // Clear the displayed history
        saveHistory(); // Update local storage
    }
}

function getShowTime() {
    updatedTime = new Date().getTime();
    difference = updatedTime - startTime;

    const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((difference % (1000 * 60)) / 1000);
    const milliseconds = Math.floor((difference % 1000));

    display.innerHTML = (minutes < 10 ? "0" + minutes : minutes) + ":" +
                        (seconds < 10 ? "0" + seconds : seconds) + "." +
                        (milliseconds < 100 ? (milliseconds < 10 ? "00" + milliseconds : "0" + milliseconds) : milliseconds);
}

function saveHistory() {
    localStorage.setItem("stopwatchHistory", JSON.stringify(history));
}

function loadHistory() {
    const savedHistory = localStorage.getItem("stopwatchHistory");
    if (savedHistory) {
        history = JSON.parse(savedHistory);
        // Clear the history list before loading
        historyList.innerHTML = ""; 
        // Reverse the history array to display newest first
        history.reverse().forEach(record => {
            addHistoryItem(record);
        });
    }
}

// Function to export history as CSV
function exportToCSV() {
    const csvContent = "data:text/csv;charset=utf-8," 
        + history.map(record => {
            // Replace <br> with a comma and remove HTML tags for CSV
            const cleanRecord = record
                .replace(/<br>/g, ',') // Replace <br> with a comma
                .replace(/<[^>]*>/g, '') // Remove HTML tags
                .replace(/\s+/g, ' ') // Normalize spaces
                .replace(/(\d{2}\/\d{2}\/\d{4}) (\d{2}:\d{2}:\d{2})/, '$1,$2'); // Add a comma after the date
            return cleanRecord;
        }).join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "stopwatch_history.csv");
    document.body.appendChild(link); // Required for Firefox

    link.click(); // This will download the CSV file
    document.body.removeChild(link); // Remove the link after downloading
}

// Load history when the page is loaded
window.onload = loadHistory;

// Keyboard shortcuts without modifiers
document.addEventListener("keydown", function(event) {
    switch (event.key) {
        case '1': // 1 to toggle start/pause
            if (running) {
                stopTimer();
            } else {
                startTimer();
            }
            break;
        case '2': // 2 to record time
            recordTime();
            break;
        case '3': // 3 to reset
            resetTimer();
            break;
        case '4': // 4 to clear all history
            clearAllHistory();
            break;
        case '5': // 5 to export history as CSV
            exportToCSV();
            break;
    }
});

toggleBtn.addEventListener("click", function() {
    if (running) {
        stopTimer();
    } else {
        startTimer();
    }
});

document.getElementById("recordBtn").addEventListener("click", recordTime);
document.getElementById("resetBtn").addEventListener("click", resetTimer);
document.getElementById("clearAllBtn").addEventListener("click", clearAllHistory); // Add event listener for Clear All button
document.getElementById("exportBtn").addEventListener("click", exportToCSV); // Add event listener for Export button
