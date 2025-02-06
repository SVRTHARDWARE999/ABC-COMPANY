//disable mobile long press save-as options-------
window.oncontextmenu = function(event) {
    event.preventDefault();
    event.stopPropagation();
    return false;
};