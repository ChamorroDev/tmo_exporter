// background.js - Versión completa con paginación y capítulos
console.log('✅ TMO Exporter Background cargado');

// Cache para no repetir peticiones
const mangaCache = new Map();

// Mapeo de categorías
const CATEGORIAS = {
    watch: { name: 'Leído', url: '/profile/read' },
    pending: { name: 'Pendiente', url: '/profile/pending' },
    follow: { name: 'Siguiendo', url: '/profile/follow' },
    wish: { name: 'Favorito', url: '/profile/wish' },
    have: { name: 'Lo tengo', url: '/profile/have' },
    abandoned: { name: 'Abandonado', url: '/profile/abandoned' }
};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getMangasFromUrl") {
        getMangasFromUrl(request.url).then(sendResponse);
        return true;
    }
    if (request.action === "getMangaDetails") {
        getMangaDetails(request.url, request.manga).then(sendResponse);
        return true;
    }
    if (request.action === "exportAllCategories") {
        exportAllCategories(request.categories, request.options).then(sendResponse);
        return true;
    }
    return true;
});

// Obtener mangas de una URL específica (con paginación)
async function getMangasFromUrl(url) {
    try {
        const response = await fetch(url, { credentials: 'include' });
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        const mangas = [];
        doc.querySelectorAll('.element[data-identifier]').forEach(el => {
            const id = el.getAttribute('data-identifier');
            const nombre = el.querySelector('.text-truncate')?.innerText?.trim();
            const tipo = el.querySelector('.book-type')?.innerText?.trim();
            const puntuacion = el.querySelector('.score span')?.innerText?.trim();
            const demografia = el.querySelector('.demography')?.innerText?.trim();
            const urlEl = el.querySelector('a');
            
            let imagenUrl = '';
            const thumbnail = el.querySelector('.book-thumbnail');
            if (thumbnail) {
                const style = thumbnail.getAttribute('style') || '';
                const match = style.match(/url\(['"]?([^'"]+)['"]?\)/);
                if (match) imagenUrl = match[1];
            }
            
            if (id && nombre && urlEl) {
                mangas.push({
                    id, nombre, tipo, puntuacion, demografia,
                    url: urlEl.href, imagen_url: imagenUrl
                });
            }
        });
        
        return { mangas, nextPage: hasNextPage(doc) };
    } catch (error) {
        console.error('Error:', error);
        return { mangas: [], nextPage: false };
    }
}

// Detectar si hay más páginas
function hasNextPage(doc) {
    const nextLink = doc.querySelector('a[rel="next"], .pagination a:last-child');
    if (nextLink && nextLink.href) {
        return !nextLink.parentElement.classList.contains('disabled');
    }
    return false;
}

// Obtener detalles de un manga (último capítulo leído)
async function getMangaDetails(url, baseManga) {
    if (mangaCache.has(url)) return mangaCache.get(url);
    
    try {
        const response = await fetch(url, { credentials: 'include' });
        const html = await response.text();
        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        
        // === EXTRAER ÚLTIMO CAPÍTULO LEÍDO ===
        let ultimoCapitulo = 'No hay capítulos marcados';
        let ultimoNumero = 0;
        let capitulosMarcados = [];
        
        // Buscar TODOS los capítulos con clase 'viewed'
        const viewedChapters = doc.querySelectorAll('.chapter-viewed-icon.viewed');
        
        for (const chapter of viewedChapters) {
            const container = chapter.closest('.upload-link, .list-group-item');
            if (container) {
                const chapterText = container.querySelector('h4')?.innerText || '';
                const match = chapterText.match(/Capítulo\s+([\d.]+)/i);
                if (match) {
                    const num = parseFloat(match[1]);
                    capitulosMarcados.push({ numero: num, texto: match[0] });
                    if (num > ultimoNumero) {
                        ultimoNumero = num;
                        ultimoCapitulo = match[0];
                    }
                }
            }
        }
        
        // Si encontró capítulos marcados, mostrar el último
        if (capitulosMarcados.length > 0) {
            ultimoCapitulo = `${ultimoCapitulo} (${capitulosMarcados.length} marcados en total)`;
        }
        
        // Extraer total de capítulos disponibles
        let totalCapitulos = 0;
        doc.querySelectorAll('.upload-link h4').forEach(ch => {
            const match = ch.innerText.match(/Capítulo\s+([\d.]+)/i);
            if (match) {
                const num = parseFloat(match[1]);
                if (num > totalCapitulos) totalCapitulos = num;
            }
        });
        
        // Extraer estado de la serie
        let estadoSerie = 'Desconocido';
        const estadoEl = doc.querySelector('.book-status');
        if (estadoEl) estadoSerie = estadoEl.innerText.trim();
        
        // Extraer año
        let año = '';
        const añoEl = doc.querySelector('.element-title small');
        if (añoEl) {
            const match = añoEl.innerText.match(/(\d{4})/);
            if (match) año = match[1];
        }
        
        // Extraer géneros
        let generos = [];
        doc.querySelectorAll('.badge-primary').forEach(el => {
            const g = el.innerText.trim();
            if (g && !g.includes('Webcomic') && !g.includes('MANHWA') && !g.includes('MANGA')) {
                generos.push(g);
            }
        });
        
        const result = {
            ...baseManga,
            ultimoCapitulo: ultimoCapitulo,
            ultimoCapituloNumero: ultimoNumero,
            totalCapitulosMarcados: capitulosMarcados.length,
            totalCapitulosDisponibles: totalCapitulos,
            estado_serie: estadoSerie,
            año: año,
            generos: generos
        };
        
        mangaCache.set(url, result);
        return result;
        
    } catch (error) {
        console.error(`Error en ${baseManga.nombre}:`, error);
        return { ...baseManga, ultimoCapitulo: 'Error al cargar' };
    }
}

// Exportar todas las categorías seleccionadas
async function exportAllCategories(categoriasSeleccionadas, options) {
    const baseUrl = 'https://zonatmo.nakamasweb.com';
    const allMangas = [];
    let totalProcesados = 0;
    
    for (const cat of categoriasSeleccionadas) {
        const catInfo = CATEGORIAS[cat];
        if (!catInfo) continue;
        
        let pagina = 1;
        let hasMore = true;
        
        console.log(`📂 Procesando ${catInfo.name}...`);
        
        while (hasMore) {
            const url = `${baseUrl}${catInfo.url}?page=${pagina}`;
            console.log(`  Página ${pagina}...`);
            
            const { mangas, nextPage } = await getMangasFromUrl(url);
            
            for (const manga of mangas) {
                manga.categoria = cat;
                manga.categoria_nombre = catInfo.name;
                allMangas.push(manga);
            }
            
            totalProcesados += mangas.length;
            hasMore = nextPage && options.includeAllPages;
            pagina++;
            
            // Pequeña pausa
            await new Promise(r => setTimeout(r, 500));
        }
    }
    
    console.log(`📊 Total encontrados: ${totalProcesados} mangas`);
    return allMangas;
}