import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import { db } from '@/config/firebase';
import {
  ActualizarPerfilInput,
  ActualizarProductoInput,
  EscenarioSimulado,
  NuevoProductoInput,
  Producto,
  RegistroVendedorInput,
  VendedorUsuario,
} from '@/types/product';

const STORAGE_KEYS = {
  PRODUCTOS: '@ecovendedores_unipaz:productos_v2',
  VENDEDORES: '@ecovendedores_unipaz:vendedores_v2',
  SESION_ACTIVA: '@ecovendedores_unipaz:sesion_v2',
} as const;

const COLLECTIONS = {
  PRODUCTOS: 'productos',
  VENDEDORES: 'vendedores',
} as const;

export const VENDEDOR_SEMILLA_ROSAURA: VendedorUsuario = {
  id: 'vend-rosaura',
  nombre: 'Doña Rosaura',
  telefono: '3101234567',
  pin: '1234',
  puntoReferencial: 'Cafetería Central',
  descripcion:
    'Empanadas caseras santandereanas, pasteles de pollo y bebidas naturales. Atención de lunes a viernes de 7:30 a.m. a 3:30 p.m.',
  puestoAbierto: true,
};

export const VENDEDORES_SEMILLA: VendedorUsuario[] = [
  VENDEDOR_SEMILLA_ROSAURA,
  {
    id: 'vend-saman',
    nombre: 'Refrescos El Samán',
    telefono: '3112345678',
    pin: '1234',
    puntoReferencial: 'Canchas Polideportivas',
    descripcion:
      'Jugos naturales de fruta fresca del Magdalena Medio, limonadas frappé y botellas de agua fría.',
    puestoAbierto: true,
  },
  {
    id: 'vend-dulces',
    nombre: 'Dulces Campus UNIPAZ',
    telefono: '3158765432',
    pin: '1234',
    puntoReferencial: 'Bloque A',
    descripcion:
      'Repostería artesanal estudiantil: tortas caseras, brownies melcochudos y arroz con leche.',
    puestoAbierto: true,
  },
  {
    id: 'vend-papeleria',
    nombre: 'Papelería Express Ing.',
    telefono: '3209876543',
    pin: '1234',
    puntoReferencial: 'Plazoleta Bloque B',
    descripcion:
      'Kit de parciales, hojas examen, lapiceros, bata de laboratorio y calculadora científica en alquiler.',
    puestoAbierto: true,
  },
];

export const PRODUCTOS_MOCK: Producto[] = [
  {
    id: 'prod-01',
    nombre: 'Empanadas de Carne Casera (Porción x2)',
    descripcion:
      'Masa de maíz peto crocante rellena de carne desmechada, papa criolla y guiso santandereano. Incluye ají casero y servilletas.',
    precio: 3500,
    categoria: 'Comida',
    vendedorId: 'vend-rosaura',
    vendedor: 'Doña Rosaura',
    telefonoVendedor: '3101234567',
    ubicacion: 'Cafetería Central',
    disponible: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=75',
    creadoEn: 1730000001000,
  },
  {
    id: 'prod-02',
    nombre: 'Arepa Santandereana con Queso Costeño',
    descripcion:
      'Arepa de maíz pelao asada al tiesto con chicharrón molido y lonja generosa de queso costeño fresco recién rallado.',
    precio: 4500,
    categoria: 'Comida',
    vendedorId: 'vend-rosaura',
    vendedor: 'Doña Rosaura',
    telefonoVendedor: '3101234567',
    ubicacion: 'Cafetería Central',
    disponible: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=600&q=75',
    creadoEn: 1730000002000,
  },
  {
    id: 'prod-03',
    nombre: 'Jugo Natural de Lulo en Agua o Leche (16 oz)',
    descripcion:
      'Elaborado con lulo fresco del Magdalena Medio, bajo en azúcar añadido y bien frío para refrescar la jornada académica.',
    precio: 2500,
    categoria: 'Bebidas',
    vendedorId: 'vend-saman',
    vendedor: 'Refrescos El Samán',
    telefonoVendedor: '3112345678',
    ubicacion: 'Canchas Polideportivas',
    disponible: false,
    imagenUrl:
      'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=75',
    creadoEn: 1730000003000,
  },
  {
    id: 'prod-04',
    nombre: 'Torta Casera de Banano y Nuez',
    descripcion:
      'Porción individual horneada artesanalmente con banano maduro orgánico, toque de canela en polvo y trozos de nuez.',
    precio: 4000,
    categoria: 'Postres',
    vendedorId: 'vend-dulces',
    vendedor: 'Dulces Campus UNIPAZ',
    telefonoVendedor: '3158765432',
    ubicacion: 'Bloque A',
    disponible: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=75',
    creadoEn: 1730000004000,
  },
  {
    id: 'prod-05',
    nombre: 'Kit Parcial: 2 Hojas Examen + Lapicero Negro',
    descripcion:
      'Combo salvavidas para exámenes en el bloque: incluye 2 hojas examen cuadriculadas tamaño oficio y bolígrafo de tinta gel.',
    precio: 2000,
    categoria: 'Papelería',
    vendedorId: 'vend-papeleria',
    vendedor: 'Papelería Express Ing.',
    telefonoVendedor: '3209876543',
    ubicacion: 'Plazoleta Bloque B',
    disponible: true,
    imagenUrl:
      'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=75',
    creadoEn: 1730000005000,
  },
];

