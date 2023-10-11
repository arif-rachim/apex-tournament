import {sizes} from "../Game";

export function adjustDivToViewport() {
    const div = document.getElementById('game');
    if(div === undefined || div === null){
        return;
    }
    const viewportWidth = window.innerWidth - 24;
    const viewportHeight = window.innerHeight - 24;
    // Calculate the new width and height while maintaining aspect ratio
    const aspectRatio = sizes.width / sizes.height; // You can adjust this ratio as needed
    let newWidth, newHeight;

    if (viewportWidth / aspectRatio <= viewportHeight) {
        // Fit based on width
        newWidth = viewportWidth;
        newHeight = viewportWidth / aspectRatio;
    } else {
        // Fit based on height
        newHeight = viewportHeight;
        newWidth = viewportHeight * aspectRatio;
    }

    div.style.width = newWidth + 'px';
    div.style.height = newHeight + 'px';
}

window.addEventListener('orientationchange', adjustDivToViewport)
window.addEventListener('resize', adjustDivToViewport)