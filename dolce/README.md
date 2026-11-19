# Dolce Lingerie · propuesta editorial

Vista previa: https://samuelacuna12.github.io/propuestas-comerciales/dolce/

Incluye 13 páginas de producto, 7 colecciones, búsqueda y bolsa de demostración. La vista previa tiene noindex y no envía pedidos. Las promociones se revisan antes de continuar en la tienda oficial.

## Fuente Shopify

La carpeta `theme/` contiene el código del tema de propuesta sin publicar. Los precios, variantes y disponibilidad del tema se leen de Shopify; `assets/catalog-source.json` es únicamente el snapshot de los 13 productos activos usado para la demostración.

## Reconstruir la demostración

Desde esta carpeta:

```bash
npm install --prefix preview/.build liquidjs@10 --no-audit --no-fund
node scripts/build-preview.mjs
```

El resultado se guarda en `preview/`; para Pages se copian sus contenidos a la carpeta `dolce/` del repositorio. No subir `preview/.build/`. El script verifica rutas, recursos, un H1 por página y noindex.

La fotografía de prendas procede de Dolce. La IA se limita a fondos ambientales; no se publican reconstrucciones de las prendas. Fuentes y revisión de promociones en `docs/`.
