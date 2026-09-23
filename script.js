const doodles = document.querySelectorAll(".doodle");

const mouse = {
    x: -1000,
    y: -1000
};

document.addEventListener("mousemove", (event) => {
    mouse.x = event.clientX;
    mouse.y = event.clientY;
});

document.addEventListener("mouseleave", () => {
    mouse.x = -1000;
    mouse.y = -1000;
});


doodles.forEach((doodle, index) => {

    let currentX = 0;
    let currentY = 0;

    let targetX = 0;
    let targetY = 0;

    const strength =
        Number(doodle.dataset.strength) || 15;

    const speed =
        Number(doodle.dataset.speed) || 0.055;


    function animate() {

        const rect = doodle.getBoundingClientRect();

        const doodleX = rect.left + rect.width / 2;
        const doodleY = rect.top + rect.height / 2;

        const distanceX = mouse.x - doodleX;
        const distanceY = mouse.y - doodleY;

        const distance = Math.sqrt(
            distanceX * distanceX +
            distanceY * distanceY
        );

        const attractionRadius = 160;
        const repelRadius = 75;

        if (distance < repelRadius && distance > 0) {

            const force =
                (repelRadius - distance) / repelRadius;

            targetX =
                -(distanceX / distance) *
                force *
                strength;

            targetY =
                -(distanceY / distance) *
                force *
                strength;
        }

        else if (distance < attractionRadius) {

            const force =
                (attractionRadius - distance) /
                attractionRadius;

            targetX =
                (distanceX / distance) *
                force *
                3;

            targetY =
                (distanceY / distance) *
                force *
                3;
        }

        else {

            targetX = 0;
            targetY = 0;
        }

        currentX +=
            (targetX - currentX) * speed;

        currentY +=
            (targetY - currentY) * speed;

        const time =
            performance.now() * 0.001;

        const floatX =
            Math.sin(
                time * 0.7 + index * 1.7
            ) * 1.2;

        const floatY =
            Math.cos(
                time * 0.6 + index * 1.3
            ) * 1.2;

        const rotation =
            currentX * 0.12 +
            Math.sin(
                time * 0.5 + index
            ) * 0.4;


        doodle.style.transform =
            `translate(
                ${currentX + floatX}px,
                ${currentY + floatY}px
            )
            rotate(${rotation}deg)`;


        requestAnimationFrame(animate);
    }


    animate();
});

/* shower thought stuff*/

const showerThoughtBtn = document.getElementById("showerThoughtBtn");
const thoughtBubble = document.getElementById("thoughtBubble");
const bubbleClose = document.getElementById("bubbleClose");

if (showerThoughtBtn && thoughtBubble && bubbleClose) {

    showerThoughtBtn.addEventListener("click", function () {
        thoughtBubble.classList.toggle("show");
    });

    bubbleClose.addEventListener("click", function () {
        thoughtBubble.classList.remove("show");
    });

}

const bookOverlay = document.getElementById("bookOverlay");
const bookElement = document.getElementById("book");
const prevPage = document.getElementById("prevPage");
const nextPage = document.getElementById("nextPage");
const bookClose = document.getElementById("bookClose");
const pageIndicators = document.getElementById("pageIndicators");
const pageCount = document.getElementById("pageCount");

/*
Each image is ONE portrait page: 8.5 wide × 11 tall.

Pages 1 + 2 form the first 17 × 11 spread.
Pages 3 + 4 form the second spread.

Use an even number of images.
Replace these paths with your actual image locations.
*/
const projectPages = {
    project1: [
        "images/project1/page-1.png",
        "images/project1/page-2.png",
        "images/project1/page-3.png",
        "images/project1/page-4.png",
        "images/project1/page-5.png",
        "images/project1/page-6.png",
        "images/project1/page-7.png",
        "images/project1/page-8.png"     
    ]

    // Add more projects like this:
    //
    // ,project2: [
    //     "images/project2/page-1.jpg",
    //     "images/project2/page-2.jpg"
    // ]
};

let pageFlip;
let activeButton;
let activePages = [];
let turning = false;

const reducedMotion = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

function getPageWidth() {
    // Leave room for arrows, close button, and indicators.
    const availableWidth = window.innerWidth - 120;
    const availableHeight = window.innerHeight - 120;

    return Math.max(
        1,
        Math.floor(
            Math.min(
                460,
                availableWidth / 2,
                availableHeight * 8.5 / 11
            )
        )
    );
}

function updateIndicators() {
    if (!pageFlip) return;

    const currentSpread = Math.floor(
        pageFlip.getCurrentPageIndex() / 2
    );

    const totalSpreads = Math.ceil(activePages.length / 2);

    [...pageIndicators.children].forEach((button, index) => {
        button.setAttribute(
            "aria-current",
            index === currentSpread ? "page" : "false"
        );
    });

    prevPage.disabled = currentSpread === 0;
    nextPage.disabled = currentSpread >= totalSpreads - 1;

    pageCount.textContent =
        `${currentSpread + 1} / ${totalSpreads}`;
}