let escenarioActivo: EscenarioSimulado = 'conDatos';
let semillaLocalLista = false;
let semillaFirestorePromise: Promise<void> | null = null;

async function asegurarSemillaLocal(): Promise<void> {
  if (semillaLocalLista) {
    return;
  }

  try {
    const [productosRaw, vendedoresRaw] = await Promise.all([
      AsyncStorage.getItem(STORAGE_KEYS.PRODUCTOS),
      AsyncStorage.getItem(STORAGE_KEYS.VENDEDORES),
    ]);

    if (!vendedoresRaw) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.VENDEDORES,
        JSON.stringify(VENDEDORES_SEMILLA)
      );
    }

    if (!productosRaw) {
      await AsyncStorage.setItem(
        STORAGE_KEYS.PRODUCTOS,
        JSON.stringify(PRODUCTOS_MOCK)
      );
    }

    semillaLocalLista = true;
  } catch {
    // Operar con los arreglos semilla en memoria si falla AsyncStorage
  }
}

async function leerProductosLocales(): Promise<Producto[]> {
  await asegurarSemillaLocal();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.PRODUCTOS);
    if (!raw) {
      return PRODUCTOS_MOCK.map((p) => ({ ...p }));
    }
    const parsed = JSON.parse(raw) as Producto[];
    if (!Array.isArray(parsed)) {
      return PRODUCTOS_MOCK.map((p) => ({ ...p }));
    }
    return parsed.sort((a, b) => b.creadoEn - a.creadoEn);
  } catch {
    return PRODUCTOS_MOCK.map((p) => ({ ...p }));
  }
}

async function guardarProductosLocales(productos: Producto[]): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.PRODUCTOS,
      JSON.stringify(productos)
    );
  } catch {
    // Silenciar error de caché local
  }
}

async function leerVendedoresLocales(): Promise<VendedorUsuario[]> {
  await asegurarSemillaLocal();
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEYS.VENDEDORES);
    if (!raw) {
      return VENDEDORES_SEMILLA.map((v) => ({ ...v }));
    }
    const parsed = JSON.parse(raw) as VendedorUsuario[];
    if (!Array.isArray(parsed)) {
      return VENDEDORES_SEMILLA.map((v) => ({ ...v }));
    }
    return parsed;
  } catch {
    return VENDEDORES_SEMILLA.map((v) => ({ ...v }));
  }
}

async function guardarVendedoresLocales(
  vendedores: VendedorUsuario[]
): Promise<void> {
  try {
    await AsyncStorage.setItem(
      STORAGE_KEYS.VENDEDORES,
      JSON.stringify(vendedores)
    );
  } catch {
    // Silenciar error de caché local
  }
}

