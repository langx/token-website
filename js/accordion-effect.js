const accordion = document.querySelector(".accordion");

accordion.addEventListener("click", (e) => {

    console.log(e.target.tagName);
    if (e.target.href) return;

    const activePanel = e.target.closest(".accordion-panel");
    if (!activePanel) return;
    toggleAccordion(activePanel);
});

function toggleAccordion(panelToActivate) {
    const activePanelIsOpened = panelToActivate.getAttribute("aria-expanded")
    const panelContent = panelToActivate.querySelector(".accordion-content");
    panelToActivate
        .querySelector(".accordion-panel-title")
        .querySelector("a")
        .classList.toggle("is-open");

    if (activePanelIsOpened === "true") {
        panelToActivate.setAttribute("aria-expanded", false);
        panelContent.setAttribute("aria-hidden", true);
    } else {
        panelToActivate.setAttribute("aria-expanded", true);
        panelContent.setAttribute("aria-hidden", false);
    }
}