import AsyncStorage from '@react-native-async-storage/async-storage';

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
let inicializado = false;

async function asegurarSemillaInicial(): Promise<void> {
  if (inicializado) {
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

    inicializado = true;
  } catch {
    // En caso de error de almacenamiento, operamos con los arreglos semilla
  }
}

async function leerProductosGuardados(): Promise<Producto[]> {
  await asegurarSemillaInicial();
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

async function guardarProductos(productos: Producto[]): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEYS.PRODUCTOS, JSON.stringify(productos));
}

async function leerVendedoresGuardados(): Promise<VendedorUsuario[]> {
  await asegurarSemillaInicial();
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

async function guardarVendedores(vendedores: VendedorUsuario[]): Promise<void> {
  await AsyncStorage.setItem(
    STORAGE_KEYS.VENDEDORES,
    JSON.stringify(vendedores)
  );
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

    return new Promise<Producto[]>((resolve, reject) => {
      setTimeout(async () => {
        if (escenarioEvaluar === 'falla') {
          reject(new Error('Error de conexión con el catálogo de UNIPAZ'));
          return;
        }

        if (escenarioEvaluar === 'vacio') {
          resolve([]);
          return;
        }

        try {
          const productos = await leerProductosGuardados();
          resolve(productos);
        } catch {
          reject(new Error('Error al leer el catálogo local de UNIPAZ'));
        }
      }, 450);
    });
  }

  obtenerProductos(escenario?: EscenarioSimulado): Promise<Producto[]> {
    return RepositorioProductos.obtenerProductos(escenario);
  }

  static async obtenerProductoPorId(id: string): Promise<Producto | null> {
    const productos = await leerProductosGuardados();
    const encontrado = productos.find((item) => item.id === id);
    return encontrado ? { ...encontrado } : null;
  }

  obtenerProductoPorId(id: string): Promise<Producto | null> {
    return RepositorioProductos.obtenerProductoPorId(id);
  }

  static async obtenerProductosPorVendedor(
    vendedorId: string
  ): Promise<Producto[]> {
    const productos = await leerProductosGuardados();
    return productos.filter((item) => item.vendedorId === vendedorId);
  }

  static async crearProducto(nuevo: NuevoProductoInput): Promise<Producto> {
    const productos = await leerProductosGuardados();

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

    const actualizados = [productoCreado, ...productos];
    await guardarProductos(actualizados);
    return productoCreado;
  }

  static async actualizarProducto(
    id: string,
    datos: ActualizarProductoInput
  ): Promise<Producto> {
    const productos = await leerProductosGuardados();
    const indice = productos.findIndex((item) => item.id === id);

    if (indice === -1) {
      throw new Error(`No se encontró el producto con id "${id}"`);
    }

    const actual = productos[indice];
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

    productos[indice] = actualizado;
    await guardarProductos(productos);
    return { ...actualizado };
  }

  static async eliminarProducto(id: string): Promise<void> {
    const productos = await leerProductosGuardados();
    const filtrados = productos.filter((item) => item.id !== id);
    await guardarProductos(filtrados);
  }

  static async conmutarDisponibilidad(id: string): Promise<Producto> {
    const productos = await leerProductosGuardados();
    const indice = productos.findIndex((item) => item.id === id);

    if (indice === -1) {
      throw new Error(`No se encontró el producto con id "${id}"`);
    }

    const actualizado: Producto = {
      ...productos[indice],
      disponible: !productos[indice].disponible,
    };

    productos[indice] = actualizado;
    await guardarProductos(productos);
    return { ...actualizado };
  }

  conmutarDisponibilidad(id: string): Promise<Producto> {
    return RepositorioProductos.conmutarDisponibilidad(id);
  }

  static async restaurarDatosSemilla(): Promise<Producto[]> {
    await guardarVendedores(VENDEDORES_SEMILLA);
    await guardarProductos(PRODUCTOS_MOCK);
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
    const vendedores = await leerVendedoresGuardados();

    const vendedor = vendedores.find(
      (v) => v.telefono === telefonoLimpio && v.pin === pinLimpio
    );

    if (!vendedor) {
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
    const vendedores = await leerVendedoresGuardados();

    const existente = vendedores.find((v) => v.telefono === telefonoLimpio);
    if (existente) {
      throw new Error(
        'Ya existe un vendedor registrado con este número de teléfono. Inicia sesión con tu PIN.'
      );
    }

    const nuevoVendedor: VendedorUsuario = {
      id: `vend-${Date.now()}`,
      nombre: datos.nombre.trim(),
      telefono: telefonoLimpio,
      pin: datos.pin.trim(),
      puntoReferencial: datos.puntoReferencial.trim(),
      descripcion:
        datos.descripcion.trim() ||
        'Emprendimiento activo en el campus de UNIPAZ.',
      puestoAbierto: true,
    };

    const actualizados = [...vendedores, nuevoVendedor];
    await guardarVendedores(actualizados);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(nuevoVendedor)
    );

    return { ...nuevoVendedor };
  }

  static async obtenerSesionActiva(): Promise<VendedorUsuario | null> {
    await asegurarSemillaInicial();
    try {
      const raw = await AsyncStorage.getItem(STORAGE_KEYS.SESION_ACTIVA);
      if (!raw) {
        return null;
      }
      const sesion = JSON.parse(raw) as VendedorUsuario;
      if (!sesion || !sesion.id) {
        return null;
      }
      const vendedores = await leerVendedoresGuardados();
      const actualizado = vendedores.find((v) => v.id === sesion.id);
      return actualizado ? { ...actualizado } : sesion;
    } catch {
      return null;
    }
  }

  static async obtenerVendedorPorId(
    id: string
  ): Promise<VendedorUsuario | null> {
    const vendedores = await leerVendedoresGuardados();
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

    const vendedores = await leerVendedoresGuardados();
    const indice = vendedores.findIndex((v) => v.id === sesion.id);
    if (indice === -1) {
      throw new Error('No se encontró el registro del vendedor.');
    }

    const actualizado: VendedorUsuario = {
      ...vendedores[indice],
      nombre: datos.nombre.trim(),
      puntoReferencial: datos.puntoReferencial.trim(),
      descripcion: datos.descripcion.trim(),
      pin:
        datos.pin && datos.pin.trim().length >= 4
          ? datos.pin.trim()
          : vendedores[indice].pin,
    };

    vendedores[indice] = actualizado;
    await guardarVendedores(vendedores);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(actualizado)
    );

    // Sincronizar nombre comercial en productos del vendedor
    const productos = await leerProductosGuardados();
    let huboCambiosProductos = false;
    const productosSincronizados = productos.map((prod) => {
      if (prod.vendedorId === actualizado.id) {
        huboCambiosProductos = true;
        return {
          ...prod,
          vendedor: actualizado.nombre,
        };
      }
      return prod;
    });

    if (huboCambiosProductos) {
      await guardarProductos(productosSincronizados);
    }

    return { ...actualizado };
  }

  static async conmutarEstadoPuesto(
    abierto: boolean
  ): Promise<VendedorUsuario> {
    const sesion = await AuthService.obtenerSesionActiva();
    if (!sesion) {
      throw new Error('No hay una sesión de vendedor activa.');
    }

    const vendedores = await leerVendedoresGuardados();
    const indice = vendedores.findIndex((v) => v.id === sesion.id);
    if (indice === -1) {
      throw new Error('No se encontró el registro del vendedor.');
    }

    const actualizado: VendedorUsuario = {
      ...vendedores[indice],
      puestoAbierto: abierto,
    };

    vendedores[indice] = actualizado;
    await guardarVendedores(vendedores);
    await AsyncStorage.setItem(
      STORAGE_KEYS.SESION_ACTIVA,
      JSON.stringify(actualizado)
    );

    // Sincronizar disponibilidad de los productos del vendedor al abrir/cerrar puesto
    const productos = await leerProductosGuardados();
    const productosSincronizados = productos.map((prod) => {
      if (prod.vendedorId === actualizado.id) {
        return {
          ...prod,
          disponible: abierto,
        };
      }
      return prod;
    });
    await guardarProductos(productosSincronizados);

    return { ...actualizado };
  }

  static async cerrarSesion(): Promise<void> {
    await AsyncStorage.removeItem(STORAGE_KEYS.SESION_ACTIVA);
  }
}

export const repositorioProductos = new RepositorioProductos();
