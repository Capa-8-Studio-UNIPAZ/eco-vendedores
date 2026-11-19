# 🌿 EcoVendedores — Comunidad Universitaria UNIPAZ

Aplicación móvil desarrollada por **Capa8 Studio (UNIPAZ)** para dar visibilidad a los microemprendimientos y vendedores independientes dentro del **Campus Santa Lucía de UNIPAZ**, conectando directamente a estudiantes compradores con puestos locales sin intermediarios ni consumo excesivo de datos móviles.

---

## 📲 Descargar e Instalar en Android (APK v1.0.0)

Puedes instalar la aplicación directamente en cualquier dispositivo Android (no requiere Expo Go ni Google Play Store):

### Opción 1: Enlace directo de descarga (EAS Build)
👉 **[Descargar EcoVendedores v1.0.0 (.apk)](https://expo.dev/accounts/brandvels-team/projects/expoemprendedores/builds/ce48425b-9cae-41ea-b24d-f2799ee96992)**

### Opción 2: Escanear Código QR desde tu celular
Abre la cámara de tu teléfono Android o tu lector QR y escanea el siguiente código para abrir la página de descarga:

![Código QR de descarga EcoVendedores APK](https://api.qrserver.com/v1/create-qr-code/?size=220x220&data=https://expo.dev/accounts/brandvels-team/projects/expoemprendedores/builds/ce48425b-9cae-41ea-b24d-f2799ee96992)

### Pasos de instalación en Android
1. Abre el enlace o escanea el código QR y toca **Install / Download** para bajar el archivo `.apk`.
2. Abre el archivo descargado desde tus notificaciones o la carpeta **Descargas**.
3. Si Android solicita permiso para instalar desde tu navegador o gestor de archivos, actívalo en **Configuración**.
4. Si aparece el aviso estándar de **Google Play Protect** (*"Play Protect no vio una app de este desarrollador antes"*), toca **"Instalar de todas formas"** para completar la instalación.

> 💡 **Cuenta de prueba incluida para vendedores:**  
> En la pestaña **Mi Puesto**, puedes usar el botón rápido **"Entrar como Doña Rosaura"** o ingresar manualmente:  
> **Teléfono:** `3101234567` · **PIN:** `1234`

---

## ✨ Funcionalidades Principales

### 🛍️ Para Estudiantes / Compradores
* **Catálogo Activo (`HU-00`):** Visualización optimizada para pantallas desde `360 dp`, con miniaturas, precio en pesos colombianos (`$ COP`) y badge dinámico de disponibilidad (*Disponible* / *Agotado*).
* **Búsqueda en Tiempo Real (`HU-09`):** Filtrado instantáneo por nombre del producto, ingredientes, vendedor o zona del campus.
* **Filtro por Categorías (`HU-05`):** Chips seleccionables (`Todos`, `Comida`, `Postres`, `Bebidas`, `Papelería`, `Otros`) y conmutador **"Solo disponibles"**.
* **Ubicación Referencial sin GPS (`📍`):** Identificación textual por zonas oficiales de UNIPAZ (*Cafetería Central*, *Plazoleta Bloque B*, *Bloque A*, *Canchas Polideportivas*, *Biblioteca*, *Laboratorios / Talleres*, *Entrada Principal*) para ahorrar batería y operar sin cobertura satelital en edificios.
* **Detalle del Producto y Pedido por WhatsApp (`HU-06`):** Enlace directo a `wa.me/57...` con mensaje prellenado indicando producto, precio y ubicación.
* **Compartir con Compañeros (`HU-10`):** Integración con el menú nativo de Android para difundir productos.

### 🏪 Para Vendedores Independientes
* **Registro y Autenticación (`HU-01`):** Validación estricta de teléfono colombiano de 10 dígitos, PIN de acceso, selección de zona oficial del campus y aceptación explícita de la **Política de Privacidad (Ley 1581 de 2012)**.
* **Control de Apertura del Puesto (`HU-08`):** Interruptor **Abierto 🟢 / Cerrado 🔴** que actualiza automáticamente la disponibilidad de todos los productos del vendedor.
* **Publicación con Cámara o Galería (`HU-02`):** Creación y edición de productos tomando fotos reales o seleccionando desde la galería (`expo-image-picker`).
* **Gestión de Stock en un Toque (`HU-03`):** `Switch` individual por producto para marcarlo disponible o agotado al instante.

---

## 🛠️ Stack Tecnológico

* **Framework:** React Native + Expo (`SDK 58`) con Expo Router (navegación basada en archivos)
* **Lenguaje:** TypeScript (`strict: true`)
* **Persistencia en Tiempo Real y Offline:** Firebase Cloud Firestore (`onSnapshot` en tiempo real) + `@react-native-async-storage/async-storage` (respaldo offline)
* **Multimedia:** `expo-image-picker` y `expo-image-manipulator` (compresión JPEG optimizada)
* **Compilación Cloud:** EAS Build (`com.capa8studio.ecovendedores`)

---

## 📂 Repositorios Oficiales

* **Código fuente completo:** [Capa-8-Studio-UNIPAZ/eco-vendedores](https://github.com/Capa-8-Studio-UNIPAZ/eco-vendedores)
* **Distribución de APK y releases:** [Capa-8-Studio-UNIPAZ/eco-vendedores-apk](https://github.com/Capa-8-Studio-UNIPAZ/eco-vendedores-apk)

---

## 💻 Ejecución en Desarrollo Local

```bash
# 1. Clonar el repositorio fuente
git clone https://github.com/Capa-8-Studio-UNIPAZ/eco-vendedores.git
cd eco-vendedores

# 2. Instalar dependencias
npm install

# 3. Iniciar servidor de desarrollo (Expo Go / Web)
npx expo start

# 4. Verificaciones de calidad
npx tsc --noEmit
npx expo lint
```

---

## 🛡️ Privacidad y Cumplimiento Legal
**EcoVendedores (Capa8 Studio - UNIPAZ)** cumple con la **Ley 1581 de 2012** (Régimen General de Protección de Datos Personales en Colombia). Los datos suministrados por los vendedores se utilizan exclusivamente para facilitar el contacto comercial dentro del campus universitario y pueden ser modificados o eliminados en cualquier momento desde el panel **Mi Puesto**.
