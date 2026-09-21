const hero = document.querySelector(".hero");
const canvas = document.querySelector("#main-canvas");

const videoLeft = document.querySelector("#video-left");
const videoRight = document.querySelector("#video-right");

const cursor = document.querySelector("#custom-cursor");
const circleSymbol = document.querySelector("#circle-symbol");

const outroInfo = document.querySelector("#outro-info");
const outroButton = document.querySelector("#outro-buy");

const isTouchDevice = window.matchMedia(
	"(hover: none), (pointer: coarse)",
).matches;

const videos = [videoLeft, videoRight];

let activeVideo = videoLeft;
let lastActiveVideo = videoLeft;

let firstVideoReady = false;
let secondVideoStartedLoading = false;

let mouseX = window.innerWidth / 2;
let rafId = null;

const symbols = ["8", "$", "^^", "%", "/"];

let lastScrollTime = 0;

videos.forEach((video) => {
	video.muted = true;
	video.playsInline = true;

	video.setAttribute("muted", "");
	video.setAttribute("playsinline", "");

	// Загружаем видео заранее для корректной работы в Safari
	video.preload = "auto";
});

function showVideo(video) {
	if (!video) {
		return;
	}

	videos.forEach((item) => {
		item.classList.remove("is-active");
	});

	video.classList.add("is-active");

	activeVideo = video;
	lastActiveVideo = video;
}

function startSecondVideoLoading() {
	if (secondVideoStartedLoading) {
		return;
	}

	secondVideoStartedLoading = true;

	videoRight.preload = "auto";
	videoRight.load();
}

function handleFirstVideoReady() {
	if (firstVideoReady) {
		return;
	}

	firstVideoReady = true;

	showVideo(videoLeft);

	canvas.classList.add("is-loaded");

	videoLeft.currentTime = 0;

	if (!isTouchDevice) {
		startSecondVideoLoading();
	}
}

videoLeft.addEventListener("loadeddata", handleFirstVideoReady);

videoLeft.addEventListener("canplay", handleFirstVideoReady);

setTimeout(() => {
	if (!firstVideoReady && videoLeft.readyState >= 2) {
		handleFirstVideoReady();
	}
}, 1500);

function updateMousePosition(event) {
	mouseX = event.clientX;

	if (!cursor) {
		return;
	}

	cursor.style.left = `${event.clientX}px`;
	cursor.style.top = `${event.clientY}px`;

	cursor.classList.add("is-visible");
}

if (!isTouchDevice) {
	window.addEventListener("mousemove", updateMousePosition);
}

function updateVideoTime() {
	rafId = null;

	if (isTouchDevice || !firstVideoReady) {
		return;
	}

	const width = window.innerWidth;
	const center = width / 2;

	const deadZone = Math.max(30, width * 0.05);

	const distance = mouseX - center;

	if (Math.abs(distance) <= deadZone) {
		videoLeft.currentTime = 0;
		videoRight.currentTime = 0;

		showVideo(lastActiveVideo);

		return;
	}

	let targetVideo;
	let progress;

	if (distance < -deadZone) {
		targetVideo = videoRight;

		progress = (Math.abs(distance) - deadZone) / (center - deadZone);
	} else {
		targetVideo = videoLeft;

		progress = (distance - deadZone) / (center - deadZone);
	}

	progress = Math.max(0, Math.min(1, progress));

	if (targetVideo.readyState >= 2 && Number.isFinite(targetVideo.duration)) {
		showVideo(targetVideo);

		if (!targetVideo.seeking) {
			targetVideo.currentTime = progress * targetVideo.duration;
		}
	}
}

function requestVideoUpdate() {
	if (rafId !== null) {
		return;
	}

	rafId = requestAnimationFrame(updateVideoTime);
}

if (!isTouchDevice) {
	window.addEventListener("mousemove", requestVideoUpdate);
}

async function playMobileVideo(video) {
	try {
		await video.play();
	} catch (error) {
		console.warn("Autoplay blocked:", error);
	}
}

function startMobileSequence() {
	showVideo(videoLeft);

	videoLeft.preload = "auto";
	videoRight.preload = "auto";

	videoLeft.load();
	videoRight.load();

	playMobileVideo(videoLeft);

	videoLeft.addEventListener(
		"ended",
		() => {
			showVideo(videoRight);
			playMobileVideo(videoRight);
		},
		{ once: true },
	);

	videoRight.addEventListener(
		"ended",
		() => {
			showVideo(videoLeft);
			playMobileVideo(videoLeft);
		},
		{ once: true },
	);
}

if (isTouchDevice) {
	if (videoLeft.readyState >= 2) {
		startMobileSequence();
	} else {
		videoLeft.addEventListener("loadeddata", startMobileSequence, {
			once: true,
		});
	}
}

function updateHeroUI() {
	const scrollY = window.scrollY;

	const isScrolled = scrollY > 20;

	if (outroInfo) {
		outroInfo.classList.toggle("is-hidden", isScrolled);
	}

	if (outroButton) {
		outroButton.classList.toggle("is-hidden", isScrolled);
	}

	const caption = document.querySelector(".hero__caption");

	if (caption) {
		caption.classList.toggle("is-hidden", isScrolled);
	}

	if (cursor) {
		cursor.classList.toggle("is-hidden", isScrolled);
	}

	if (circleSymbol) {
		const now = performance.now();

		if (now - lastScrollTime > 80) {
			const randomIndex = Math.floor(Math.random() * symbols.length);

			circleSymbol.textContent = symbols[randomIndex];

			lastScrollTime = now;
		}
	}
}

window.addEventListener("scroll", updateHeroUI, { passive: true });

window.addEventListener("resize", () => {
	mouseX = window.innerWidth / 2;

	requestVideoUpdate();
});

showVideo(videoLeft);
updateHeroUI();
