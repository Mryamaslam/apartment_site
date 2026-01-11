// Index page specific scripts

// Price estimation for contact form
document.addEventListener('DOMContentLoaded', function() {
    const apartmentSelect = document.getElementById('apartmentSelect');
    const priceAlert = document.getElementById('priceAlert');
    const priceValue = document.getElementById('priceValue');

    if(apartmentSelect && priceAlert && priceValue) {
        apartmentSelect.addEventListener('change', function() {
            const val = this.value;
            let price = "";
            if(val === 'Studio') price = "PKR 775,000 (Booking)";
            else if(val === '1Bed') price = "Call for Price";
            else if(val === '2Bed') price = "Call for Price";
            else if(val === '3Bed') price = "Call for Price";
            
            if(price) {
                priceValue.textContent = price;
                priceAlert.classList.remove('d-none');
            }
        });
    }

    // Hero Video Logic
    const leftVideo = document.getElementById('hero-video-left');
    const rightVideo = document.getElementById('hero-video-right');

    if (leftVideo || rightVideo) {
        // Video Playlists
        const leftPlaylist = ['assets/images/ved_1.mp4', 'assets/images/ved_02.mp4'];
        const rightPlaylist = ['assets/images/ved_03.mp4', 'assets/images/ved_04.mp4'];

        let leftIndex = 0;
        let rightIndex = 0;

        function playNextVideo(videoElement, playlist, currentIndex) {
            const nextIndex = (currentIndex + 1) % playlist.length;
            videoElement.src = playlist[nextIndex];
            videoElement.play().catch(e => console.log("Auto-play prevented:", e));
            return nextIndex;
        }

        // Initialize Left Video
        if (leftVideo) {
            leftVideo.src = leftPlaylist[0];
            leftVideo.play().catch(e => console.log("Auto-play prevented:", e));
            
            leftVideo.onended = function() {
                leftIndex = playNextVideo(leftVideo, leftPlaylist, leftIndex);
            };
        }

        // Initialize Right Video
        if (rightVideo) {
            rightVideo.src = rightPlaylist[0];
            rightVideo.play().catch(e => console.log("Auto-play prevented:", e));
            
            rightVideo.onended = function() {
                rightIndex = playNextVideo(rightVideo, rightPlaylist, rightIndex);
            };
        }
    }
});

