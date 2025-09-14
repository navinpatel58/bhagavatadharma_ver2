import {
  playMusic,
  pauseMusic,
  nextTrack,
  prevTrack,
  seekAudio,
  updateProgress
} from './player.js';

import { showNotification } from './ui.js';
import { loadCalendar, handleCalendarClick } from './calendar.js';
import { fetchAudioData } from './api.js';



// Example: wire up play/pause button
const playPauseBtn = document.getElementById('playPauseBtn');
const mainAudio = document.getElementById('mainAudio');
const playIcon = document.getElementById('playIcon');
const progressBar = document.getElementById('progressBar');
const currentTimeEl = document.getElementById('currentTime');
const maxDurationEl = document.getElementById('maxDuration');
const musicListEl = document.querySelector(".music-list ul");
const calendarContainer = document.querySelector(".calendar-grid");
const calendarTrackInfo = document.querySelector(".calendar-track-info");
const calendarTrackList = document.querySelector(".calendar-track-list");
const savedIndex = localStorage.getItem("lastTrackIndex");
const savedTime = localStorage.getItem("lastTrackTime");

if (savedIndex !== null && savedTime !== null) {
  showResumePrompt(parseInt(savedIndex), parseFloat(savedTime));
}


// Dummy functions for now (replace with real ones)
// function showNotification(msg) { console.log(msg); }
function updatePlayingState() {
  document.querySelectorAll(".music-list li").forEach(li => li.classList.remove("playing"));
  document.querySelector(`.music-list li[data-index="${currentTrackIndex}"]`)?.classList.add("playing");
  const statusEl = document.querySelector(".player-status");
  statusEl.textContent = mainAudio.paused ? "Paused" : "Playing";
}



// Wire up play/pause
playPauseBtn.addEventListener("click", () => {
  if (mainAudio.paused) {
    playMusic(mainAudio, playIcon, progressBar, showNotification, updatePlayingState);
  } else {
    pauseMusic(mainAudio, playIcon, progressBar, updatePlayingState, showNotification);
    localStorage.setItem("lastTrackIndex", currentTrackIndex);
    localStorage.setItem("lastTrackTime", mainAudio.currentTime);

  }
});

// Update progress bar
mainAudio.addEventListener("timeupdate", () => {
  updateProgress(mainAudio, progressBar, currentTimeEl, maxDurationEl, formatTime);
});

function formatTime(seconds) {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60).toString().padStart(2, '0');
  return `${mins}:${secs}`;
}


//Initialize calendar
document.addEventListener("DOMContentLoaded", () => {
  loadCalendar();
});
document.getElementById('calendar').addEventListener('click', handleCalendarClick);

// Fetch audio data on load
fetchAudioData()
  .then(data => {
    console.log("Audio data loaded:", data);
    // You can pass this to your playlist renderer
  })
  .catch(error => {
    showNotification("Failed to load audio data");
    console.error(error);
  });

  //Render Playlist Function
function renderPlaylist(tracks) {
  musicListEl.innerHTML = ""; // Clear existing

  tracks.forEach((track, index) => {
    const li = document.createElement("li");
    li.classList.add("track-item");
    li.dataset.index = index;

    li.innerHTML = `
      <span class="track-name">${track.title}</span>
      <span class="audio-duration">${track.duration || "00:00"}</span>
    `;

    li.addEventListener("click", () => {
      loadTrack(index);
      playMusic(mainAudio, playIcon, progressBar, showNotification, updatePlayingState);
    });

    musicListEl.appendChild(li);
  });
}

//Load Track Function
function loadTrack(index) {
  const track = allTracks[index];
  mainAudio.src = track.src;
  document.querySelector(".thumbnail").src = track.thumbnail || "assets/default.jpg";
  document.querySelector(".track-name").textContent = track.title;
  document.querySelectorAll(".music-list li").forEach(li => li.classList.remove("playing"));
  document.querySelector(`.music-list li[data-index="${index}"]`)?.classList.add("playing");
  document.querySelector(".track-details").textContent = track.artist || "Unknown";
  currentTrackIndex = index;
}


//Fetch & Render on Load
let allTracks = [];
let currentTrackIndex = 0;

fetchAudioData()
  .then(data => {
    allTracks = data;
    renderPlaylist(allTracks);
    loadTrack(currentTrackIndex);
  })
  .catch(error => {
    showNotification("Failed to load playlist");
    console.error(error);
  });



  // Clendar clicks
  calendarContainer.addEventListener("click", (e) => {
  const dayEl = e.target.closest(".calendar-day.has-recording");
  if (!dayEl) return;

  const recordings = JSON.parse(dayEl.dataset.recordings || "[]");
  showCalendarTracks(recordings);
  highlightSelectedDay(dayEl);
});


//Show Track Info
function showCalendarTracks(tracks) {
  calendarTrackList.innerHTML = "";
  calendarTrackInfo.classList.add("show");

  tracks.forEach((track, index) => {
    const item = document.createElement("div");
    item.classList.add("calendar-track-item");

    item.innerHTML = `
      <div class="track-info-calendar">
        <span>${track.title}</span>
        <span class="track-play-instruction">Click to play</span>
      </div>
      <span class="audio-duration">${track.duration || "00:00"}</span>
    `;

    item.addEventListener("click", () => {
      const globalIndex = allTracks.findIndex(t => t.src === track.src);
      if (globalIndex !== -1) {
        loadTrack(globalIndex);
        playMusic(mainAudio, playIcon, progressBar, showNotification, updatePlayingState);
      }
    });

    calendarTrackList.appendChild(item);
  });
}


// Highlight Selected Day
function highlightSelectedDay(selectedEl) {
  document.querySelectorAll(".calendar-day.has-recording").forEach(el => {
    el.classList.remove("selected");
  });
  selectedEl.classList.add("selected");
}

// Hide info on Close
document.getElementById("close-calendar").addEventListener("click", () => {
  calendarTrackInfo.classList.remove("show");
});

// Update showResumePrompt() Function

    function showResumePrompt(index, time) {
        const overlay = document.querySelector(".overlay");
        const prompt = document.querySelector(".resume-prompt");

        const formattedTime = formatTime(time);
        prompt.querySelector("p").textContent = `Resume from ${formattedTime}?`;

        prompt.classList.add("show");
        overlay.classList.add("show");

        prompt.querySelector(".resume-yes").addEventListener("click", () => {
            loadTrack(index);
            mainAudio.currentTime = time;
            playMusic(mainAudio, playIcon, progressBar, showNotification, updatePlayingState);

            localStorage.removeItem("lastTrackIndex");
            localStorage.removeItem("lastTrackTime");

            hideResumePrompt();
        });

        prompt.querySelector(".resume-no").addEventListener("click", () => {
            hideResumePrompt();
        });
    }



function hideResumePrompt() {
  document.querySelector(".resume-prompt").classList.remove("show");
  document.querySelector(".overlay").classList.remove("show");
}



