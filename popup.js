// popup.js - Con Excel funcionando (librería local)
const BASE_URL = 'https://zonatmo.nakamasweb.com';
const CATS = {
    watch: { name: 'Leído', url: '/profile/read' },
    pending: { name: 'Pendiente', url: '/profile/pending' },
    follow: { name: 'Siguiendo', url: '/profile/follow' },
    wish: { name: 'Favorito', url: '/profile/wish' },
    have: { name: 'Lo tengo', url: '/profile/have' },
    abandoned: { name: 'Abandonado', url: '/profile/abandoned' }
};

// Verificar que XLSX está cargado
if (typeof XLSX === 'undefined') {
    console.error('❌ XLSX no cargado - Excel no disponible');
}

async function fetchMangasFromUrl(url) {
    const res = await fetch(url, { credentials: 'include' });
    const html = await res.text();
    const doc = new DOMParser().parseFromString(html, 'text/html');
    const mangas = [];
    doc.querySelectorAll('.element[data-identifier]').forEach(el => {
        const nombre = el.querySelector('.text-truncate')?.innerText?.trim();
        const tipo = el.querySelector('.book-type')?.innerText?.trim();
        const urlEl = el.querySelector('a');
        if (nombre && urlEl) mangas.push({ nombre, tipo, url: urlEl.href });
    });
    const nextLink = doc.querySelector('a[rel="next"]');
    const hasNext = nextLink && !nextLink.parentElement?.classList?.contains('disabled');
    return { mangas, hasNext };
}

async function fetchLastChapter(url) {
    try {
        const res = await fetch(url, { credentials: 'include' });
        const html = await res.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');
        let ultimo = 'No marcado';
        let maxNum = 0;
        doc.querySelectorAll('.chapter-viewed-icon.viewed').forEach(ch => {
            const container = ch.closest('.upload-link');
            if (container) {
                const text = container.querySelector('h4')?.innerText || '';
                const match = text.match(/Capítulo\s+([\d.]+)/i);
                if (match) {
                    const num = parseFloat(match[1]);
                    if (num > maxNum) { maxNum = num; ultimo = match[0]; }
                }
            }
        });
        return ultimo;
    } catch { return 'Error'; }
}

function downloadBlob(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 100);
}

function exportToCSV(datos, timestamp) {
    const csvRows = [['Nombre', 'Tipo', 'Categoría', 'Último Capítulo']];
    datos.forEach(d => csvRows.push([d.nombre, d.tipo, d.categoria, d.ultimoCapitulo]));
    const csv = csvRows.map(row => row.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    downloadBlob(new Blob(["\uFEFF" + csv], { type: 'text/csv' }), `tmo_${timestamp}.csv`);
    return true;
}

function exportToJSON(datos, timestamp) {
    downloadBlob(new Blob([JSON.stringify(datos, null, 2)], { type: 'application/json' }), `tmo_${timestamp}.json`);
    return true;
}

function exportToExcel(datos, timestamp) {
    if (typeof XLSX === 'undefined') {
        console.error('XLSX no disponible');
        return false;
    }
    try {
        const ws = XLSX.utils.json_to_sheet(datos);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Mangas');
        XLSX.writeFile(wb, `tmo_${timestamp}.xlsx`);
        return true;
    } catch (error) {
        console.error('Error generando Excel:', error);
        return false;
    }
}

document.getElementById('exportBtn').onclick = async () => {
    // Obtener categorías seleccionadas
    const selected = [];
    if (document.getElementById('catWatch')?.checked) selected.push('watch');
    if (document.getElementById('catPending')?.checked) selected.push('pending');
    if (document.getElementById('catFollow')?.checked) selected.push('follow');
    if (document.getElementById('catWish')?.checked) selected.push('wish');
    if (document.getElementById('catHave')?.checked) selected.push('have');
    if (document.getElementById('catAbandoned')?.checked) selected.push('abandoned');
    
    // Obtener formatos seleccionados
    const formats = [];
    if (document.getElementById('formatCSV')?.checked) formats.push('csv');
    if (document.getElementById('formatJSON')?.checked) formats.push('json');
    if (document.getElementById('formatExcel')?.checked) formats.push('excel');
    
    if (selected.length === 0) { alert('Selecciona al menos una categoría'); return; }
    if (formats.length === 0) { alert('Selecciona al menos un formato de salida'); return; }
    
    const btn = document.getElementById('exportBtn');
    const loading = document.getElementById('loading');
    const errorDiv = document.getElementById('error');
    const successDiv = document.getElementById('success');
    
    btn.disabled = true;
    loading.style.display = 'block';
    errorDiv.style.display = 'none';
    successDiv.style.display = 'none';
    
    try {
        // Paso 1: Recoger todos los mangas
        let allMangas = [];
        for (const cat of selected) {
            const info = CATS[cat];
            let page = 1, hasMore = true;
            while (hasMore) {
                loading.innerHTML = `⏳ Cargando ${info.name} - página ${page}...`;
                const { mangas, hasNext } = await fetchMangasFromUrl(`${BASE_URL}${info.url}?page=${page}`);
                mangas.forEach(m => m.categoria = info.name);
                allMangas = allMangas.concat(mangas);
                hasMore = hasNext;
                page++;
                await new Promise(r => setTimeout(r, 300));
            }
        }
        
        if (allMangas.length === 0) throw new Error('No se encontraron mangas');
        
        // Paso 2: Obtener último capítulo de cada manga
        for (let i = 0; i < allMangas.length; i++) {
            loading.innerHTML = `⏳ ${i+1}/${allMangas.length}: ${allMangas[i].nombre.substring(0, 35)}...`;
            allMangas[i].ultimoCapitulo = await fetchLastChapter(allMangas[i].url);
            await new Promise(r => setTimeout(r, 200));
        }
        
        const timestamp = new Date().toISOString().slice(0,19).replace(/:/g, '-');
        const datos = allMangas.map(m => ({ 
            nombre: m.nombre, 
            tipo: m.tipo, 
            categoria: m.categoria, 
            ultimoCapitulo: m.ultimoCapitulo 
        }));
        
        // Exportar según formatos seleccionados
        const exportados = [];
        
        if (formats.includes('csv')) {
            exportToCSV(datos, timestamp);
            exportados.push('CSV');
        }
        
        if (formats.includes('json')) {
            exportToJSON(datos, timestamp);
            exportados.push('JSON');
        }
        
        if (formats.includes('excel')) {
            const exito = exportToExcel(datos, timestamp);
            if (exito) exportados.push('Excel');
            else throw new Error('No se pudo generar el archivo Excel');
        }
        
        successDiv.textContent = `✅ Exportados ${allMangas.length} mangas (${exportados.join(', ')})`;
        successDiv.style.display = 'block';
        
    } catch (err) {
        errorDiv.textContent = `❌ ${err.message}`;
        errorDiv.style.display = 'block';
    } finally {
        btn.disabled = false;
        loading.style.display = 'none';
        loading.innerHTML = '⏳ Procesando...';
    }
};