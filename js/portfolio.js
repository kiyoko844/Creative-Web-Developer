document.addEventListener("DOMContentLoaded", () => {
	const items = [...document.querySelectorAll(".work-item")];

	const preview = document.querySelector(".work-preview");
	const previewImage = document.getElementById("work-preview-image");
	const previewNumber = document.getElementById("work-preview-number");
	const previewName = document.getElementById("work-preview-name");
	const previewCurrent = document.getElementById("work-preview-current");
	const previewTotal = document.getElementById("work-preview-total");

	const modal = document.querySelector(".project-modal");
	const modalBackdrop = document.querySelector(".project-modal__backdrop");
	const modalWindow = document.querySelector(".project-modal__window");
	const modalClose = document.querySelector(".project-modal__close");

	const modalImage = document.getElementById("project-modal-image");
	const modalImageCounter = document.querySelector(
		".project-modal__image-index",
	);
	const modalProjectCounter = document.querySelector(".project-modal__counter");
	const modalTitle = document.querySelector(".project-modal__title");
	const modalType = document.querySelector(".project-modal__type");
	const modalYear = document.querySelector(".project-modal__year");

	const modalPrevImage = document.querySelector(".project-modal__arrow--prev");

	const modalNextImage = document.querySelector(".project-modal__arrow--next");

	const thumbs = [...document.querySelectorAll(".project-thumb")];

	const prevProject = document.querySelector(".project-modal__prev");

	const nextProject = document.querySelector(".project-modal__next");

	const progress = document.querySelector(".project-modal__progress span");

	if (!items.length) return;

	const projects = items.map((item, index) => {
		const images = (item.dataset.images || "")
			.split("|")
			.map((image) => image.trim())
			.filter(Boolean);

		return {
			index,

			number: item.dataset.number || String(index + 1).padStart(2, "0"),

			name:
				item.dataset.name ||
				item.querySelector(".work-item__project")?.textContent.trim() ||
				"",

			type:
				item.dataset.type ||
				item.querySelector(".work-item__type")?.textContent.trim() ||
				"",

			year:
				item.dataset.year ||
				item.querySelector(".work-item__year")?.textContent.trim() ||
				"",

			images,
		};
	});

	let activeProjectIndex = 0;
	let activePreviewProject = null;

	let previewImageIndex = 0;
	let modalImageIndex = 0;

	let mouseX = window.innerWidth / 2;
	let mouseY = window.innerHeight / 2;

	let previewX = mouseX;
	let previewY = mouseY;

	let touchStartX = 0;
	let touchStartY = 0;

	/*
    =========================================================
    FLOATING PREVIEW POSITION
    =========================================================
    */

	document.addEventListener("mousemove", (event) => {
		mouseX = event.clientX;
		mouseY = event.clientY;
	});

	function animatePreview() {
		previewX += (mouseX - previewX) * 0.12;
		previewY += (mouseY - previewY) * 0.12;

		document.documentElement.style.setProperty("--preview-x", `${previewX}px`);

		document.documentElement.style.setProperty("--preview-y", `${previewY}px`);

		requestAnimationFrame(animatePreview);
	}

	animatePreview();

	/*
    =========================================================
    FLOATING PREVIEW IMAGE
    =========================================================
    */

	function updatePreviewImage() {
		if (!activePreviewProject) return;

		const images = activePreviewProject.images;

		if (!images.length) return;

		const source = images[previewImageIndex];

		previewImage.style.opacity = "0";

		const loader = new Image();

		loader.src = source;

		loader.onload = () => {
			previewImage.src = source;
			previewImage.alt = activePreviewProject.name;

			if (previewCurrent) {
				previewCurrent.textContent = String(previewImageIndex + 1).padStart(
					2,
					"0",
				);
			}

			if (previewTotal) {
				previewTotal.textContent = String(images.length).padStart(2, "0");
			}

			previewImage.style.opacity = "1";
		};

		loader.onerror = () => {
			previewImage.src = source;
			previewImage.alt = activePreviewProject.name;
			previewImage.style.opacity = "1";
		};
	}

	function showPreview(project) {
		if (window.innerWidth <= 800) return;
		if (!project.images.length) return;

		activePreviewProject = project;
		previewImageIndex = 0;

		previewNumber.textContent = project.number;
		previewName.textContent = project.name;

		updatePreviewImage();

		preview.classList.add("is-visible");
	}

	function hidePreview() {
		preview.classList.remove("is-visible");
	}

	/*
    =========================================================
    ACTIVE PROJECT
    =========================================================
    */

	function setActiveProject(index) {
		activeProjectIndex = index;

		items.forEach((item, itemIndex) => {
			item.classList.toggle("is-active", itemIndex === index);
		});

		const project = projects[index];

		if (!project) return;

		const currentNumber = document.querySelector(
			".work-sidebar__current-number",
		);

		const currentName = document.querySelector(".work-sidebar__current-name");

		if (currentNumber) {
			currentNumber.textContent = project.number;
		}

		if (currentName) {
			currentName.textContent = project.name;
		}
	}

	/*
    =========================================================
    PRELOAD IMAGES
    =========================================================
    */

	projects.forEach((project) => {
		project.images.forEach((source) => {
			const image = new Image();
			image.src = source;
		});
	});

	/*
    =========================================================
    MODAL IMAGE
    =========================================================
    */

	function updateModalImage() {
		const project = projects[activeProjectIndex];

		if (!project || !project.images.length) return;

		const source = project.images[modalImageIndex];

		modalImage.style.opacity = "0";

		const loader = new Image();

		loader.src = source;

		loader.onload = () => {
			modalImage.src = source;
			modalImage.alt = project.name;
			modalImage.style.opacity = "1";
		};

		loader.onerror = () => {
			modalImage.src = source;
			modalImage.alt = project.name;
			modalImage.style.opacity = "1";
		};

		if (modalImageCounter) {
			modalImageCounter.textContent = `${String(modalImageIndex + 1).padStart(
				2,
				"0",
			)} / ${String(project.images.length).padStart(2, "0")}`;
		}

		thumbs.forEach((thumb, index) => {
			thumb.classList.toggle("is-active", index === modalImageIndex);
		});
	}

	/*
    =========================================================
    MODAL CONTENT
    =========================================================
    */

	function updateModalContent() {
		const project = projects[activeProjectIndex];

		if (!project) return;

		if (modalProjectCounter) {
			modalProjectCounter.textContent = `${project.number} / ${String(
				projects.length,
			).padStart(2, "0")}`;
		}

		if (modalTitle) {
			modalTitle.textContent = project.name;
		}

		if (modalType) {
			modalType.textContent = project.type;
		}

		if (modalYear) {
			modalYear.textContent = project.year;
		}

		thumbs.forEach((thumb, index) => {
			const image = thumb.querySelector("img");

			if (!image) return;

			if (project.images[index]) {
				image.src = project.images[index];

				image.alt = `${project.name} — image ${index + 1}`;

				thumb.style.visibility = "visible";
			} else {
				thumb.style.visibility = "hidden";
			}
		});

		if (progress) {
			const progressValue = ((activeProjectIndex + 1) / projects.length) * 100;

			progress.style.width = `${progressValue}%`;
		}

		updateModalImage();
	}

	/*
    =========================================================
    OPEN MODAL
    =========================================================
    */

	function openModal(index) {
		activeProjectIndex = index;
		modalImageIndex = 0;

		setActiveProject(index);
		updateModalContent();

		modal.classList.add("is-open");
		modal.setAttribute("aria-hidden", "false");

		document.body.classList.add("modal-open");

		hidePreview();
	}

	/*
    =========================================================
    CLOSE MODAL
    =========================================================
    */

	function closeModal() {
		modal.classList.remove("is-open");
		modal.setAttribute("aria-hidden", "true");

		document.body.classList.remove("modal-open");
	}

	/*
    =========================================================
    CHANGE MODAL IMAGE
    =========================================================
    */

	function changeModalImage(direction) {
		const project = projects[activeProjectIndex];

		if (!project || project.images.length <= 1) {
			return;
		}

		modalImageIndex += direction;

		if (modalImageIndex < 0) {
			modalImageIndex = project.images.length - 1;
		}

		if (modalImageIndex >= project.images.length) {
			modalImageIndex = 0;
		}

		updateModalImage();
	}

	/*
    =========================================================
    CHANGE PROJECT
    =========================================================
    */

	function changeProject(direction) {
		activeProjectIndex += direction;

		if (activeProjectIndex < 0) {
			activeProjectIndex = projects.length - 1;
		}

		if (activeProjectIndex >= projects.length) {
			activeProjectIndex = 0;
		}

		modalImageIndex = 0;

		setActiveProject(activeProjectIndex);
		updateModalContent();
	}

	/*
    =========================================================
    PROJECT ROWS
    =========================================================
    */

	items.forEach((item, index) => {
		item.addEventListener("mouseenter", () => {
			setActiveProject(index);
			showPreview(projects[index]);
		});

		item.addEventListener("mouseleave", () => {
			hidePreview();
		});

		item.addEventListener("click", () => {
			openModal(index);
		});
	});

	/*
    =========================================================
    MODAL CLOSE
    =========================================================
    */

	if (modalClose) {
		modalClose.addEventListener("click", closeModal);
	}

	if (modalBackdrop) {
		modalBackdrop.addEventListener("click", closeModal);
	}

	if (modalWindow) {
		modalWindow.addEventListener("click", (event) => {
			event.stopPropagation();
		});
	}

	/*
    =========================================================
    MODAL IMAGE ARROWS
    =========================================================
    */

	if (modalPrevImage) {
		modalPrevImage.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			changeModalImage(-1);
		});
	}

	if (modalNextImage) {
		modalNextImage.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			changeModalImage(1);
		});
	}

	/*
    =========================================================
    THUMBNAILS
    =========================================================
    */

	thumbs.forEach((thumb, index) => {
		thumb.addEventListener("click", (event) => {
			event.preventDefault();
			event.stopPropagation();

			const project = projects[activeProjectIndex];

			if (!project || !project.images[index]) {
				return;
			}

			modalImageIndex = index;

			updateModalImage();
		});
	});

	/*
    =========================================================
    PREVIOUS / NEXT PROJECT
    =========================================================
    */

	if (prevProject) {
		prevProject.addEventListener("click", () => {
			changeProject(-1);
		});
	}

	if (nextProject) {
		nextProject.addEventListener("click", () => {
			changeProject(1);
		});
	}

	/*
    =========================================================
    CLICK IMAGE
    =========================================================
    */

	if (modalImage) {
		modalImage.addEventListener("click", (event) => {
			if (event.target.closest(".project-modal__arrow")) {
				return;
			}

			changeModalImage(1);
		});
	}

	/*
    =========================================================
    TOUCH SWIPE
    =========================================================
    */

	if (modalImage) {
		modalImage.addEventListener(
			"touchstart",
			(event) => {
				const touch = event.changedTouches[0];

				touchStartX = touch.clientX;
				touchStartY = touch.clientY;
			},
			{
				passive: true,
			},
		);

		modalImage.addEventListener(
			"touchend",
			(event) => {
				const touch = event.changedTouches[0];

				const diffX = touch.clientX - touchStartX;

				const diffY = touch.clientY - touchStartY;

				if (Math.abs(diffX) < 50 || Math.abs(diffX) < Math.abs(diffY)) {
					return;
				}

				if (diffX < 0) {
					changeModalImage(1);
				} else {
					changeModalImage(-1);
				}
			},
			{
				passive: true,
			},
		);
	}

	/*
    =========================================================
    KEYBOARD
    =========================================================
    */

	document.addEventListener("keydown", (event) => {
		if (!modal.classList.contains("is-open")) {
			return;
		}

		if (event.key === "Escape") {
			closeModal();
		}

		if (event.key === "ArrowLeft") {
			changeModalImage(-1);
		}

		if (event.key === "ArrowRight") {
			changeModalImage(1);
		}

		if (event.key === "ArrowUp") {
			changeProject(-1);
		}

		if (event.key === "ArrowDown") {
			changeProject(1);
		}
	});

	/*
    =========================================================
    RESIZE
    =========================================================
    */

	window.addEventListener("resize", () => {
		if (window.innerWidth <= 800) {
			hidePreview();
		}
	});

	/*
    =========================================================
    INITIAL STATE
    =========================================================
    */

	setActiveProject(0);
});