async function asegurarSemillaFirestore(): Promise<void> {
  if (semillaFirestorePromise) {
    return semillaFirestorePromise;
  }

  semillaFirestorePromise = (async () => {
    try {
      const [prodSnap, vendSnap] = await Promise.all([
        getDocs(collection(db, COLLECTIONS.PRODUCTOS)),
        getDocs(collection(db, COLLECTIONS.VENDEDORES)),
      ]);

      const batch = writeBatch(db);
      let hayEscrituras = false;

      if (vendSnap.empty) {
        for (const v of VENDEDORES_SEMILLA) {
          batch.set(doc(db, COLLECTIONS.VENDEDORES, v.id), v);
        }
        hayEscrituras = true;
      }

      if (prodSnap.empty) {
        for (const p of PRODUCTOS_MOCK) {
          batch.set(doc(db, COLLECTIONS.PRODUCTOS, p.id), p);
        }
        hayEscrituras = true;
      }

      if (hayEscrituras) {
        await batch.commit();
      }
    } catch {
      // Si no hay red o Firestore aún no tiene permisos, fallback a AsyncStorage
    } finally {
      semillaFirestorePromise = null;
    }
  })();

  return semillaFirestorePromise;
}

export class RepositorioProductos {
  static setEscenario(nuevoEscenario: EscenarioSimulado): void {
    escenarioActivo = nuevoEscenario;
  }

  static getEscenario(): EscenarioSimulado {
    return escenarioActivo;
  }

  setEscenario(nuevoEscenario: EscenarioSimulado): void {
    RepositorioProductos.setEscenario(nuevoEscenario);
  }

  getEscenario(): EscenarioSimulado {
    return RepositorioProductos.getEscenario();
  }

  static suscribirseProductos(
    onDatos: (productos: Producto[]) => void,
    onError?: (error: Error) => void
  ): () => void {
    let intentoSemilla = false;
    const consulta = query(
      collection(db, COLLECTIONS.PRODUCTOS),
      orderBy('creadoEn', 'desc')
    );

    const unsubscribe = onSnapshot(
      consulta,
      (snapshot) => {
        if (snapshot.empty && !intentoSemilla) {
          intentoSemilla = true;
          void asegurarSemillaFirestore();
          return;
        }

        const productos = snapshot.docs.map(
          (documento) => documento.data() as Producto
        );
        void guardarProductosLocales(productos);
        onDatos(productos);
      },
      async () => {
        try {
          const locales = await leerProductosLocales();
          onDatos(locales);
        } catch {
          if (onError) {
            onError(new Error('Error de conexión con el catálogo de UNIPAZ'));
          }
        }
      }
    );

    return unsubscribe;
  }

  static obtenerProductos(escenario?: EscenarioSimulado): Promise<Producto[]> {
    const escenarioEvaluar = escenario ?? escenarioActivo;

    if (escenario !== undefined) {
      escenarioActivo = escenario;
    }

    if (escenarioEvaluar === 'cargando') {
      return new Promise<Producto[]>(() => {
        // Promesa pendiente indefinida para pruebas del estado cargando
      });
    }

    if (escenarioEvaluar === 'falla') {
      return new Promise<Producto[]>((_, reject) => {
        setTimeout(() => {
          reject(new Error('Error de conexión con el catálogo de UNIPAZ'));
        }, 450);
      });
    }

    if (escenarioEvaluar === 'vacio') {
      return new Promise<Producto[]>((resolve) => {
        setTimeout(() => {
          resolve([]);
        }, 450);
      });
    }

    return (async () => {
      try {
        await asegurarSemillaFirestore();
        const consulta = query(
          collection(db, COLLECTIONS.PRODUCTOS),
          orderBy('creadoEn', 'desc')
        );
        const snap = await getDocs(consulta);
        const productos = snap.docs.map(
          (documento) => documento.data() as Producto
        );
        if (productos.length > 0) {
          await guardarProductosLocales(productos);
          return productos;
        }
      } catch {
        // Resiliencia offline: caer a caché local en AsyncStorage
      }
      return leerProductosLocales();
    })();
  }

  obtenerProductos(escenario?: EscenarioSimulado): Promise<Producto[]> {
    return RepositorioProductos.obtenerProductos(escenario);
  }

