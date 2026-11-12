export type EscenarioSimulado = 'conDatos' | 'vacio' | 'falla' | 'cargando';

export type CategoriaProducto =
  | 'Comida'
  | 'Postres'
  | 'Bebidas'
  | 'Papelería'
  | 'Otros';

export const CATEGORIAS_OFICIALES: CategoriaProducto[] = [
  'Comida',
  'Postres',
  'Bebidas',
  'Papelería',
  'Otros',
];

export const PUNTOS_REFERENCIALES_UNIPAZ: string[] = [
  'Cafetería Central',
  'Bloque A',
  'Canchas Polideportivas',
  'Plazoleta Bloque B',
  'Biblioteca',
];

export interface Producto {
  id: string;
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaProducto;
  vendedorId: string;
  vendedor: string;
  telefonoVendedor: string;
  ubicacion: string;
  disponible: boolean;
  imagenUrl: string;
  creadoEn: number;
}

export interface VendedorUsuario {
  id: string;
  nombre: string;
  telefono: string;
  pin: string;
  puntoReferencial: string;
  descripcion: string;
  puestoAbierto: boolean;
}

export interface Vendedor {
  nombre: string;
  telefono: string;
  descripcion: string;
  puntoReferencial: string;
}

export interface NuevoProductoInput {
  nombre: string;
  descripcion: string;
  precio: number;
  categoria: CategoriaProducto;
  vendedorId: string;
  vendedor: string;
  telefonoVendedor: string;
  ubicacion: string;
  disponible?: boolean;
  imagenUrl: string;
}

export interface ActualizarProductoInput {
  nombre?: string;
  descripcion?: string;
  precio?: number;
  categoria?: CategoriaProducto;
  ubicacion?: string;
  disponible?: boolean;
  imagenUrl?: string;
}

export interface RegistroVendedorInput {
  nombre: string;
  telefono: string;
  pin: string;
  puntoReferencial: string;
  descripcion: string;
}

export interface ActualizarPerfilInput {
  nombre: string;
  puntoReferencial: string;
  descripcion: string;
  pin?: string;
}
