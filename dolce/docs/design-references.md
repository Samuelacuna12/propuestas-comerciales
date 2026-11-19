# Dolce: dirección y referencias

## Objetivo

Una tienda de lencería colombiana pensada primero para celular. El producto real, el ajuste y la elección de talla conducen la compra. La propuesta mantiene una composición editorial blanca y blush, con fotografías amplias y ritmo de tamaños variable, siguiendo la referencia de Pinterest seleccionada por el cliente.

Referencia visual del cliente: https://co.pinterest.com/pin/1151725304739129229/

## Decisiones de interacción

| Decisión | Motivo y aplicación | Referencia |
| --- | --- | --- |
| Galería táctil nativa | Scroll horizontal con snap, siguiente imagen parcialmente visible y botones alternativos al gesto. | Web Creative Skills: spacing-and-adaptivity, hit-areas |
| Compra fija móvil | Acción estable, separada del borde por 16px y safe-area; debe reflejar variante, precio y disponibilidad reales. | Web Creative Skills: spacing-and-adaptivity |
| Movimiento breve | Presión de botón 160ms; cambios de estado 150–250ms; transform y opacity. | Web Creative Skills: animate, RECIPES |
| Edición con ritmo | Revelar una vez las imágenes editoriales secundarias; nunca retrasar el hero, la información ni controles de compra. | Web Creative Skills: animate; Shopify performance |
| Accesibilidad | Controles nativos, foco visible, objetivos táctiles amplios, reduced motion y alternativas a gestos. | Web Creative Skills: better-accessibility |
| Dependencias contenidas | CSS/WAAPI para transiciones sencillas. GSAP se reserva para secuencias que realmente necesiten control. | Web Creative Skills: animate, gsap-core |

## Instrucciones de diseño dinámico consultadas

Respaldo del usuario: https://github.com/Samuelacuna12/web-creative-skills

- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/animate/SKILL.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/animate/RECIPES.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/gsap-core/SKILL.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/gsap-performance/SKILL.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/animation-performance/SKILL.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/better-accessibility/SKILL.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/better-accessibility/hit-areas.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/better-accessibility/motion-and-zoom.md
- https://github.com/Samuelacuna12/web-creative-skills/blob/main/skills/better-layout/spacing-and-adaptivity.md

Refero se consultó como metodología de investigación y validación visual; la consulta a su catálogo no estuvo disponible por suscripción inactiva.

## Implementación Shopify y rendimiento

Se consultó la documentación oficial para formularios de producto, variantes, imágenes y schemas. Los productos, precios, disponibilidad y enlaces esenciales se renderizan con Liquid. Las imágenes utilizan image_url e image_tag con widths, sizes y dimensiones explícitas. El hero/LCP debe mostrarse sin animación, con carga eager y fetchpriority high; los medios secundarios usan carga diferida. Evitar bucles anidados grandes y preloads indiscriminados.

- https://shopify.dev/docs/api/liquid/objects/product
- https://shopify.dev/docs/storefronts/themes/architecture/templates/json-templates
- https://shopify.dev/docs/storefronts/themes/tools/theme-check/checks/valid-settings-key
- https://shopify.dev/docs/storefronts/themes/best-practices/performance
- https://shopify.dev/docs/storefronts/themes/best-practices/performance/use-responsive-images
- https://shopify.dev/docs/storefronts/themes/best-practices/performance/use-shopify-image-filters-efficiently
- https://shopify.dev/docs/storefronts/themes/best-practices/performance/implement-responsive-design

Los patrones se adaptan a Dolce; no hay datos de conversión que permitan prometer un resultado comercial determinado.