  static async obtenerProductoPorId(id: string): Promise<Producto | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.PRODUCTOS, id));
      if (snap.exists()) {
        return snap.data() as Producto;
      }
    } catch {
      // Fallback a caché local si está offline
    }

    const locales = await leerProductosLocales();
    const encontrado = locales.find((item) => item.id === id);
    return encontrado ? { ...encontrado } : null;
  }

  obtenerProductoPorId(id: string): Promise<Producto | null> {
    return RepositorioProductos.obtenerProductoPorId(id);
  }

  static async obtenerProductosPorVendedor(
    vendedorId: string
  ): Promise<Producto[]> {
    try {
      const consulta = query(
        collection(db, COLLECTIONS.PRODUCTOS),
        where('vendedorId', '==', vendedorId)
      );
      const snap = await getDocs(consulta);
      const lista = snap.docs
        .map((documento) => documento.data() as Producto)
        .sort((a, b) => b.creadoEn - a.creadoEn);
      return lista;
    } catch {
      const locales = await leerProductosLocales();
      return locales.filter((item) => item.vendedorId === vendedorId);
    }
  }

  static async crearProducto(nuevo: NuevoProductoInput): Promise<Producto> {
    const productoCreado: Producto = {
      id: `prod-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nombre: nuevo.nombre.trim(),
      descripcion: nuevo.descripcion.trim(),
      precio: Number(nuevo.precio),
      categoria: nuevo.categoria,
      vendedorId: nuevo.vendedorId,
      vendedor: nuevo.vendedor.trim(),
      telefonoVendedor: nuevo.telefonoVendedor.trim(),
      ubicacion: nuevo.ubicacion.trim(),
      disponible: nuevo.disponible ?? true,
      imagenUrl: nuevo.imagenUrl.trim(),
      creadoEn: Date.now(),
    };

    try {
      await setDoc(
        doc(db, COLLECTIONS.PRODUCTOS, productoCreado.id),
        productoCreado
      );
    } catch {
      // Si está sin red, al menos persistir localmente
    }

    const locales = await leerProductosLocales();
    await guardarProductosLocales([productoCreado, ...locales]);
    return productoCreado;
  }

  static async actualizarProducto(
    id: string,
    datos: ActualizarProductoInput
  ): Promise<Producto> {
    const actual = await RepositorioProductos.obtenerProductoPorId(id);

    if (!actual) {
      throw new Error(`No se encontró el producto con id "${id}"`);
    }

    const actualizado: Producto = {
      ...actual,
      nombre:
        datos.nombre !== undefined ? datos.nombre.trim() : actual.nombre,
      descripcion:
        datos.descripcion !== undefined
          ? datos.descripcion.trim()
          : actual.descripcion,
      precio:
        datos.precio !== undefined ? Number(datos.precio) : actual.precio,
      categoria:
        datos.categoria !== undefined ? datos.categoria : actual.categoria,
      ubicacion:
        datos.ubicacion !== undefined
          ? datos.ubicacion.trim()
          : actual.ubicacion,
      disponible:
        datos.disponible !== undefined ? datos.disponible : actual.disponible,
      imagenUrl:
        datos.imagenUrl !== undefined
          ? datos.imagenUrl.trim()
          : actual.imagenUrl,
    };

    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTOS, id), {
        nombre: actualizado.nombre,
        descripcion: actualizado.descripcion,
        precio: actualizado.precio,
        categoria: actualizado.categoria,
        ubicacion: actualizado.ubicacion,
        disponible: actualizado.disponible,
        imagenUrl: actualizado.imagenUrl,
      });
    } catch {
      // Fallback local
    }

    const locales = await leerProductosLocales();
    const actualizadosLocales = locales.map((item) =>
      item.id === id ? actualizado : item
    );
    await guardarProductosLocales(actualizadosLocales);
    return { ...actualizado };
  }

  static async eliminarProducto(id: string): Promise<void> {
    try {
      await deleteDoc(doc(db, COLLECTIONS.PRODUCTOS, id));
    } catch {
      // Fallback local
    }

    const locales = await leerProductosLocales();
    await guardarProductosLocales(locales.filter((item) => item.id !== id));
  }

  static async conmutarDisponibilidad(id: string): Promise<Producto> {
    const actual = await RepositorioProductos.obtenerProductoPorId(id);

    if (!actual) {
      throw new Error(`No se encontró el producto con id "${id}"`);
    }

    const nuevoEstado = !actual.disponible;
    const actualizado: Producto = {
      ...actual,
      disponible: nuevoEstado,
    };

    try {
      await updateDoc(doc(db, COLLECTIONS.PRODUCTOS, id), {
        disponible: nuevoEstado,
      });
    } catch {
      // Fallback local
    }

    const locales = await leerProductosLocales();
    await guardarProductosLocales(
      locales.map((item) => (item.id === id ? actualizado : item))
    );
    return { ...actualizado };
  }

  conmutarDisponibilidad(id: string): Promise<Producto> {
    return RepositorioProductos.conmutarDisponibilidad(id);
  }

  static async restaurarDatosSemilla(): Promise<Producto[]> {
    try {
      const batch = writeBatch(db);
      for (const v of VENDEDORES_SEMILLA) {
        batch.set(doc(db, COLLECTIONS.VENDEDORES, v.id), v);
      }
      for (const p of PRODUCTOS_MOCK) {
        batch.set(doc(db, COLLECTIONS.PRODUCTOS, p.id), p);
      }
      await batch.commit();
    } catch {
      // Continuar con restauración local
    }

    await guardarVendedoresLocales(VENDEDORES_SEMILLA);
    await guardarProductosLocales(PRODUCTOS_MOCK);
    escenarioActivo = 'conDatos';
    return PRODUCTOS_MOCK.map((p) => ({ ...p }));
  }
}

export class AuthService {
  static async iniciarSesion(
    telefono: string,
    pin: string
  ): Promise<VendedorUsuario> {
    const telefonoLimpio = telefono.trim();
    const pinLimpio = pin.trim();
    let vendedor: VendedorUsuario | undefined;

    try {
      await asegurarSemillaFirestore();
      const consulta = query(
        collection(db, COLLECTIONS.VENDEDORES),
        where('telefono', '==', telefonoLimpio)
      );
      const snap = await getDocs(consulta);
      if (!snap.empty) {
        vendedor = snap.docs[0].data() as VendedorUsuario;
      }
    } catch {
      // Fallback offline a caché local
    }

    if (!vendedor) {
      const vendedoresLocales = await leerVendedoresLocales();
      vendedor = vendedoresLocales.find((v) => v.telefono === telefonoLimpio);
    }

    if (!vendedor || vendedor.pin !== pinLimpio) {
      throw new Error(
        'Teléfono o PIN incorrecto. Verifica tus datos o usa el acceso de demostración.'
      );
    }

    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(vendedor)
    );
    return { ...vendedor };
  }

  static async registrarVendedor(
    datos: RegistroVendedorInput
  ): Promise<VendedorUsuario> {
    const telefonoLimpio = datos.telefono.trim();
    let yaExiste = false;

    try {
      await asegurarSemillaFirestore();
      const consulta = query(
        collection(db, COLLECTIONS.VENDEDORES),
        where('telefono', '==', telefonoLimpio)
      );
      const snap = await getDocs(consulta);
      yaExiste = !snap.empty;
    } catch {
      const locales = await leerVendedoresLocales();
      yaExiste = locales.some((v) => v.telefono === telefonoLimpio);
    }

    if (yaExiste) {
      throw new Error(
        'Ya existe un vendedor registrado con este número de teléfono. Inicia sesión con tu PIN.'
      );
    }

    const nuevoVendedor: VendedorUsuario = {
      id: `vend-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      nombre: datos.nombre.trim(),
      telefono: telefonoLimpio,
      pin: datos.pin.trim(),
      puntoReferencial: datos.puntoReferencial.trim(),
      descripcion:
        datos.descripcion.trim() ||
        'Emprendimiento activo en el campus de UNIPAZ.',
      puestoAbierto: true,
    };

    try {
      await setDoc(
        doc(db, COLLECTIONS.VENDEDORES, nuevoVendedor.id),
        nuevoVendedor
      );
    } catch {
      // Continuar con guardado local si está offline
    }

    const locales = await leerVendedoresLocales();
    await guardarVendedoresLocales([...locales, nuevoVendedor]);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(nuevoVendedor)
    );

    return { ...nuevoVendedor };
  }

  static async obtenerSesionActiva(): Promise<VendedorUsuario | null> {
    await asegurarSemillaLocal();
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESION_ACTIVA);
      if (!raw) {
        return null;
      }
      const sesion = JSON.parse(raw) as VendedorUsuario;
      if (!sesion || !sesion.id) {
        return null;
      }

      try {
        const snap = await getDoc(doc(db, COLLECTIONS.VENDEDORES, sesion.id));
        if (snap.exists()) {
          const remoto = snap.data() as VendedorUsuario;
          await AsyncStorage.setItem(
            STORAGE_KEYS.SESION_ACTIVA,
            JSON.stringify(remoto)
          );
          return remoto;
        }
      } catch {
        // Offline: devolver sesión local
      }

      return sesion;
    } catch {
      return null;
    }
  }

  static async obtenerVendedorPorId(
    id: string
  ): Promise<VendedorUsuario | null> {
    try {
      const snap = await getDoc(doc(db, COLLECTIONS.VENDEDORES, id));
      if (snap.exists()) {
        return snap.data() as VendedorUsuario;
      }
    } catch {
      // Fallback a caché local
    }

    const vendedores = await leerVendedoresLocales();
    const encontrado = vendedores.find((v) => v.id === id);
    return encontrado ? { ...encontrado } : null;
  }

  static async actualizarPerfil(
    datos: ActualizarPerfilInput
  ): Promise<VendedorUsuario> {
    const sesion = await AuthService.obtenerSesionActiva();
    if (!sesion) {
      throw new Error('No hay una sesión de vendedor activa.');
    }

    const actualizado: VendedorUsuario = {
      ...sesion,
      nombre: datos.nombre.trim(),
      puntoReferencial: datos.puntoReferencial.trim(),
      descripcion: datos.descripcion.trim(),
      pin:
        datos.pin && datos.pin.trim().length >= 4
          ? datos.pin.trim()
          : sesion.pin,
    };

    try {
      await setDoc(doc(db, COLLECTIONS.VENDEDORES, actualizado.id), actualizado);

      const consultaProd = query(
        collection(db, COLLECTIONS.PRODUCTOS),
        where('vendedorId', '==', actualizado.id)
      );
      const snapProd = await getDocs(consultaProd);
      if (!snapProd.empty) {
        const batch = writeBatch(db);
        for (const docSnap of snapProd.docs) {
          batch.update(docSnap.ref, { vendedor: actualizado.nombre });
        }
        await batch.commit();
      }
    } catch {
      // Fallback local
    }

    const vendedoresLocales = await leerVendedoresLocales();
    await guardarVendedoresLocales(
      vendedoresLocales.map((v) => (v.id === actualizado.id ? actualizado : v))
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(actualizado)
    );

    const productosLocales = await leerProductosLocales();
    await guardarProductosLocales(
      productosLocales.map((prod) =>
        prod.vendedorId === actualizado.id
          ? { ...prod, vendedor: actualizado.nombre }
          : prod
      )
    );

    return { ...actualizado };
  }

  static async conmutarEstadoPuesto(
    abierto: boolean
  ): Promise<VendedorUsuario> {
    const sesion = await AuthService.obtenerSesionActiva();
    if (!sesion) {
      throw new Error('No hay una sesión de vendedor activa.');
    }

    const actualizado: VendedorUsuario = {
      ...sesion,
      puestoAbierto: abierto,
    };

    try {
      await updateDoc(doc(db, COLLECTIONS.VENDEDORES, actualizado.id), {
        puestoAbierto: abierto,
      });

      const consultaProd = query(
        collection(db, COLLECTIONS.PRODUCTOS),
        where('vendedorId', '==', actualizado.id)
      );
      const snapProd = await getDocs(consultaProd);
      if (!snapProd.empty) {
        const batch = writeBatch(db);
        for (const docSnap of snapProd.docs) {
          batch.update(docSnap.ref, { disponible: abierto });
        }
        await batch.commit();
      }
    } catch {
      // Fallback local
    }

    const vendedoresLocales = await leerVendedoresLocales();
    await guardarVendedoresLocales(
      vendedoresLocales.map((v) => (v.id === actualizado.id ? actualizado : v))
    );
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(actualizado)
    );

    const productosLocales = await leerProductosLocales();
    await guardarProductosLocales(
      productosLocales.map((prod) =>
        prod.vendedorId === actualizado.id
          ? { ...prod, disponible: abierto }
          : prod
      )
    );

    return { ...actualizado };
  }

  static async cerrarSesion(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
  }
}

export const repositorioProductos = new RepositorioProductos();
