chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMangas") {
        const mangas = [];
        document.querySelectorAll('.element[data-identifier]').forEach(el => {
            const nombre = el.querySelector('.text-truncate')?.innerText?.trim();
            const tipo = el.querySelector('.book-type')?.innerText?.trim();
            const url = el.querySelector('a')?.href;
            if (nombre && url) mangas.push({ nombre, tipo, url });
        });
        sendResponse({ mangas });
        return true;
    }
});