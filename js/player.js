// player.js

export function playMusic(mainAudio, playIcon, progressBar, showNotification, updatePlayingState) {
    mainAudio.play()
        .then(() => {
            playIcon.textContent = "pause";
            updatePlayingState();
            showNotification("Playback started");
            progressBar.classList.add('pulse-active');
        })
        .catch(error => {
            console.error("Playback failed:", error);
            showNotification("Playback failed: " + error.message);
        });
}

export function pauseMusic(mainAudio, playIcon, progressBar, updatePlayingState, showNotification) {
    mainAudio.pause();
    playIcon.textContent = "play_arrow";
    updatePlayingState();
    showNotification("Playback paused");
    progressBar.classList.remove('pulse-active');
}

export function nextTrack(allMusic, currentTrackIndex, loadTrack, playMusic) {
    if (allMusic.length === 0) return;
    currentTrackIndex = (currentTrackIndex + 1) % allMusic.length;
    loadTrack(currentTrackIndex);
    playMusic();
    return currentTrackIndex;
}

export function prevTrack(allMusic, currentTrackIndex, loadTrack, playMusic) {
    if (allMusic.length === 0) return;
    currentTrackIndex = (currentTrackIndex - 1 + allMusic.length) % allMusic.length;
    loadTrack(currentTrackIndex);
    playMusic();
    return currentTrackIndex;
}

export function seekAudio(mainAudio, seconds, showNotification) {
    mainAudio.currentTime += seconds;
    showNotification(`Seeked ${seconds > 0 ? 'forward' : 'backward'} ${Math.abs(seconds)} seconds`);
}

export function updateProgress(mainAudio, progressBar, currentTimeEl, maxDurationEl, formatTime) {
    const currentTime = mainAudio.currentTime;
    const duration = mainAudio.duration;

    if (duration) {
        const progressPercent = (currentTime / duration) * 100;
        progressBar.style.width = `${progressPercent}%`;
        currentTimeEl.textContent = formatTime(currentTime);
        maxDurationEl.textContent = formatTime(duration);
    }
}


// Other playback-related functions
