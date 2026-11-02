# Ca//andra.OS

Console de Meta Ads y operación de Posgrado (Maestrías y Segundas Especialidades).

**Módulos:** //Metricas · //BB.DD - matriz · //Gestor.Piezas · //Seguimiento.Piezas · //Permalinks · //Calendario

## Sincronización entre dispositivos

Desplegado en Vercel, los datos se comparten entre todos los dispositivos:

- **Calendario, Seguimiento de piezas y cola del Gestor**: se guardan en la nube al instante y los demás dispositivos los reciben en ~20 s (o al volver a la pestaña).
- **Bases META (MA/SE) y BB.DD - matriz**: se guarda la última base subida (máx. 4 MB) y cada dispositivo la vuelve a cargar al abrir.

El indicador **SYNC** del encabezado muestra el estado (verde = sincronizado, amarillo = subiendo, gris LOCAL = sin nube, rojo = error). Haz clic en él para forzar una actualización.

### Estructura

- `index.html` — la app completa
- `api/state.js` — guarda Calendario, Seguimiento, Gestor y el registro de bases
- `api/file.js` — guarda la última base de cada casilla (ma, se, crm)
- `package.json` — dependencia `@vercel/blob`

### Requisito en Vercel

Un **Blob store privado** conectado al proyecto (Storage → Create → Blob → Private). Vercel agrega solo la variable `BLOB_READ_WRITE_TOKEN`.
Si el store se creó como público, agrega la variable `BLOB_ACCESS=public`.

Sin el store (o abriendo el archivo localmente), la app funciona igual en modo LOCAL.

> El link de Vercel es público y la API no tiene clave: cualquiera con el link puede ver y editar los datos.
