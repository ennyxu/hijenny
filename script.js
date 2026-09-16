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

    /* Each doodle can have its own settings */
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


        /*
        -------------------------
        MOUSE INTERACTION
        -------------------------
        */

        const attractionRadius = 160;
        const repelRadius = 75;


        /* Mouse is VERY close → move away */

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


        /* Mouse is nearby → move slightly toward it */

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


        /* Mouse is far away → return home */

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

// Add a separate image list for each project here.
const projectPages = {
    project1: [
        "images/project1/page-1.jpg",
        "images/project1/page-2.jpg",
        "images/project1/page-3.jpg",
        "images/project1/page-4.jpg"
    ]
};

let pageFlip;
let activeButton;
let busy = false;

const motionDuration = () =>
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? 0
        : 400;

// Finds the translation and scale between the book and button.
function buttonTransform() {
    const button = activeButton.getBoundingClientRect();
    const book = bookOverlay.getBoundingClientRect();

    const x = button.left + button.width / 2
        - (book.left + book.width / 2);

    const y = button.top + button.height / 2
        - (book.top + book.height / 2);

    const scale = Math.min(
        button.width / book.width,
        button.height / book.height
    );

    return `translate(${x}px, ${y}px) scale(${scale})`;
}

async function openBook(button) {
    const pages = projectPages[button.dataset.project];

    if (!pages || busy || bookOverlay.open) return;

    busy = true;
    activeButton = button;
    bookOverlay.showModal();

    // Fit two portrait pages inside the screen.
    const pageWidth = Math.floor(
        Math.min(420, window.innerWidth * 0.44,
                 window.innerHeight * 0.8 * 11 / 8.5)
    );

    if (!pageFlip) {
        pageFlip = new St.PageFlip(bookElement, {
            width: pageWidth,
            height: Math.round(pageWidth * 8.5 / 11),
            size: "fixed",
            usePortrait: false,
            showCover: false,
            drawShadow: true,
            maxShadowOpacity: 0.3,
            flippingTime: 800
        });

        pageFlip.loadFromImages(pages);
    } else {
        pageFlip.updateFromImages(pages);
        pageFlip.turnToPage(0);
    }

    // Let the browser calculate the book's position.
    await new Promise(requestAnimationFrame);

    await bookOverlay.animate(
        [
            {
                transform: buttonTransform(),
                opacity: 0
            },
            {
                transform: "translate(0, 0) scale(1)",
                opacity: 1
            }
        ],
        {
            duration: motionDuration(),
            easing: "cubic-bezier(.2,.8,.2,1)"
        }
    ).finished;

    busy = false;
}

async function closeBook() {
    if (busy || !bookOverlay.open) return;

    busy = true;

    await bookOverlay.animate(
        [
            {
                transform: "translate(0, 0) scale(1)",
                opacity: 1
            },
            {
                transform: buttonTransform(),
                opacity: 0
            }
        ],
        {
            duration: motionDuration(),
            easing: "ease-in"
        }
    ).finished;

    bookOverlay.close();
    activeButton.focus();
    busy = false;
}

document.querySelectorAll(".project-box").forEach(button => {
    button.addEventListener("click", () => openBook(button));
});

// Close only when a click starts AND ends outside the book.
// This avoids closing when you drag a page beyond its edge.
let startedOutside = false;

function isOutside(event) {
    const rect = bookElement.getBoundingClientRect();

    return (
        event.clientX < rect.left ||
        event.clientX > rect.right ||
        event.clientY < rect.top ||
        event.clientY > rect.bottom
    );
}

bookOverlay.addEventListener("pointerdown", event => {
    startedOutside = isOutside(event);
});

bookOverlay.addEventListener("click", event => {
    if (startedOutside && isOutside(event)) closeBook();
    startedOutside = false;
});

// Escape also closes the book.
bookOverlay.addEventListener("cancel", event => {
    event.preventDefault();
    closeBook();
});

// Optional keyboard page turning.
bookOverlay.addEventListener("keydown", event => {
    if (busy) return;

    if (event.key === "ArrowRight") {
        event.preventDefault();
        pageFlip.flipNext();
    }

    if (event.key === "ArrowLeft") {
        event.preventDefault();
        pageFlip.flipPrev();
    }
});
