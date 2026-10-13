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