function createIndicators() {
    pageIndicators.replaceChildren();

    const totalSpreads = Math.ceil(activePages.length / 2);

    for (let index = 0; index < totalSpreads; index++) {
        const button = document.createElement("button");

        button.className = "page-indicator";
        button.type = "button";
        button.setAttribute(
            "aria-label",
            `Go to spread ${index + 1}`
        );

        button.addEventListener("click", () => {
            if (turning) return;

            pageFlip.turnToPage(index * 2);
            updateIndicators();
        });

        pageIndicators.append(button);
    }
}

function openBook(button) {
    if (bookOverlay.open) return;

    const pages = projectPages[button.dataset.project];

    if (!pages?.length) {
        alert("Add this project's page images to projectPages first.");
        return;
    }

    if (!window.St?.PageFlip) {
        alert("The book viewer couldn't load. Refresh and try again.");
        return;
    }

    activeButton = button;
    activePages = pages;
    turning = false;

    bookOverlay.showModal();

    if (!pageFlip) {
        const pageWidth = getPageWidth();

        pageFlip = new St.PageFlip(bookElement, {
            
            width: pageWidth,
            height: Math.round(pageWidth * 11 / 8.5),

            size: "fixed",
            usePortrait: false,
            showCover: false,     
            flippingTime: 650,
            

            // Use the arrows and indicators to navigate.
            useMouseEvents: false
        });

        pageFlip.on("flip", updateIndicators);

        pageFlip.on("changeState", event => {
            turning = event.data !== "read";
        });

        pageFlip.loadFromImages(pages);
    } else {
        pageFlip.updateFromImages(pages);
        pageFlip.turnToPage(0);
    }

    createIndicators();
    updateIndicators();
    bookClose.focus();

    // Expand out from the project button.
    if (!reducedMotion()) {
        const source = button.getBoundingClientRect();
        const destination = bookOverlay.getBoundingClientRect();

        const x =
            source.left + source.width / 2 -
            destination.left - destination.width / 2;

        const y =
            source.top + source.height / 2 -
            destination.top - destination.height / 2;

        bookOverlay.animate(
            [
                {
                    opacity: 0,
                    transform: `translate(${x}px, ${y}px) scale(0.2)`
                },
                {
                    opacity: 1,
                    transform: "translate(0, 0) scale(1)"
                }
            ],
            {
                duration: 380,
                easing: "cubic-bezier(.2,.8,.2,1)"
            }
        );
    }
}

function changeSpread(direction) {
    if (!pageFlip || turning) return;

    const currentSpread = Math.floor(
        pageFlip.getCurrentPageIndex() / 2
    );

    const targetSpread = currentSpread + direction;
    const totalSpreads = Math.ceil(activePages.length / 2);

    if (targetSpread < 0 || targetSpread >= totalSpreads) return;

    if (reducedMotion()) {
        pageFlip.turnToPage(targetSpread * 2);
        updateIndicators();
    } else if (direction > 0) {
        pageFlip.flipNext();
    } else {
        pageFlip.flipPrev();
    }
}

function closeBook() {
    bookOverlay.close();
    activeButton?.focus();
}

/* PROJECT BUTTONS */

document.querySelectorAll(".project-box").forEach((button, index) => {
    button.setAttribute(
        "aria-label",
        `Open project ${index + 1} sketchbook`
    );

    button.setAttribute("aria-haspopup", "dialog");
    button.addEventListener("click", () => openBook(button));
});

/* ARROWS AND CLOSE BUTTON */

prevPage.addEventListener("click", () => changeSpread(-1));
nextPage.addEventListener("click", () => changeSpread(1));
bookClose.addEventListener("click", closeBook);

/* KEYBOARD CONTROLS */

bookOverlay.addEventListener("keydown", event => {
    if (event.key === "ArrowRight") {
        event.preventDefault();
        changeSpread(1);
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        changeSpread(-1);
    }
});

bookOverlay.addEventListener("cancel", event => {
    event.preventDefault();
    closeBook();
});

/* CLICK THE BACKDROP TO CLOSE */

function isOutside(event) {
    const rect = bookOverlay.getBoundingClientRect();

    return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    );
}

let startedOutside = false;

bookOverlay.addEventListener("pointerdown", event => {
    startedOutside = isOutside(event);
});

bookOverlay.addEventListener("click", event => {
    if (startedOutside && isOutside(event)) {
        closeBook();
    }

    startedOutside = false;
});

/* RESIZE THE BOOK WITH THE WINDOW */

window.addEventListener("resize", () => {
    if (!pageFlip) return;

    const pageWidth = getPageWidth();
    const settings = pageFlip.getSettings();

    settings.width = pageWidth;
    settings.height = Math.round(pageWidth * 11 / 8.5);

    pageFlip.update();
});