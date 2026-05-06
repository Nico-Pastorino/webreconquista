// ─────────────────────────────────────────────────────────────────────────────
// Biblioteca base de imágenes de productos — Store RQTA
//
// TODAS las URLs en este archivo fueron verificadas con HTTP 200.
//
// CDN Apple: store.storeimages.cdn-apple.com
//   shard 4668 → productos 2022–2024
//   shard 4982 → Mac mini M4
//
// Para agregar imágenes locales (Watch, iPhone 17, etc.):
//   1. Guardar el archivo .webp en /public/product-library/
//   2. Agregar una entrada con src: '/product-library/nombre.webp'
// ─────────────────────────────────────────────────────────────────────────────

export type LibraryCategory = 'iphone' | 'ipad' | 'mac' | 'watch' | 'airpods' | 'accesorios'

export interface LibraryImage {
  id: string
  name: string
  category: LibraryCategory
  src: string
  alt: string
}

const S = 'https://store.storeimages.cdn-apple.com'

// iPhone e iPad → PNG con canal alpha (fondo transparente).
// El CDN los sirve con fondo gris en JPEG; como PNG-alpha el fondo es transparente
// y se funde perfectamente con el contenedor blanco.
// Next.js los optimiza a WebP (~10-15 KB para el browser), se descarga el PNG (~60-100 KB)
// solo la primera vez que next/image lo necesita.
function i(id: string) {
  return `${S}/4668/as-images.apple.com/is/${id}?wid=800&hei=800&fmt=png-alpha`
}

// Mac, AirPods y accesorios → JPEG (ya tienen fondo blanco, mix-blend-multiply los fusiona bien)
function a(id: string) {
  return `${S}/4668/as-images.apple.com/is/${id}?wid=800&hei=800&fmt=p-jpg&qlt=80`
}

// shard 4982 — Mac mini M4
function b(id: string) {
  return `${S}/4982/as-images.apple.com/is/${id}?wid=800&hei=800&fmt=p-jpg&qlt=80`
}

