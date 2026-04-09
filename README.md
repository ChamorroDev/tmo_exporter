# 📚 TMO Exporter

<div align="center">

![Version](https://img.shields.io/badge/version-3.0.0-blue)
![Chrome](https://img.shields.io/badge/Chrome-Extension-green)
![License](https://img.shields.io/badge/license-MIT-orange)

**Exporta toda tu biblioteca de TuMangaOnline y visualízala localmente**

[Características](#-características) •
[Instalación](#-instalación-de-la-extensión) •
[Uso](#-uso-de-la-extensión) •
[Visor](#%EF%B8%8F-visor-de-biblioteca) •
[Soporte](#-soporte)

</div>

---

## ✨ Características

| Característica | Descripción |
|----------------|-------------|
| 📖 **6 categorías** | Leído, Pendiente, Siguiendo, Favorito, Lo tengo, Abandonado |
| 📄 **3 formatos** | CSV, JSON y Excel (.xlsx) |
| 🔄 **Paginación automática** | Recorre todas las páginas de cada categoría |
| 🎯 **Último capítulo** | Detecta el último capítulo que marcaste como leído |
| 🖼️ **Visor local** | Visualiza todos tus mangas en una interfaz estilo galería |
| 📁 **Multi-archivo** | El visor puede cargar múltiples exportaciones a la vez |
| ⚡ **Rápido** | Exporta cientos de mangas en minutos |
| 🔒 **Privado** | Todo ocurre localmente, tus datos no salen de tu PC |

---

## 📥 Instalación de la Extensión

### Requisitos previos
- Google Chrome (o Edge, Brave, Opera)
- Una cuenta en TuMangaOnline

### Paso 1: Descargar la extensión

```bash
git clone https://github.com/ChamorroDev/tmo_exporter.git
# o descarga el ZIP desde GitHub
```

### Paso 2: Preparar los archivos
Asegúrate de tener esta estructura:

```text
tmo-exporter/
├── manifest.json
├── content.js
├── popup.html
├── popup.js
├── popup.css
├── xlsx.full.min.js   
└── visor_mangas.html  ← Visor de biblioteca
```


### Paso 3: Cargar en Chrome
1. Abre `chrome://extensions/` en tu navegador
2. Activa el **"Modo desarrollador"** (toggle en la esquina superior derecha)
3. Haz clic en **"Cargar descomprimida"**
4. Selecciona la carpeta de la extensión
5. ¡La extensión está lista!

---

## 🚀 Uso de la Extensión

### 1. Ve a TuMangaOnline
Navega a tu perfil en `https://zonatmo.nakamasweb.com/profile`

### 2. Abre la extensión
Haz clic en el icono de la extensión (arriba a la derecha)

### 3. Selecciona categorías
Marca las categorías que quieres exportar:

| Categoría | Icono | Descripción |
|-----------|-------|-------------|
| Leído | 📖 | Mangas que completaste |
| Pendiente | ⏰ | Mangas que planeas leer |
| Siguiendo | ▶️ | Mangas que lees regularmente |
| Favorito | ❤️ | Tus mangas preferidos |
| Lo tengo | 📦 | Mangas que posees físicamente |
| Abandonado| 💔 | Mangas que dejaste |

### 4. Elige formatos
Selecciona uno o varios formatos:
- 📄 **CSV** - Abre con Excel, Google Sheets o cualquier editor
- 🔧 **JSON** - Para programadores y análisis de datos
- 📊 **Excel** - Archivo .xlsx con formato profesional

### 5. Exportar
Haz clic en **"🚀 Exportar selección"** y espera.
⏱️ *El tiempo depende de la cantidad de mangas. Aproximadamente 2-3 segundos por manga.*

### 6. Resultado
Se descargarán automáticamente los archivos en tu carpeta de Descargas:
```text
tmo_2024-01-15T10-30-00.csv
tmo_2024-01-15T10-30-00.json
tmo_2024-01-15T10-30-00.xlsx
```

---

## 🖼️ Visor de Biblioteca
El visor te permite ver todos tus mangas exportados en una interfaz estilo galería, sin necesidad de estar conectado a TMO.

### Características del visor
| Funcionalidad | Descripción |
|---------------|-------------|
| 🖼️ Galería visual | Muestra tarjetas con nombre, tipo y último capítulo |
| 📁 Múltiples archivos | Carga varios CSV/JSON/Excel a la vez |
| 🔍 Búsqueda | Filtra mangas por nombre |
| 📂 Filtro por categoría | Muestra solo Leídos, Pendientes, etc. |
| 📊 Estadísticas | Total de mangas y conteo por categoría |
| 🖱️ Modal de detalles | Haz clic en cualquier manga para ver más información |

### Cómo usar el visor

**Opción 1: Arrastrar y soltar (recomendado)**
1. Abre `visor_mangas.html` en tu navegador (doble clic)
2. Arrastra tus archivos CSV/JSON/Excel a la ventana
3. ¡Listo! Todos tus mangas aparecerán en la galería

**Opción 2: Seleccionar archivos**
1. Abre `visor_mangas.html` en tu navegador
2. Haz clic en el área de carga
3. Selecciona uno o varios archivos
4. Los mangas se cargarán automáticamente

### Vista previa del visor
```text
┌─────────────────────────────────────────────────────────────┐
│  📚 Visor de Biblioteca TMO                                 │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────┐  ┌─────────────────────┐           │
│  │ 📖 One Piece        │  │ ⭐ Solo Leveling    │           │
│  │ MANGA               │  │ MANHWA              │           │
│  │ Último: Cap. 1088   │  │ Último: Cap. 179    │           │
│  │ [Siguiendo]         │  │ [Leído]             │           │
│  └─────────────────────┘  └─────────────────────┘           │
│                                                             │
│  🔍 Buscar...  [📋 Todos] [📖 Leído] [▶️ Siguiendo]         │
│                                                             │
│  📊 Total: 156 mangas  |  📖 Leídos: 45  |  ▶️ Siguiendo: 32│
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Formato de salida

### CSV / Excel
| Nombre | Tipo | Categoría | Último Capítulo |
|--------|------|-----------|-----------------|
| One Piece | MANGA | Siguiendo | Capítulo 1088 |
| Solo Leveling | MANHWA | Leído | Capítulo 179 |
| Aegis Orta | MANHWA | Abandonado | No marcado |

### JSON
```json
[
  {
    "nombre": "One Piece",
    "tipo": "MANGA",
    "categoria": "Siguiendo",
    "ultimoCapitulo": "Capítulo 1088"
  }
]
```

---

## 📁 Estructura completa del proyecto
```text
tmo-exporter/
├── manifest.json          # Configuración de la extensión
├── background.js          # Lógica en segundo plano de la extensión
├── content.js             # Extrae mangas de la página
├── popup.html             # Interfaz principal de la extensión
├── popup.css              # Estilos de la interfaz de la extensión
├── popup.js               # Lógica principal de la extensión
├── xlsx.full.min.js       # Librería para Excel
├── visor_mangas.html      # Visor de biblioteca (NO requiere instalación)
└── README.md              # Este archivo
```

---


## 🛠️ Desarrollo

**Tecnologías utilizadas:**
- JavaScript (ES6+)
- Chrome Extensions API (Manifest V3)
- SheetJS (XLSX) - Para archivos Excel
- HTML5/CSS3 - Para el visor

**Ejecutar en modo desarrollo:**
1. Modifica los archivos en la carpeta
2. Ve a `chrome://extensions/`
3. Haz clic en "Recargar" (icono ↻) en la tarjeta de la extensión
4. Para el visor, solo refresca la página donde esté abierto (`visor_mangas.html`)

---

## 📄 Licencia
MIT License - Puedes usar, modificar y distribuir libremente.


## 📞 Soporte
Si encuentras algún problema:
1. Abre un Issue en GitHub
2. Incluye el error que ves en la consola (F12)
3. Especifica tu navegador y versión