export const PRODUCT_IMAGE_LIBRARY: LibraryImage[] = [

  // ═══════════════════════════════════════════════════════════
  // iPHONE  ── VERIFICADOS 200 ─────────────────────────────
  // ═══════════════════════════════════════════════════════════

  // ── iPhone 16 Pro Max (6-9inch) ────────────────────────────
  { id: 'i16pm-black',   name: 'iPhone 16 Pro Max — Titanio Negro',    category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-9inch-blacktitanium'),   alt: 'iPhone 16 Pro Max Titanio Negro' },
  { id: 'i16pm-white',   name: 'iPhone 16 Pro Max — Titanio Blanco',   category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-9inch-whitetitanium'),   alt: 'iPhone 16 Pro Max Titanio Blanco' },
  { id: 'i16pm-natural', name: 'iPhone 16 Pro Max — Titanio Natural',  category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-9inch-naturaltitanium'), alt: 'iPhone 16 Pro Max Titanio Natural' },
  { id: 'i16pm-desert',  name: 'iPhone 16 Pro Max — Titanio Desierto', category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-9inch-deserttitanium'),  alt: 'iPhone 16 Pro Max Titanio Desierto' },

  // ── iPhone 16 Pro (6-3inch) ────────────────────────────────
  { id: 'i16p-black',   name: 'iPhone 16 Pro — Titanio Negro',    category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-3inch-blacktitanium'),   alt: 'iPhone 16 Pro Titanio Negro' },
  { id: 'i16p-white',   name: 'iPhone 16 Pro — Titanio Blanco',   category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-3inch-whitetitanium'),   alt: 'iPhone 16 Pro Titanio Blanco' },
  { id: 'i16p-natural', name: 'iPhone 16 Pro — Titanio Natural',  category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-3inch-naturaltitanium'), alt: 'iPhone 16 Pro Titanio Natural' },
  { id: 'i16p-desert',  name: 'iPhone 16 Pro — Titanio Desierto', category: 'iphone', src: i('iphone-16-pro-finish-select-202409-6-3inch-deserttitanium'),  alt: 'iPhone 16 Pro Titanio Desierto' },

  // ── iPhone 16 Plus (6-7inch) ───────────────────────────────
  { id: 'i16plus-black',       name: 'iPhone 16 Plus — Negro',        category: 'iphone', src: i('iphone-16-finish-select-202409-6-7inch-black'),       alt: 'iPhone 16 Plus Negro' },
  { id: 'i16plus-white',       name: 'iPhone 16 Plus — Blanco',       category: 'iphone', src: i('iphone-16-finish-select-202409-6-7inch-white'),       alt: 'iPhone 16 Plus Blanco' },
  { id: 'i16plus-pink',        name: 'iPhone 16 Plus — Rosa',         category: 'iphone', src: i('iphone-16-finish-select-202409-6-7inch-pink'),        alt: 'iPhone 16 Plus Rosa' },
  { id: 'i16plus-teal',        name: 'iPhone 16 Plus — Azul Verdoso', category: 'iphone', src: i('iphone-16-finish-select-202409-6-7inch-teal'),        alt: 'iPhone 16 Plus Teal' },
  { id: 'i16plus-ultramarine', name: 'iPhone 16 Plus — Ultramarino',  category: 'iphone', src: i('iphone-16-finish-select-202409-6-7inch-ultramarine'), alt: 'iPhone 16 Plus Ultramarino' },

  // ── iPhone 16 (6-1inch) ────────────────────────────────────
  { id: 'i16-black',       name: 'iPhone 16 — Negro',        category: 'iphone', src: i('iphone-16-finish-select-202409-6-1inch-black'),       alt: 'iPhone 16 Negro' },
  { id: 'i16-white',       name: 'iPhone 16 — Blanco',       category: 'iphone', src: i('iphone-16-finish-select-202409-6-1inch-white'),       alt: 'iPhone 16 Blanco' },
  { id: 'i16-pink',        name: 'iPhone 16 — Rosa',         category: 'iphone', src: i('iphone-16-finish-select-202409-6-1inch-pink'),        alt: 'iPhone 16 Rosa' },
  { id: 'i16-teal',        name: 'iPhone 16 — Azul Verdoso', category: 'iphone', src: i('iphone-16-finish-select-202409-6-1inch-teal'),        alt: 'iPhone 16 Teal' },
  { id: 'i16-ultramarine', name: 'iPhone 16 — Ultramarino',  category: 'iphone', src: i('iphone-16-finish-select-202409-6-1inch-ultramarine'), alt: 'iPhone 16 Ultramarino' },

  // ── iPhone 15 Pro Max (6-7inch) ────────────────────────────
  { id: 'i15pm-blue',    name: 'iPhone 15 Pro Max — Titanio Azul',    category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-7inch-bluetitanium'),    alt: 'iPhone 15 Pro Max Titanio Azul' },
  { id: 'i15pm-black',   name: 'iPhone 15 Pro Max — Titanio Negro',   category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-7inch-blacktitanium'),   alt: 'iPhone 15 Pro Max Titanio Negro' },
  { id: 'i15pm-natural', name: 'iPhone 15 Pro Max — Titanio Natural', category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-7inch-naturaltitanium'), alt: 'iPhone 15 Pro Max Titanio Natural' },
  { id: 'i15pm-white',   name: 'iPhone 15 Pro Max — Titanio Blanco',  category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-7inch-whitetitanium'),   alt: 'iPhone 15 Pro Max Titanio Blanco' },

  // ── iPhone 15 Pro (6-1inch) ────────────────────────────────
  { id: 'i15p-blue',    name: 'iPhone 15 Pro — Titanio Azul',    category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-1inch-bluetitanium'),    alt: 'iPhone 15 Pro Titanio Azul' },
  { id: 'i15p-black',   name: 'iPhone 15 Pro — Titanio Negro',   category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-1inch-blacktitanium'),   alt: 'iPhone 15 Pro Titanio Negro' },
  { id: 'i15p-natural', name: 'iPhone 15 Pro — Titanio Natural', category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-1inch-naturaltitanium'), alt: 'iPhone 15 Pro Titanio Natural' },
  { id: 'i15p-white',   name: 'iPhone 15 Pro — Titanio Blanco',  category: 'iphone', src: i('iphone-15-pro-finish-select-202309-6-1inch-whitetitanium'),   alt: 'iPhone 15 Pro Titanio Blanco' },

  // ── iPhone 15 Plus (6-7inch) ───────────────────────────────
  { id: 'i15plus-pink',   name: 'iPhone 15 Plus — Rosa',    category: 'iphone', src: i('iphone-15-finish-select-202309-6-7inch-pink'),   alt: 'iPhone 15 Plus Rosa' },
  { id: 'i15plus-yellow', name: 'iPhone 15 Plus — Amarillo', category: 'iphone', src: i('iphone-15-finish-select-202309-6-7inch-yellow'), alt: 'iPhone 15 Plus Amarillo' },
  { id: 'i15plus-green',  name: 'iPhone 15 Plus — Verde',   category: 'iphone', src: i('iphone-15-finish-select-202309-6-7inch-green'),  alt: 'iPhone 15 Plus Verde' },
  { id: 'i15plus-blue',   name: 'iPhone 15 Plus — Azul',    category: 'iphone', src: i('iphone-15-finish-select-202309-6-7inch-blue'),   alt: 'iPhone 15 Plus Azul' },
  { id: 'i15plus-black',  name: 'iPhone 15 Plus — Negro',   category: 'iphone', src: i('iphone-15-finish-select-202309-6-7inch-black'),  alt: 'iPhone 15 Plus Negro' },

  // ── iPhone 15 (6-1inch) ────────────────────────────────────
  { id: 'i15-pink',   name: 'iPhone 15 — Rosa',    category: 'iphone', src: i('iphone-15-finish-select-202309-6-1inch-pink'),   alt: 'iPhone 15 Rosa' },
  { id: 'i15-yellow', name: 'iPhone 15 — Amarillo', category: 'iphone', src: i('iphone-15-finish-select-202309-6-1inch-yellow'), alt: 'iPhone 15 Amarillo' },
  { id: 'i15-green',  name: 'iPhone 15 — Verde',   category: 'iphone', src: i('iphone-15-finish-select-202309-6-1inch-green'),  alt: 'iPhone 15 Verde' },
  { id: 'i15-blue',   name: 'iPhone 15 — Azul',    category: 'iphone', src: i('iphone-15-finish-select-202309-6-1inch-blue'),   alt: 'iPhone 15 Azul' },
  { id: 'i15-black',  name: 'iPhone 15 — Negro',   category: 'iphone', src: i('iphone-15-finish-select-202309-6-1inch-black'),  alt: 'iPhone 15 Negro' },

  // ── iPhone 14 Pro Max (6-7inch) ────────────────────────────
  { id: 'i14pm-purple',     name: 'iPhone 14 Pro Max — Morado Oscuro',  category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-7inch-deeppurple'), alt: 'iPhone 14 Pro Max Morado Oscuro' },
  { id: 'i14pm-gold',       name: 'iPhone 14 Pro Max — Dorado',         category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-7inch-gold'),        alt: 'iPhone 14 Pro Max Dorado' },
  { id: 'i14pm-silver',     name: 'iPhone 14 Pro Max — Plata',          category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-7inch-silver'),      alt: 'iPhone 14 Pro Max Plata' },
  { id: 'i14pm-spaceblack', name: 'iPhone 14 Pro Max — Negro Espacial', category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-7inch-spaceblack'),  alt: 'iPhone 14 Pro Max Negro Espacial' },

  // ── iPhone 14 Pro (6-1inch) ────────────────────────────────
  { id: 'i14p-purple',     name: 'iPhone 14 Pro — Morado Oscuro',  category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-1inch-deeppurple'), alt: 'iPhone 14 Pro Morado Oscuro' },
  { id: 'i14p-gold',       name: 'iPhone 14 Pro — Dorado',         category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-1inch-gold'),        alt: 'iPhone 14 Pro Dorado' },
  { id: 'i14p-silver',     name: 'iPhone 14 Pro — Plata',          category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-1inch-silver'),      alt: 'iPhone 14 Pro Plata' },
  { id: 'i14p-spaceblack', name: 'iPhone 14 Pro — Negro Espacial', category: 'iphone', src: i('iphone-14-pro-finish-select-202209-6-1inch-spaceblack'),  alt: 'iPhone 14 Pro Negro Espacial' },

  // ── iPhone 14 Plus (6-7inch) ───────────────────────────────
  { id: 'i14plus-blue',      name: 'iPhone 14 Plus — Azul',           category: 'iphone', src: i('iphone-14-finish-select-202209-6-7inch-blue'),      alt: 'iPhone 14 Plus Azul' },
  { id: 'i14plus-purple',    name: 'iPhone 14 Plus — Morado',         category: 'iphone', src: i('iphone-14-finish-select-202209-6-7inch-purple'),    alt: 'iPhone 14 Plus Morado' },
  { id: 'i14plus-midnight',  name: 'iPhone 14 Plus — Medianoche',     category: 'iphone', src: i('iphone-14-finish-select-202209-6-7inch-midnight'),  alt: 'iPhone 14 Plus Medianoche' },
  { id: 'i14plus-starlight', name: 'iPhone 14 Plus — Blanco Estelar', category: 'iphone', src: i('iphone-14-finish-select-202209-6-7inch-starlight'), alt: 'iPhone 14 Plus Blanco Estelar' },
  { id: 'i14plus-yellow',    name: 'iPhone 14 Plus — Amarillo',       category: 'iphone', src: i('iphone-14-finish-select-202209-6-7inch-yellow'),    alt: 'iPhone 14 Plus Amarillo' },

  // ── iPhone 14 (6-1inch) ────────────────────────────────────
  { id: 'i14-blue',      name: 'iPhone 14 — Azul',           category: 'iphone', src: i('iphone-14-finish-select-202209-6-1inch-blue'),      alt: 'iPhone 14 Azul' },
  { id: 'i14-purple',    name: 'iPhone 14 — Morado',         category: 'iphone', src: i('iphone-14-finish-select-202209-6-1inch-purple'),    alt: 'iPhone 14 Morado' },
  { id: 'i14-midnight',  name: 'iPhone 14 — Medianoche',     category: 'iphone', src: i('iphone-14-finish-select-202209-6-1inch-midnight'),  alt: 'iPhone 14 Medianoche' },
  { id: 'i14-starlight', name: 'iPhone 14 — Blanco Estelar', category: 'iphone', src: i('iphone-14-finish-select-202209-6-1inch-starlight'), alt: 'iPhone 14 Blanco Estelar' },
  { id: 'i14-yellow',    name: 'iPhone 14 — Amarillo',       category: 'iphone', src: i('iphone-14-finish-select-202209-6-1inch-yellow'),    alt: 'iPhone 14 Amarillo' },

  // ── iPhone 17 ─────────────────────────────────────────────
  // Las imágenes del iPhone 17 no están disponibles en el CDN público de Apple.
  // Para agregarlas: guardar en /public/product-library/ y descomentar:
  //
  // { id: 'i17-black', name: 'iPhone 17 — Negro', category: 'iphone', src: '/product-library/iphone-17-black.webp', alt: 'iPhone 17 Negro' },
  // { id: 'i17-white', name: 'iPhone 17 — Blanco', category: 'iphone', src: '/product-library/iphone-17-white.webp', alt: 'iPhone 17 Blanco' },
  // { id: 'i17-air-black', name: 'iPhone 17 Air — Negro', category: 'iphone', src: '/product-library/iphone-17-air-black.webp', alt: 'iPhone 17 Air Negro' },
  // { id: 'i17p-black', name: 'iPhone 17 Pro — Negro', category: 'iphone', src: '/product-library/iphone-17-pro-black.webp', alt: 'iPhone 17 Pro Negro' },
  // { id: 'i17pm-black', name: 'iPhone 17 Pro Max — Negro', category: 'iphone', src: '/product-library/iphone-17-pro-max-black.webp', alt: 'iPhone 17 Pro Max Negro' },

  // ═══════════════════════════════════════════════════════════
  // iPAD  ── VERIFICADOS 200 ──────────────────────────────
  // ═══════════════════════════════════════════════════════════

  // ── iPad Pro M4 13" ────────────────────────────────────────
  { id: 'ipadpro13-silver',    name: 'iPad Pro M4 13" — Plata',         category: 'ipad', src: i('ipad-pro-finish-select-202405-13inch-silver'),    alt: 'iPad Pro M4 13 Plata' },
  { id: 'ipadpro13-spacegray', name: 'iPad Pro M4 13" — Gris Espacial', category: 'ipad', src: i('ipad-pro-finish-select-202405-13inch-spacegray'), alt: 'iPad Pro M4 13 Gris Espacial' },

  // ── iPad Pro M4 11" ────────────────────────────────────────
  { id: 'ipadpro11-silver',    name: 'iPad Pro M4 11" — Plata',         category: 'ipad', src: i('ipad-pro-finish-select-202405-11inch-silver'),    alt: 'iPad Pro M4 11 Plata' },
  { id: 'ipadpro11-spacegray', name: 'iPad Pro M4 11" — Gris Espacial', category: 'ipad', src: i('ipad-pro-finish-select-202405-11inch-spacegray'), alt: 'iPad Pro M4 11 Gris Espacial' },

  // ── iPad Air M2 11" ────────────────────────────────────────
  { id: 'ipadair11-blue',      name: 'iPad Air M2 11" — Azul',          category: 'ipad', src: i('ipad-air-select-wifi-blue-202405'),      alt: 'iPad Air M2 11 Azul' },
  { id: 'ipadair11-starlight', name: 'iPad Air M2 11" — Blanco Estelar',category: 'ipad', src: i('ipad-air-select-wifi-starlight-202405'), alt: 'iPad Air M2 11 Blanco Estelar' },
  { id: 'ipadair11-purple',    name: 'iPad Air M2 11" — Morado',        category: 'ipad', src: i('ipad-air-select-wifi-purple-202405'),    alt: 'iPad Air M2 11 Morado' },
  { id: 'ipadair11-spacegray', name: 'iPad Air M2 11" — Gris Espacial', category: 'ipad', src: i('ipad-air-select-wifi-spacegray-202405'), alt: 'iPad Air M2 11 Gris Espacial' },

  // ── iPad mini 7 (2024) ─────────────────────────────────────
  { id: 'ipadmini7-blue',      name: 'iPad mini 7 — Azul',          category: 'ipad', src: i('ipad-mini-select-wifi-blue-202410'),      alt: 'iPad mini 7 Azul' },
  { id: 'ipadmini7-starlight', name: 'iPad mini 7 — Blanco Estelar',category: 'ipad', src: i('ipad-mini-select-wifi-starlight-202410'), alt: 'iPad mini 7 Blanco Estelar' },
  { id: 'ipadmini7-purple',    name: 'iPad mini 7 — Morado',        category: 'ipad', src: i('ipad-mini-select-wifi-purple-202410'),    alt: 'iPad mini 7 Morado' },
  { id: 'ipadmini7-spacegray', name: 'iPad mini 7 — Gris Espacial', category: 'ipad', src: i('ipad-mini-select-wifi-spacegray-202410'), alt: 'iPad mini 7 Gris Espacial' },

  // ═══════════════════════════════════════════════════════════
  // MAC  ── VERIFICADOS 200 ─────────────────────────────────
  // ═══════════════════════════════════════════════════════════

  // ── MacBook Air 13" M2 / M3 ────────────────────────────────
  // (mismo diseño, mismas imágenes — válido para M2 y M3)
  { id: 'mba13-midnight',  name: 'MacBook Air 13" — Medianoche',     category: 'mac', src: a('macbook-air-midnight-select-20220606'),  alt: 'MacBook Air 13 Medianoche' },
  { id: 'mba13-starlight', name: 'MacBook Air 13" — Blanco Estelar', category: 'mac', src: a('macbook-air-starlight-select-20220606'), alt: 'MacBook Air 13 Blanco Estelar' },
  { id: 'mba13-spacegray', name: 'MacBook Air 13" — Gris Espacial',  category: 'mac', src: a('macbook-air-spacegray-select-20220606'), alt: 'MacBook Air 13 Gris Espacial' },

  // ── Mac mini M4 (2024) ─────────────────────────────────────
  { id: 'macmini-m4', name: 'Mac mini M4', category: 'mac', src: b('mac-mini-select-202410'), alt: 'Mac mini M4' },

  // ── MacBook Pro / iMac / Mac Studio ───────────────────────
  // No hay URLs públicas válidas en el CDN para estos modelos.
  // Para agregarlos: guardar en /public/product-library/ y descomentar:
  //
  // { id: 'mbp14-black',  name: 'MacBook Pro 14" — Negro Espacial', category: 'mac', src: '/product-library/macbook-pro-14-black.webp',  alt: 'MacBook Pro 14 Negro Espacial' },
  // { id: 'mbp14-silver', name: 'MacBook Pro 14" — Plata',          category: 'mac', src: '/product-library/macbook-pro-14-silver.webp', alt: 'MacBook Pro 14 Plata' },
  // { id: 'imac-blue',    name: 'iMac M4 — Azul',                   category: 'mac', src: '/product-library/imac-blue.webp',             alt: 'iMac M4 Azul' },

  // ═══════════════════════════════════════════════════════════
  // APPLE WATCH ─────────────────────────────────────────────
  // ═══════════════════════════════════════════════════════════
  //
  // El CDN público de Apple no sirve imágenes de Watch en URLs accesibles.
  // Para agregar Watch: guardar en /public/product-library/ y descomentar:
  //
  // { id: 'watch-s10-silver', name: 'Apple Watch Series 10 — Plata', category: 'watch', src: '/product-library/watch-s10-silver.webp', alt: 'Apple Watch Series 10 Plata' },
  // { id: 'watch-s10-black',  name: 'Apple Watch Series 10 — Negro', category: 'watch', src: '/product-library/watch-s10-black.webp',  alt: 'Apple Watch Series 10 Negro' },
  // { id: 'watch-s9-midnight',name: 'Apple Watch Series 9 — Medianoche', category: 'watch', src: '/product-library/watch-s9-midnight.webp', alt: 'Apple Watch Series 9 Medianoche' },
  // { id: 'watch-ultra2',     name: 'Apple Watch Ultra 2', category: 'watch', src: '/product-library/watch-ultra2.webp', alt: 'Apple Watch Ultra 2' },
  // { id: 'watch-se2',        name: 'Apple Watch SE 2', category: 'watch', src: '/product-library/watch-se2.webp', alt: 'Apple Watch SE 2' },

  // ═══════════════════════════════════════════════════════════
  // AIRPODS  ── VERIFICADOS 200 ───────────────────────────
  // ═══════════════════════════════════════════════════════════

  { id: 'airpods-pro2',       name: 'AirPods Pro 2ª Gen',      category: 'airpods', src: a('MQD83'),                          alt: 'AirPods Pro 2da generación' },
  { id: 'airpods-4',          name: 'AirPods 4',               category: 'airpods', src: a('airpods-4-select-202409'),        alt: 'AirPods 4' },
  { id: 'airpods-4-anc',      name: 'AirPods 4 con ANC',       category: 'airpods', src: a('airpods-4-anc-select-202409'),    alt: 'AirPods 4 con cancelación de ruido' },
  { id: 'amax-midnight',      name: 'AirPods Max — Medianoche',    category: 'airpods', src: a('airpods-max-select-202409-midnight'),  alt: 'AirPods Max Medianoche' },
  { id: 'amax-starlight',     name: 'AirPods Max — Blanco Estelar',category: 'airpods', src: a('airpods-max-select-202409-starlight'), alt: 'AirPods Max Blanco Estelar' },
  { id: 'amax-blue',          name: 'AirPods Max — Azul',          category: 'airpods', src: a('airpods-max-select-202409-blue'),      alt: 'AirPods Max Azul' },
  { id: 'amax-orange',        name: 'AirPods Max — Naranja',       category: 'airpods', src: a('airpods-max-select-202409-orange'),    alt: 'AirPods Max Naranja' },
  { id: 'amax-purple',        name: 'AirPods Max — Morado',        category: 'airpods', src: a('airpods-max-select-202409-purple'),    alt: 'AirPods Max Morado' },

  // ── AirPods 2/3 ───────────────────────────────────────────
  // Para agregarlas: guardar en /public/product-library/ y descomentar:
  //
  // { id: 'airpods-3', name: 'AirPods 3ª Gen', category: 'airpods', src: '/product-library/airpods-3.webp', alt: 'AirPods 3ra generación' },
  // { id: 'airpods-2', name: 'AirPods 2ª Gen', category: 'airpods', src: '/product-library/airpods-2.webp', alt: 'AirPods 2da generación' },

  // ═══════════════════════════════════════════════════════════
  // ACCESORIOS  ── AGREGAR EN /public/product-library/ ──────
  // ═══════════════════════════════════════════════════════════
  //
  // Los accesorios (Apple Pencil, Magic Keyboard, MagSafe, HomePod, etc.)
  // no tienen URLs públicas verificadas en el CDN. Para agregarlos:
  //   1. Descargar imagen oficial de apple.com
  //   2. Convertir a WebP (squoosh.app)
  //   3. Guardar en /public/product-library/
  //   4. Descomentar la entrada correspondiente
  //
  // { id: 'pencil-pro',      name: 'Apple Pencil Pro',     category: 'accesorios', src: '/product-library/apple-pencil-pro.webp',  alt: 'Apple Pencil Pro' },
  // { id: 'magsafe',         name: 'MagSafe Charger',      category: 'accesorios', src: '/product-library/magsafe-charger.webp',   alt: 'MagSafe Charger' },
  // { id: 'magic-keyboard',  name: 'Magic Keyboard',       category: 'accesorios', src: '/product-library/magic-keyboard.webp',    alt: 'Magic Keyboard' },
  // { id: 'homepod-2',       name: 'HomePod 2',            category: 'accesorios', src: '/product-library/homepod-2.webp',         alt: 'HomePod 2' },
  // { id: 'airtag',          name: 'AirTag',               category: 'accesorios', src: '/product-library/airtag.webp',            alt: 'AirTag' },
  // { id: 'apple-tv-4k',     name: 'Apple TV 4K',          category: 'accesorios', src: '/product-library/apple-tv-4k.webp',       alt: 'Apple TV 4K' },
]

// Devuelve la entrada de la biblioteca que coincide con una URL dada
export function findLibraryImageBySrc(src: string | null | undefined): LibraryImage | undefined {
  if (!src) return undefined
  return PRODUCT_IMAGE_LIBRARY.find((img) => img.src === src)
}

export const LIBRARY_CATEGORIES: { value: LibraryCategory | 'all'; label: string }[] = [
  { value: 'all',        label: 'Todos' },
  { value: 'iphone',     label: 'iPhone' },
  { value: 'ipad',       label: 'iPad' },
  { value: 'mac',        label: 'Mac' },
  { value: 'watch',      label: 'Apple Watch' },
  { value: 'airpods',    label: 'AirPods' },
  { value: 'accesorios', label: 'Accesorios' },
]
