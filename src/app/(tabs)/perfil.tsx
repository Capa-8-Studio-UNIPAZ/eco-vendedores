import React, { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { formatearPrecioCOP } from '@/components/TarjetaProducto';
import {
  AuthService,
  RepositorioProductos,
  VENDEDOR_SEMILLA_ROSAURA,
} from '@/services/productRepository';
import {
  CATEGORIAS_OFICIALES,
  CategoriaProducto,
  PUNTOS_REFERENCIALES_UNIPAZ,
  Producto,
  VendedorUsuario,
} from '@/types/product';

type ModoNoAutenticado = 'login' | 'registro';

interface ErroresRegistro {
  nombre?: string;
  telefono?: string;
  pin?: string;
  puntoReferencial?: string;
}

interface ErroresProducto {
  nombre?: string;
  precio?: string;
  ubicacion?: string;
  descripcion?: string;
}

const REGEX_TELEFONO_COLOMBIA = /^\d{10}$/;

const IMAGENES_POR_CATEGORIA: Record<CategoriaProducto, string> = {
  Comida:
    'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=600&q=75',
  Postres:
    'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=600&q=75',
  Bebidas:
    'https://images.unsplash.com/photo-1622597467836-f3285f2131b8?auto=format&fit=crop&w=600&q=75',
  Papelería:
    'https://images.unsplash.com/photo-1456735190827-d1262f71b8a3?auto=format&fit=crop&w=600&q=75',
  Otros:
    'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=600&q=75',
};

export default function PerfilVendedorScreen() {
  const [cargandoSesion, setCargandoSesion] = useState<boolean>(true);
  const [vendedorActivo, setVendedorActivo] = useState<VendedorUsuario | null>(
    null
  );
  const [misProductos, setMisProductos] = useState<Producto[]>([]);

  // Estado Vista No Autenticada (Login / Registro HU-01)
  const [modoAuth, setModoAuth] = useState<ModoNoAutenticado>('login');
  const [loginTelefono, setLoginTelefono] = useState<string>('');
  const [loginPin, setLoginPin] = useState<string>('');
  const [errorLogin, setErrorLogin] = useState<string | null>(null);

  const [regNombre, setRegNombre] = useState<string>('');
  const [regTelefono, setRegTelefono] = useState<string>('');
  const [regPin, setRegPin] = useState<string>('');
  const [regPunto, setRegPunto] = useState<string>('');
  const [regDescripcion, setRegDescripcion] = useState<string>('');
  const [tocadoTelefonoReg, setTocadoTelefonoReg] = useState<boolean>(false);
  const [erroresReg, setErroresReg] = useState<ErroresRegistro>({});

  // Estado Modal Crear / Editar Producto (HU-02)
  const [modalProductoVisible, setModalProductoVisible] =
    useState<boolean>(false);
  const [productoEditandoId, setProductoEditandoId] = useState<string | null>(
    null
  );
  const [prodNombre, setProdNombre] = useState<string>('');
  const [prodCategoria, setProdCategoria] =
    useState<CategoriaProducto>('Comida');
  const [prodPrecio, setProdPrecio] = useState<string>('');
  const [prodUbicacion, setProdUbicacion] = useState<string>('');
  const [prodDescripcion, setProdDescripcion] = useState<string>('');
  const [prodImagenUrl, setProdImagenUrl] = useState<string>('');
  const [prodDisponible, setProdDisponible] = useState<boolean>(true);
  const [erroresProd, setErroresProd] = useState<ErroresProducto>({});

  // Estado Modal Editar Perfil Vendedor
  const [modalPerfilVisible, setModalPerfilVisible] = useState<boolean>(false);
  const [editNombre, setEditNombre] = useState<string>('');
  const [editPunto, setEditPunto] = useState<string>('');
  const [editDescripcion, setEditDescripcion] = useState<string>('');
  const [editPin, setEditPin] = useState<string>('');
  const [errorEditPerfil, setErrorEditPerfil] = useState<string | null>(null);

  const cargarDatosVendedor = useCallback(
    async (vendedor: VendedorUsuario | null): Promise<void> => {
      if (!vendedor) {
        setMisProductos([]);
        return;
      }
      const lista = await RepositorioProductos.obtenerProductosPorVendedor(
        vendedor.id
      );
      setMisProductos(lista);
    },
    []
  );

  useEffect(() => {
    let cancelado = false;

    AuthService.obtenerSesionActiva()
      .then(async (sesion) => {
        if (cancelado) {
          return;
        }
        setVendedorActivo(sesion);
        if (sesion) {
          const lista = await RepositorioProductos.obtenerProductosPorVendedor(
            sesion.id
          );
          if (!cancelado) {
            setMisProductos(lista);
          }
        }
        setCargandoSesion(false);
      })
      .catch(() => {
        if (!cancelado) {
          setCargandoSesion(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, []);

  // --- Acciones de Autenticación ---
  const manejarLogin = async (): Promise<void> => {
    setErrorLogin(null);

    if (!REGEX_TELEFONO_COLOMBIA.test(loginTelefono.trim())) {
      setErrorLogin(
        'Ingresa un número de teléfono válido de 10 dígitos numéricos.'
      );
      return;
    }

    if (loginPin.trim().length < 4) {
      setErrorLogin('Ingresa tu PIN o contraseña (mínimo 4 caracteres).');
      return;
    }

    try {
      const sesion = await AuthService.iniciarSesion(loginTelefono, loginPin);
      setVendedorActivo(sesion);
      await cargarDatosVendedor(sesion);
      setLoginTelefono('');
      setLoginPin('');
    } catch (err: unknown) {
      setErrorLogin(
        err instanceof Error ? err.message : 'No fue posible iniciar sesión.'
      );
    }
  };

  const manejarAccesoDemoRosaura = async (): Promise<void> => {
    setErrorLogin(null);
    try {
      const sesion = await AuthService.iniciarSesion(
        VENDEDOR_SEMILLA_ROSAURA.telefono,
        VENDEDOR_SEMILLA_ROSAURA.pin
      );
      setVendedorActivo(sesion);
      await cargarDatosVendedor(sesion);
    } catch (err: unknown) {
      setErrorLogin(
        err instanceof Error
          ? err.message
          : 'Error al ingresar con la cuenta de demostración.'
      );
    }
  };

  const manejarCambioTelefonoRegistro = (valor: string): void => {
    setRegTelefono(valor);
    setTocadoTelefonoReg(true);
    const limpio = valor.trim();
    if (!limpio) {
      setErroresReg((prev) => ({
        ...prev,
        telefono: 'El número de teléfono WhatsApp es obligatorio.',
      }));
    } else if (!REGEX_TELEFONO_COLOMBIA.test(limpio)) {
      setErroresReg((prev) => ({
        ...prev,
        telefono:
          'Ingresa exactamente 10 dígitos numéricos colombianos (ej. 3104567890).',
      }));
    } else {
      setErroresReg((prev) => ({ ...prev, telefono: undefined }));
    }
  };

  const manejarRegistroVendedor = async (): Promise<void> => {
    setTocadoTelefonoReg(true);
    const nuevosErrores: ErroresRegistro = {};

    if (!regNombre.trim()) {
      nuevosErrores.nombre =
        'El nombre o alias del emprendimiento es obligatorio.';
    }
    if (!regTelefono.trim()) {
      nuevosErrores.telefono = 'El número de teléfono WhatsApp es obligatorio.';
    } else if (!REGEX_TELEFONO_COLOMBIA.test(regTelefono.trim())) {
      nuevosErrores.telefono =
        'Ingresa exactamente 10 dígitos numéricos colombianos (ej. 3104567890).';
    }
    if (regPin.trim().length < 4) {
      nuevosErrores.pin =
        'Define un PIN o contraseña de al menos 4 caracteres.';
    }
    if (!regPunto.trim()) {
      nuevosErrores.puntoReferencial =
        'Selecciona o escribe tu punto referencial en UNIPAZ.';
    }

    setErroresReg(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    try {
      const nuevoVendedor = await AuthService.registrarVendedor({
        nombre: regNombre,
        telefono: regTelefono,
        pin: regPin,
        puntoReferencial: regPunto,
        descripcion: regDescripcion,
      });

      setVendedorActivo(nuevoVendedor);
      await cargarDatosVendedor(nuevoVendedor);

      setRegNombre('');
      setRegTelefono('');
      setRegPin('');
      setRegPunto('');
      setRegDescripcion('');
      setTocadoTelefonoReg(false);
      setErroresReg({});
    } catch (err: unknown) {
      Alert.alert(
        'No se pudo completar el registro',
        err instanceof Error
          ? err.message
          : 'Verifica los datos ingresados e inténtalo de nuevo.'
      );
    }
  };

  const manejarCerrarSesion = async (): Promise<void> => {
    await AuthService.cerrarSesion();
    setVendedorActivo(null);
    setMisProductos([]);
    setModoAuth('login');
  };

  // --- Acciones del Panel de Vendedor (HU-08, HU-02, HU-03) ---
  const manejarConmutarPuesto = async (abierto: boolean): Promise<void> => {
    try {
      const actualizado = await AuthService.conmutarEstadoPuesto(abierto);
      setVendedorActivo(actualizado);
      await cargarDatosVendedor(actualizado);
    } catch {
      Alert.alert(
        'Error',
        'No fue posible actualizar el estado de apertura de tu puesto.'
      );
    }
  };

  const manejarConmutarStockProducto = async (id: string): Promise<void> => {
    try {
      const actualizado = await RepositorioProductos.conmutarDisponibilidad(id);
      setMisProductos((prev) =>
        prev.map((item) => (item.id === id ? actualizado : item))
      );
    } catch {
      Alert.alert(
        'Error',
        'No se pudo actualizar la disponibilidad del producto.'
      );
    }
  };

  const abrirModalNuevoProducto = (): void => {
    if (!vendedorActivo) {
      return;
    }
    setProductoEditandoId(null);
    setProdNombre('');
    setProdCategoria('Comida');
    setProdPrecio('');
    setProdUbicacion(vendedorActivo.puntoReferencial);
    setProdDescripcion('');
    setProdImagenUrl('');
    setProdDisponible(true);
    setErroresProd({});
    setModalProductoVisible(true);
  };

  const abrirModalEditarProducto = (producto: Producto): void => {
    setProductoEditandoId(producto.id);
    setProdNombre(producto.nombre);
    setProdCategoria(producto.categoria);
    setProdPrecio(String(producto.precio));
    setProdUbicacion(producto.ubicacion);
    setProdDescripcion(producto.descripcion);
    setProdImagenUrl(producto.imagenUrl);
    setProdDisponible(producto.disponible);
    setErroresProd({});
    setModalProductoVisible(true);
  };

  const manejarTomarFotoCamara = async (): Promise<void> => {
    try {
      const permiso = await ImagePicker.requestCameraPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'Permiso de cámara requerido',
          'Para tomar fotografías de tus productos, autoriza el acceso a la cámara en los ajustes de tu dispositivo Android.'
        );
        return;
      }

      const resultado = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setProdImagenUrl(resultado.assets[0].uri);
      }
    } catch {
      Alert.alert(
        'Cámara no disponible',
        'No se pudo iniciar la cámara en este dispositivo. Puedes elegir una imagen de tu galería.'
      );
    }
  };

  const manejarElegirDeGaleria = async (): Promise<void> => {
    try {
      const permiso = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (!permiso.granted) {
        Alert.alert(
          'Permiso de galería requerido',
          'Autoriza el acceso a tus fotos para seleccionar una imagen del producto.'
        );
        return;
      }

      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.7,
      });

      if (!resultado.canceled && resultado.assets.length > 0) {
        setProdImagenUrl(resultado.assets[0].uri);
      }
    } catch {
      Alert.alert(
        'Error al abrir galería',
        'No fue posible seleccionar la imagen desde la galería.'
      );
    }
  };

  const manejarGuardarProducto = async (): Promise<void> => {
    if (!vendedorActivo) {
      return;
    }

    const nuevosErrores: ErroresProducto = {};
    const precioNumero = Number(prodPrecio.replace(/\D/g, ''));

    if (!prodNombre.trim()) {
      nuevosErrores.nombre = 'El nombre del producto es obligatorio.';
    }
    if (!prodPrecio.trim() || Number.isNaN(precioNumero) || precioNumero <= 0) {
      nuevosErrores.precio =
        'Ingresa un precio válido en pesos colombianos mayor a $0.';
    }
    if (!prodUbicacion.trim()) {
      nuevosErrores.ubicacion =
        'Indica el punto de referencia donde entregas este producto.';
    }
    if (!prodDescripcion.trim()) {
      nuevosErrores.descripcion =
        'Agrega una breve descripción (ingredientes, tamaño o porción).';
    }

    setErroresProd(nuevosErrores);
    if (Object.keys(nuevosErrores).length > 0) {
      return;
    }

    const imagenFinal =
      prodImagenUrl.trim() || IMAGENES_POR_CATEGORIA[prodCategoria];

    try {
      if (productoEditandoId) {
        await RepositorioProductos.actualizarProducto(productoEditandoId, {
          nombre: prodNombre,
          categoria: prodCategoria,
          precio: precioNumero,
          ubicacion: prodUbicacion,
          descripcion: prodDescripcion,
          imagenUrl: imagenFinal,
          disponible: prodDisponible,
        });
      } else {
        await RepositorioProductos.crearProducto({
          nombre: prodNombre,
          categoria: prodCategoria,
          precio: precioNumero,
          ubicacion: prodUbicacion,
          descripcion: prodDescripcion,
          imagenUrl: imagenFinal,
          disponible: prodDisponible,
          vendedorId: vendedorActivo.id,
          vendedor: vendedorActivo.nombre,
          telefonoVendedor: vendedorActivo.telefono,
        });
      }

      await cargarDatosVendedor(vendedorActivo);
      setModalProductoVisible(false);
    } catch {
      Alert.alert(
        'Error al guardar',
        'No fue posible guardar el producto en el almacenamiento local.'
      );
    }
  };

  const confirmarEliminarProducto = (producto: Producto): void => {
    Alert.alert(
      'Eliminar producto',
      `¿Estás seguro de eliminar "${producto.nombre}" de tu catálogo en UNIPAZ?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Eliminar',
          style: 'destructive',
          onPress: () => {
            void (async () => {
              await RepositorioProductos.eliminarProducto(producto.id);
              await cargarDatosVendedor(vendedorActivo);
            })();
          },
        },
      ]
    );
  };

  const abrirModalEditarPerfil = (): void => {
    if (!vendedorActivo) {
      return;
    }
    setEditNombre(vendedorActivo.nombre);
    setEditPunto(vendedorActivo.puntoReferencial);
    setEditDescripcion(vendedorActivo.descripcion);
    setEditPin('');
    setErrorEditPerfil(null);
    setModalPerfilVisible(true);
  };

  const manejarGuardarEdicionPerfil = async (): Promise<void> => {
    if (!editNombre.trim() || !editPunto.trim()) {
      setErrorEditPerfil(
        'El nombre del emprendimiento y el punto referencial son obligatorios.'
      );
      return;
    }
    if (editPin.trim().length > 0 && editPin.trim().length < 4) {
      setErrorEditPerfil(
        'Si deseas cambiar tu PIN, debe tener al menos 4 caracteres.'
      );
      return;
    }

    try {
      const actualizado = await AuthService.actualizarPerfil({
        nombre: editNombre,
        puntoReferencial: editPunto,
        descripcion: editDescripcion,
        pin: editPin.trim() ? editPin.trim() : undefined,
      });
      setVendedorActivo(actualizado);
      await cargarDatosVendedor(actualizado);
      setModalPerfilVisible(false);
    } catch (err: unknown) {
      setErrorEditPerfil(
        err instanceof Error
          ? err.message
          : 'No se pudo actualizar el perfil.'
      );
    }
  };

  if (cargandoSesion) {
    return (
      <SafeAreaView style={styles.safeArea} edges={['top']}>
        <View style={styles.estadoCentrado}>
          <ActivityIndicator size="large" color="#2FD27A" />
          <Text style={styles.textoCargando}>Cargando tu puesto...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const telefonoRegInvalido =
    Boolean(erroresReg.telefono) ||
    (tocadoTelefonoReg && !REGEX_TELEFONO_COLOMBIA.test(regTelefono.trim()));

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* Cabecera Fija Separada para Evitar Solapamiento al Hacer Scroll */}
      <View style={styles.cabeceraFija}>
        <View style={styles.cabeceraTextos}>
          <Text style={styles.cabeceraTitulo}>
            {vendedorActivo ? 'Panel de Mi Puesto' : 'Portal de Vendedores'}
          </Text>
          <Text style={styles.cabeceraSubtitulo} numberOfLines={1}>
            {vendedorActivo
              ? `Sesión activa · ${vendedorActivo.nombre}`
              : 'Inicia sesión o registra tu emprendimiento en UNIPAZ'}
          </Text>
        </View>
        {vendedorActivo ? (
          <Pressable
            onPress={() => {
              void manejarCerrarSesion();
            }}
            style={styles.botonSalirCabecera}
            accessibilityRole="button"
            accessibilityLabel="Cerrar sesión"
          >
            <Ionicons name="log-out-outline" size={18} color="#EF9A9A" />
            <Text style={styles.textoSalirCabecera}>Salir</Text>
          </Pressable>
        ) : null}
      </View>

      <KeyboardAvoidingView
        style={styles.keyboardContainer}
        behavior="padding"
        keyboardVerticalOffset={Platform.OS === 'ios' ? 12 : 0}
      >
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {!vendedorActivo ? (
            /* =========================================================
               VISTA A: USUARIO NO AUTENTICADO (LOGIN / REGISTRO HU-01)
               ========================================================= */
            <View>
              {/* Selector Segmentado Superior */}
              <View style={styles.selectorSegmentado}>
                <Pressable
                  onPress={() => {
                    setModoAuth('login');
                    setErrorLogin(null);
                  }}
                  style={[
                    styles.tabSegmento,
                    modoAuth === 'login' && styles.tabSegmentoActivo,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: modoAuth === 'login' }}
                >
                  <Ionicons
                    name="log-in-outline"
                    size={16}
                    color={modoAuth === 'login' ? '#EEF1FA' : '#A9B2D0'}
                  />
                  <Text
                    style={[
                      styles.tabSegmentoTexto,
                      modoAuth === 'login' && styles.tabSegmentoTextoActivo,
                    ]}
                  >
                    Iniciar Sesión
                  </Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    setModoAuth('registro');
                    setErrorLogin(null);
                  }}
                  style={[
                    styles.tabSegmento,
                    modoAuth === 'registro' && styles.tabSegmentoActivo,
                  ]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: modoAuth === 'registro' }}
                >
                  <Ionicons
                    name="person-add-outline"
                    size={16}
                    color={modoAuth === 'registro' ? '#EEF1FA' : '#A9B2D0'}
                  />
                  <Text
                    style={[
                      styles.tabSegmentoTexto,
                      modoAuth === 'registro' && styles.tabSegmentoTextoActivo,
                    ]}
                  >
                    Registrarme
                  </Text>
                </Pressable>
              </View>

              {modoAuth === 'login' ? (
                /* --- MODO 1: INICIAR SESIÓN --- */
                <View style={styles.tarjetaFormulario}>
                  <Text style={styles.tituloSeccion}>
                    Ingresa a tu Puesto Universitario
                  </Text>
                  <Text style={styles.descripcionSeccion}>
                    Administra tus productos, precios y disponibilidad en tiempo
                    real para los estudiantes del campus.
                  </Text>

                  {errorLogin ? (
                    <View style={styles.alertaError}>
                      <Ionicons
                        name="alert-circle-outline"
                        size={18}
                        color="#EF5350"
                      />
                      <Text style={styles.alertaErrorTexto}>{errorLogin}</Text>
                    </View>
                  ) : null}

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      Teléfono celular (WhatsApp 10 dígitos)
                    </Text>
                    <TextInput
                      value={loginTelefono}
                      onChangeText={setLoginTelefono}
                      placeholder="Ej. 3101234567"
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      keyboardType="numeric"
                      maxLength={10}
                      style={styles.input}
                    />
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>PIN o Contraseña</Text>
                    <TextInput
                      value={loginPin}
                      onChangeText={setLoginPin}
                      placeholder="Ingresa tu PIN (ej. 1234)"
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      secureTextEntry
                      maxLength={12}
                      style={styles.input}
                    />
                  </View>

                  <Pressable
                    onPress={() => {
                      void manejarLogin();
                    }}
                    style={({ pressed }) => [
                      styles.botonPrimario,
                      pressed && styles.botonPresionado,
                    ]}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="storefront-outline"
                      size={18}
                      color="#EEF1FA"
                    />
                    <Text style={styles.textoBotonPrimario}>
                      Ingresar a mi puesto
                    </Text>
                  </Pressable>

                  <View style={styles.divisorDemo}>
                    <View style={styles.lineaDivisora} />
                    <Text style={styles.textoDivisor}>Acceso Rápido Demo</Text>
                    <View style={styles.lineaDivisora} />
                  </View>

                  <Pressable
                    onPress={() => {
                      void manejarAccesoDemoRosaura();
                    }}
                    style={({ pressed }) => [
                      styles.botonDemoRosaura,
                      pressed && styles.botonPresionado,
                    ]}
                    accessibilityRole="button"
                  >
                    <Ionicons name="sparkles-outline" size={17} color="#2FD27A" />
                    <Text style={styles.textoBotonDemo}>
                      Entrar como Doña Rosaura (3101234567 · PIN 1234)
                    </Text>
                  </Pressable>
                </View>
              ) : (
                /* --- MODO 2: REGISTRARME COMO VENDEDOR (HU-01) --- */
                <View style={styles.tarjetaFormulario}>
                  <Text style={styles.tituloSeccion}>
                    Registro de Nuevo Vendedor (HU-01)
                  </Text>
                  <Text style={styles.descripcionSeccion}>
                    Crea tu cuenta gratuita para publicar tus productos con
                    ubicación referencial en el campus UNIPAZ.
                  </Text>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      Nombre o alias del emprendimiento{' '}
                      <Text style={styles.obligatorio}>*</Text>
                    </Text>
                    <TextInput
                      value={regNombre}
                      onChangeText={(t) => {
                        setRegNombre(t);
                        if (erroresReg.nombre) {
                          setErroresReg((prev) => ({
                            ...prev,
                            nombre: undefined,
                          }));
                        }
                      }}
                      placeholder="Ej. Doña Rosaura / Dulces El Samán"
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      style={[
                        styles.input,
                        Boolean(erroresReg.nombre) && styles.inputError,
                      ]}
                      maxLength={60}
                    />
                    {erroresReg.nombre ? (
                      <Text style={styles.textoError}>{erroresReg.nombre}</Text>
                    ) : null}
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      Teléfono celular (WhatsApp 10 dígitos){' '}
                      <Text style={styles.obligatorio}>*</Text>
                    </Text>
                    <TextInput
                      value={regTelefono}
                      onChangeText={manejarCambioTelefonoRegistro}
                      onBlur={() => setTocadoTelefonoReg(true)}
                      placeholder="Ej. 3104567890"
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      keyboardType="numeric"
                      maxLength={10}
                      style={[
                        styles.input,
                        telefonoRegInvalido && styles.inputError,
                      ]}
                    />
                    {telefonoRegInvalido ? (
                      <Text style={styles.textoError}>
                        {erroresReg.telefono ??
                          'El teléfono debe tener exactamente 10 dígitos numéricos.'}
                      </Text>
                    ) : (
                      <Text style={styles.textoAyuda}>
                        Se usará como tu usuario de acceso y enlace de pedidos
                        por WhatsApp.
                      </Text>
                    )}
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      PIN o Contraseña (mínimo 4 caracteres){' '}
                      <Text style={styles.obligatorio}>*</Text>
                    </Text>
                    <TextInput
                      value={regPin}
                      onChangeText={(t) => {
                        setRegPin(t);
                        if (erroresReg.pin) {
                          setErroresReg((prev) => ({
                            ...prev,
                            pin: undefined,
                          }));
                        }
                      }}
                      placeholder="Ej. 1234"
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      secureTextEntry
                      maxLength={12}
                      style={[
                        styles.input,
                        Boolean(erroresReg.pin) && styles.inputError,
                      ]}
                    />
                    {erroresReg.pin ? (
                      <Text style={styles.textoError}>{erroresReg.pin}</Text>
                    ) : null}
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      Punto de venta referencial en UNIPAZ{' '}
                      <Text style={styles.obligatorio}>*</Text>
                    </Text>
                    <TextInput
                      value={regPunto}
                      onChangeText={(t) => {
                        setRegPunto(t);
                        if (erroresReg.puntoReferencial) {
                          setErroresReg((prev) => ({
                            ...prev,
                            puntoReferencial: undefined,
                          }));
                        }
                      }}
                      placeholder="Ej. Cafetería Central, Bloque A..."
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      style={[
                        styles.input,
                        Boolean(erroresReg.puntoReferencial) &&
                          styles.inputError,
                      ]}
                      maxLength={80}
                    />
                    {erroresReg.puntoReferencial ? (
                      <Text style={styles.textoError}>
                        {erroresReg.puntoReferencial}
                      </Text>
                    ) : null}

                    <View style={styles.sugerenciasContenedor}>
                      {PUNTOS_REFERENCIALES_UNIPAZ.map((punto) => {
                        const seleccionado = regPunto === punto;
                        return (
                          <Pressable
                            key={punto}
                            onPress={() => {
                              setRegPunto(punto);
                              setErroresReg((prev) => ({
                                ...prev,
                                puntoReferencial: undefined,
                              }));
                            }}
                            style={[
                              styles.chipUbicacion,
                              seleccionado && styles.chipUbicacionActivo,
                            ]}
                          >
                            <Text
                              style={[
                                styles.chipUbicacionTexto,
                                seleccionado && styles.chipUbicacionTextoActivo,
                              ]}
                            >
                              📍 {punto}
                            </Text>
                          </Pressable>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.grupoCampo}>
                    <Text style={styles.etiqueta}>
                      Descripción de tus productos y horario
                    </Text>
                    <TextInput
                      value={regDescripcion}
                      onChangeText={setRegDescripcion}
                      placeholder="Ej. Empanadas caseras, jugos naturales y postres de 8:00 a.m. a 4:00 p.m."
                      placeholderTextColor="rgba(169,178,208,0.5)"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                      style={[styles.input, styles.inputMultilinea]}
                      maxLength={220}
                    />
                  </View>

                  <Pressable
                    onPress={() => {
                      void manejarRegistroVendedor();
                    }}
                    style={({ pressed }) => [
                      styles.botonPrimario,
                      pressed && styles.botonPresionado,
                    ]}
                    accessibilityRole="button"
                  >
                    <Ionicons
                      name="checkmark-circle-outline"
                      size={19}
                      color="#EEF1FA"
                    />
                    <Text style={styles.textoBotonPrimario}>
                      Crear mi puesto y entrar
                    </Text>
                  </Pressable>
                </View>
              )}
            </View>
          ) : (
            /* =========================================================
               VISTA B: VENDEDOR AUTENTICADO (PANEL DE CONTROL MI PUESTO)
               ========================================================= */
            <View>
              {/* 1. Cabecera del Puesto y Estado Abierto/Cerrado (HU-08) */}
              <View style={styles.tarjetaPuesto}>
                <View style={styles.filaCabeceraPuesto}>
                  <View style={styles.iconoPuestoCirculo}>
                    <Ionicons name="storefront" size={24} color="#2FD27A" />
                  </View>
                  <View style={styles.infoPuestoTextos}>
                    <Text style={styles.nombrePuesto}>
                      {vendedorActivo.nombre}
                    </Text>
                    <Text style={styles.ubicacionPuesto}>
                      📍 {vendedorActivo.puntoReferencial}
                    </Text>
                    <Text style={styles.telefonoPuesto}>
                      📲 WhatsApp: +57 {vendedorActivo.telefono}
                    </Text>
                  </View>
                </View>

                {vendedorActivo.descripcion ? (
                  <Text style={styles.descripcionPuesto}>
                    {vendedorActivo.descripcion}
                  </Text>
                ) : null}

                {/* Interruptor Destacado Estado del Puesto (HU-08) */}
                <View
                  style={[
                    styles.cajaEstadoPuesto,
                    vendedorActivo.puestoAbierto
                      ? styles.cajaPuestoAbierto
                      : styles.cajaPuestoCerrado,
                  ]}
                >
                  <View style={styles.textosEstadoPuesto}>
                    <Text style={styles.tituloEstadoPuesto}>
                      Estado del Puesto:{' '}
                      <Text
                        style={
                          vendedorActivo.puestoAbierto
                            ? styles.textoAbierto
                            : styles.textoCerrado
                        }
                      >
                        {vendedorActivo.puestoAbierto
                          ? 'Abierto 🟢'
                          : 'Cerrado 🔴'}
                      </Text>
                    </Text>
                    <Text style={styles.subtituloEstadoPuesto}>
                      {vendedorActivo.puestoAbierto
                        ? 'Tus productos aparecen disponibles para pedidos.'
                        : 'Tus productos se marcan como agotados mientras descansas.'}
                    </Text>
                  </View>

                  <Switch
                    value={vendedorActivo.puestoAbierto}
                    onValueChange={(valor) => {
                      void manejarConmutarPuesto(valor);
                    }}
                    trackColor={{
                      false: 'rgba(239, 83, 80, 0.35)',
                      true: 'rgba(0, 150, 63, 0.65)',
                    }}
                    thumbColor={
                      vendedorActivo.puestoAbierto ? '#2FD27A' : '#EF5350'
                    }
                  />
                </View>

                {/* Botones de Acción del Perfil */}
                <View style={styles.filaBotonesPerfil}>
                  <Pressable
                    onPress={abrirModalEditarPerfil}
                    style={styles.botonSecundarioPerfil}
                    accessibilityRole="button"
                  >
                    <Ionicons name="create-outline" size={16} color="#EEF1FA" />
                    <Text style={styles.textoBotonSecundarioPerfil}>
                      Editar Perfil y Ubicación
                    </Text>
                  </Pressable>
                </View>
              </View>

              {/* 2. Gestión de "Mis Productos" (HU-02 y HU-03) */}
              <View style={styles.cabeceraMisProductos}>
                <View>
                  <Text style={styles.tituloMisProductos}>
                    Mis Productos ({misProductos.length})
                  </Text>
                  <Text style={styles.subtituloMisProductos}>
                    Activa o desactiva el stock con un toque (HU-03)
                  </Text>
                </View>
              </View>

              <Pressable
                onPress={abrirModalNuevoProducto}
                style={({ pressed }) => [
                  styles.botonPublicarNuevo,
                  pressed && styles.botonPresionado,
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="add-circle-outline" size={21} color="#EEF1FA" />
                <Text style={styles.textoBotonPublicar}>
                  + Publicar Nuevo Producto
                </Text>
              </Pressable>

              {misProductos.length === 0 ? (
                <View style={styles.cajaSinProductos}>
                  <Ionicons
                    name="basket-outline"
                    size={40}
                    color="#A9B2D0"
                  />
                  <Text style={styles.tituloSinProductos}>
                    Aún no has publicado productos
                  </Text>
                  <Text style={styles.subtituloSinProductos}>
                    Toca el botón &quot;+ Publicar Nuevo Producto&quot; para
                    tomar una foto y aparecer en el catálogo de UNIPAZ.
                  </Text>
                </View>
              ) : (
                misProductos.map((item) => (
                  <View
                    key={item.id}
                    style={[
                      styles.itemProductoVendedor,
                      !item.disponible && styles.itemProductoAgotado,
                    ]}
                  >
                    <View style={styles.filaSuperiorItem}>
                      <Image
                        source={{ uri: item.imagenUrl }}
                        style={styles.miniaturaItem}
                        resizeMode="cover"
                      />

                      <View style={styles.infoItem}>
                        <View style={styles.filaCatSwitch}>
                          <View style={styles.badgeCategoriaMini}>
                            <Text style={styles.badgeCategoriaMiniTexto}>
                              {item.categoria}
                            </Text>
                          </View>

                          <View style={styles.contenedorSwitchItem}>
                            <Text
                              style={[
                                styles.etiquetaSwitchItem,
                                item.disponible
                                  ? styles.etiquetaDisponible
                                  : styles.etiquetaAgotado,
                              ]}
                            >
                              {item.disponible ? 'Disponible' : 'Agotado'}
                            </Text>
                            <Switch
                              value={item.disponible}
                              onValueChange={() => {
                                void manejarConmutarStockProducto(item.id);
                              }}
                              trackColor={{
                                false: 'rgba(239, 83, 80, 0.35)',
                                true: 'rgba(0, 150, 63, 0.65)',
                              }}
                              thumbColor={
                                item.disponible ? '#2FD27A' : '#EF5350'
                              }
                            />
                          </View>
                        </View>

                        <Text style={styles.nombreItem} numberOfLines={2}>
                          {item.nombre}
                        </Text>

                        <Text style={styles.precioItem}>
                          {formatearPrecioCOP(item.precio)}
                        </Text>

                        <Text style={styles.ubicacionItem} numberOfLines={1}>
                          📍 {item.ubicacion}
                        </Text>
                      </View>
                    </View>

                    <View style={styles.filaAccionesItem}>
                      <Pressable
                        onPress={() => abrirModalEditarProducto(item)}
                        style={styles.botonEditarItem}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="create-outline"
                          size={15}
                          color="#EEF1FA"
                        />
                        <Text style={styles.textoAccionItem}>Editar</Text>
                      </Pressable>

                      <Pressable
                        onPress={() => confirmarEliminarProducto(item)}
                        style={styles.botonEliminarItem}
                        accessibilityRole="button"
                      >
                        <Ionicons
                          name="trash-outline"
                          size={15}
                          color="#EF9A9A"
                        />
                        <Text style={styles.textoEliminarItem}>Eliminar</Text>
                      </Pressable>
                    </View>
                  </View>
                ))
              )}
            </View>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      {/* =========================================================
          MODAL 3: CREAR / EDITAR PRODUCTO CON CÁMARA Y GALERÍA (HU-02)
          ========================================================= */}
      <Modal
        visible={modalProductoVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalProductoVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="padding"
        >
          <View style={styles.modalContenedor}>
            <View style={styles.modalCabecera}>
              <Text style={styles.modalTitulo}>
                {productoEditandoId
                  ? 'Editar Producto'
                  : 'Publicar Nuevo Producto'}
              </Text>
              <Pressable
                onPress={() => setModalProductoVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="#A9B2D0" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {/* Fotografía con Cámara / Galería */}
              <Text style={styles.etiqueta}>Fotografía del producto</Text>
              <View style={styles.contenedorPreviewImagen}>
                {prodImagenUrl ? (
                  <Image
                    source={{ uri: prodImagenUrl }}
                    style={styles.imagenPreview}
                    resizeMode="cover"
                  />
                ) : (
                  <View style={styles.placeholderPreview}>
                    <Ionicons name="camera-outline" size={34} color="#A9B2D0" />
                    <Text style={styles.placeholderPreviewTexto}>
                      Toma una foto real o elige de tu galería
                    </Text>
                  </View>
                )}
              </View>

              <View style={styles.filaBotonesFoto}>
                <Pressable
                  onPress={() => {
                    void manejarTomarFotoCamara();
                  }}
                  style={styles.botonFoto}
                  accessibilityRole="button"
                >
                  <Ionicons name="camera" size={17} color="#2FD27A" />
                  <Text style={styles.textoBotonFoto}>Tomar Foto</Text>
                </Pressable>

                <Pressable
                  onPress={() => {
                    void manejarElegirDeGaleria();
                  }}
                  style={styles.botonFoto}
                  accessibilityRole="button"
                >
                  <Ionicons name="images" size={17} color="#2FD27A" />
                  <Text style={styles.textoBotonFoto}>Elegir de Galería</Text>
                </Pressable>
              </View>

              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  O pega una URL de imagen (opcional)
                </Text>
                <TextInput
                  value={prodImagenUrl}
                  onChangeText={setProdImagenUrl}
                  placeholder="https://..."
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  style={styles.input}
                  autoCapitalize="none"
                />
              </View>

              {/* Nombre del Producto */}
              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Nombre del producto <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={prodNombre}
                  onChangeText={(t) => {
                    setProdNombre(t);
                    if (erroresProd.nombre) {
                      setErroresProd((prev) => ({
                        ...prev,
                        nombre: undefined,
                      }));
                    }
                  }}
                  placeholder="Ej. Empanadas de Carne Casera (Porción x2)"
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  style={[
                    styles.input,
                    Boolean(erroresProd.nombre) && styles.inputError,
                  ]}
                  maxLength={70}
                />
                {erroresProd.nombre ? (
                  <Text style={styles.textoError}>{erroresProd.nombre}</Text>
                ) : null}
              </View>

              {/* Categoría */}
              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Categoría <Text style={styles.obligatorio}>*</Text>
                </Text>
                <View style={styles.sugerenciasContenedor}>
                  {CATEGORIAS_OFICIALES.map((cat) => {
                    const activa = prodCategoria === cat;
                    return (
                      <Pressable
                        key={cat}
                        onPress={() => setProdCategoria(cat)}
                        style={[
                          styles.chipUbicacion,
                          activa && styles.chipUbicacionActivo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipUbicacionTexto,
                            activa && styles.chipUbicacionTextoActivo,
                          ]}
                        >
                          {cat}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Precio en COP */}
              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Precio en pesos colombianos (COP){' '}
                  <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={prodPrecio}
                  onChangeText={(t) => {
                    setProdPrecio(t.replace(/\D/g, ''));
                    if (erroresProd.precio) {
                      setErroresProd((prev) => ({
                        ...prev,
                        precio: undefined,
                      }));
                    }
                  }}
                  placeholder="Ej. 3500"
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  keyboardType="numeric"
                  style={[
                    styles.input,
                    Boolean(erroresProd.precio) && styles.inputError,
                  ]}
                  maxLength={7}
                />
                {erroresProd.precio ? (
                  <Text style={styles.textoError}>{erroresProd.precio}</Text>
                ) : null}
              </View>

              {/* Ubicación Referencial */}
              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Ubicación referencial de entrega{' '}
                  <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={prodUbicacion}
                  onChangeText={(t) => {
                    setProdUbicacion(t);
                    if (erroresProd.ubicacion) {
                      setErroresProd((prev) => ({
                        ...prev,
                        ubicacion: undefined,
                      }));
                    }
                  }}
                  placeholder="Ej. Cafetería Central"
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  style={[
                    styles.input,
                    Boolean(erroresProd.ubicacion) && styles.inputError,
                  ]}
                  maxLength={80}
                />
                {erroresProd.ubicacion ? (
                  <Text style={styles.textoError}>{erroresProd.ubicacion}</Text>
                ) : null}

                <View style={styles.sugerenciasContenedor}>
                  {PUNTOS_REFERENCIALES_UNIPAZ.map((punto) => {
                    const seleccionado = prodUbicacion === punto;
                    return (
                      <Pressable
                        key={punto}
                        onPress={() => {
                          setProdUbicacion(punto);
                          setErroresProd((prev) => ({
                            ...prev,
                            ubicacion: undefined,
                          }));
                        }}
                        style={[
                          styles.chipUbicacion,
                          seleccionado && styles.chipUbicacionActivo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipUbicacionTexto,
                            seleccionado && styles.chipUbicacionTextoActivo,
                          ]}
                        >
                          📍 {punto}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              {/* Descripción Detallada */}
              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Descripción detallada (ingredientes / porción){' '}
                  <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={prodDescripcion}
                  onChangeText={(t) => {
                    setProdDescripcion(t);
                    if (erroresProd.descripcion) {
                      setErroresProd((prev) => ({
                        ...prev,
                        descripcion: undefined,
                      }));
                    }
                  }}
                  placeholder="Describe los ingredientes, tamaño de la porción o detalles..."
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={[
                    styles.input,
                    styles.inputMultilinea,
                    Boolean(erroresProd.descripcion) && styles.inputError,
                  ]}
                  maxLength={260}
                />
                {erroresProd.descripcion ? (
                  <Text style={styles.textoError}>
                    {erroresProd.descripcion}
                  </Text>
                ) : null}
              </View>

              <Pressable
                onPress={() => {
                  void manejarGuardarProducto();
                }}
                style={({ pressed }) => [
                  styles.botonPrimario,
                  pressed && styles.botonPresionado,
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="save-outline" size={18} color="#EEF1FA" />
                <Text style={styles.textoBotonPrimario}>
                  {productoEditandoId
                    ? 'Guardar Cambios del Producto'
                    : 'Publicar en Catálogo UNIPAZ'}
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* =========================================================
          MODAL 4: EDITAR PERFIL DE VENDEDOR
          ========================================================= */}
      <Modal
        visible={modalPerfilVisible}
        animationType="slide"
        transparent
        onRequestClose={() => setModalPerfilVisible(false)}
      >
        <KeyboardAvoidingView
          style={styles.modalOverlay}
          behavior="padding"
        >
          <View style={styles.modalContenedor}>
            <View style={styles.modalCabecera}>
              <Text style={styles.modalTitulo}>Editar Perfil del Puesto</Text>
              <Pressable
                onPress={() => setModalPerfilVisible(false)}
                hitSlop={8}
                accessibilityRole="button"
              >
                <Ionicons name="close" size={24} color="#A9B2D0" />
              </Pressable>
            </View>

            <ScrollView
              contentContainerStyle={styles.modalScrollContent}
              keyboardShouldPersistTaps="handled"
              showsVerticalScrollIndicator={false}
            >
              {errorEditPerfil ? (
                <View style={styles.alertaError}>
                  <Ionicons
                    name="alert-circle-outline"
                    size={18}
                    color="#EF5350"
                  />
                  <Text style={styles.alertaErrorTexto}>{errorEditPerfil}</Text>
                </View>
              ) : null}

              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Nombre comercial del puesto{' '}
                  <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={editNombre}
                  onChangeText={setEditNombre}
                  style={styles.input}
                  maxLength={60}
                />
              </View>

              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Punto referencial en UNIPAZ{' '}
                  <Text style={styles.obligatorio}>*</Text>
                </Text>
                <TextInput
                  value={editPunto}
                  onChangeText={setEditPunto}
                  style={styles.input}
                  maxLength={80}
                />
                <View style={styles.sugerenciasContenedor}>
                  {PUNTOS_REFERENCIALES_UNIPAZ.map((punto) => {
                    const seleccionado = editPunto === punto;
                    return (
                      <Pressable
                        key={punto}
                        onPress={() => setEditPunto(punto)}
                        style={[
                          styles.chipUbicacion,
                          seleccionado && styles.chipUbicacionActivo,
                        ]}
                      >
                        <Text
                          style={[
                            styles.chipUbicacionTexto,
                            seleccionado && styles.chipUbicacionTextoActivo,
                          ]}
                        >
                          📍 {punto}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              </View>

              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Descripción y horario de atención
                </Text>
                <TextInput
                  value={editDescripcion}
                  onChangeText={setEditDescripcion}
                  multiline
                  numberOfLines={3}
                  textAlignVertical="top"
                  style={[styles.input, styles.inputMultilinea]}
                  maxLength={220}
                />
              </View>

              <View style={styles.grupoCampo}>
                <Text style={styles.etiqueta}>
                  Nuevo PIN (dejar en blanco para mantener el actual)
                </Text>
                <TextInput
                  value={editPin}
                  onChangeText={setEditPin}
                  placeholder="Mínimo 4 caracteres"
                  placeholderTextColor="rgba(169,178,208,0.5)"
                  secureTextEntry
                  style={styles.input}
                  maxLength={12}
                />
              </View>

              <Pressable
                onPress={() => {
                  void manejarGuardarEdicionPerfil();
                }}
                style={({ pressed }) => [
                  styles.botonPrimario,
                  pressed && styles.botonPresionado,
                ]}
                accessibilityRole="button"
              >
                <Ionicons name="save-outline" size={18} color="#EEF1FA" />
                <Text style={styles.textoBotonPrimario}>
                  Actualizar Datos del Puesto
                </Text>
              </Pressable>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E1330',
  },
  cabeceraFija: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 12,
    backgroundColor: '#0E1330',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160,172,220,0.15)',
  },
  cabeceraTextos: {
    flex: 1,
    paddingRight: 8,
  },
  cabeceraTitulo: {
    fontSize: 19,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  cabeceraSubtitulo: {
    fontSize: 12,
    color: '#A9B2D0',
    marginTop: 2,
  },
  botonSalirCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 83, 80, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.4)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textoSalirCabecera: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EF9A9A',
  },
  keyboardContainer: {
    flex: 1,
    backgroundColor: '#0E1330',
  },
  scroll: {
    flex: 1,
    backgroundColor: '#0E1330',
  },
  scrollContent: {
    paddingHorizontal: 14,
    paddingTop: 16,
    paddingBottom: 40,
  },
  estadoCentrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  textoCargando: {
    marginTop: 10,
    fontSize: 14,
    color: '#EEF1FA',
    fontWeight: '600',
  },
  selectorSegmentado: {
    flexDirection: 'row',
    backgroundColor: '#131938',
    borderRadius: 12,
    padding: 4,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    marginBottom: 14,
  },
  tabSegmento: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 10,
    borderRadius: 9,
  },
  tabSegmentoActivo: {
    backgroundColor: '#00963F',
  },
  tabSegmentoTexto: {
    fontSize: 13,
    fontWeight: '700',
    color: '#A9B2D0',
  },
  tabSegmentoTextoActivo: {
    color: '#EEF1FA',
  },
  tarjetaFormulario: {
    backgroundColor: '#131938',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 15,
  },
  tituloSeccion: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF1FA',
    marginBottom: 4,
  },
  descripcionSeccion: {
    fontSize: 12.5,
    color: '#A9B2D0',
    lineHeight: 18,
    marginBottom: 14,
  },
  alertaError: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(239, 83, 80, 0.15)',
    borderWidth: 1,
    borderColor: '#EF5350',
    borderRadius: 10,
    padding: 10,
    marginBottom: 14,
  },
  alertaErrorTexto: {
    flex: 1,
    fontSize: 12.5,
    fontWeight: '600',
    color: '#EF9A9A',
  },
  grupoCampo: {
    marginBottom: 14,
  },
  etiqueta: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EEF1FA',
    marginBottom: 6,
  },
  obligatorio: {
    color: '#2FD27A',
  },
  input: {
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#EEF1FA',
  },
  inputMultilinea: {
    minHeight: 78,
    paddingTop: 10,
  },
  inputError: {
    borderColor: '#EF5350',
    borderWidth: 1.5,
  },
  textoError: {
    marginTop: 5,
    fontSize: 12,
    color: '#EF5350',
    fontWeight: '600',
  },
  textoAyuda: {
    marginTop: 5,
    fontSize: 11,
    color: '#A9B2D0',
  },
  sugerenciasContenedor: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  chipUbicacion: {
    paddingHorizontal: 9,
    paddingVertical: 5.5,
    borderRadius: 999,
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
  },
  chipUbicacionActivo: {
    backgroundColor: 'rgba(0, 150, 63, 0.24)',
    borderColor: '#2FD27A',
  },
  chipUbicacionTexto: {
    fontSize: 11.5,
    color: '#A9B2D0',
    fontWeight: '600',
  },
  chipUbicacionTextoActivo: {
    color: '#EEF1FA',
    fontWeight: '700',
  },
  botonPrimario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00963F',
    paddingVertical: 13,
    borderRadius: 11,
    marginTop: 4,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  textoBotonPrimario: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  divisorDemo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 14,
  },
  lineaDivisora: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(160,172,220,0.15)',
  },
  textoDivisor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#A9B2D0',
    textTransform: 'uppercase',
  },
  botonDemoRosaura: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 7,
    backgroundColor: 'rgba(0, 150, 63, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.35)',
    paddingVertical: 11,
    paddingHorizontal: 10,
    borderRadius: 10,
  },
  textoBotonDemo: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#2FD27A',
    textAlign: 'center',
    flexShrink: 1,
  },
  /* --- Estilos Panel de Vendedor Autenticado --- */
  tarjetaPuesto: {
    backgroundColor: '#131938',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 14,
    marginBottom: 18,
  },
  filaCabeceraPuesto: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 10,
  },
  iconoPuestoCirculo: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(0, 150, 63, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  infoPuestoTextos: {
    flex: 1,
  },
  nombrePuesto: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  ubicacionPuesto: {
    fontSize: 13,
    color: '#2FD27A',
    fontWeight: '600',
    marginTop: 2,
  },
  telefonoPuesto: {
    fontSize: 12,
    color: '#A9B2D0',
    marginTop: 2,
  },
  descripcionPuesto: {
    fontSize: 12.5,
    color: '#A9B2D0',
    lineHeight: 18,
    marginBottom: 12,
  },
  cajaEstadoPuesto: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    gap: 10,
    marginBottom: 12,
  },
  cajaPuestoAbierto: {
    backgroundColor: 'rgba(0, 150, 63, 0.14)',
    borderColor: 'rgba(47, 210, 122, 0.35)',
  },
  cajaPuestoCerrado: {
    backgroundColor: 'rgba(239, 83, 80, 0.12)',
    borderColor: 'rgba(239, 83, 80, 0.35)',
  },
  textosEstadoPuesto: {
    flex: 1,
  },
  tituloEstadoPuesto: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  textoAbierto: {
    color: '#2FD27A',
  },
  textoCerrado: {
    color: '#EF9A9A',
  },
  subtituloEstadoPuesto: {
    fontSize: 11.5,
    color: '#A9B2D0',
    marginTop: 2,
  },
  filaBotonesPerfil: {
    flexDirection: 'row',
    gap: 8,
  },
  botonSecundarioPerfil: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.2)',
    paddingVertical: 9,
    borderRadius: 9,
  },
  textoBotonSecundarioPerfil: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EEF1FA',
  },
  cabeceraMisProductos: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  tituloMisProductos: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  subtituloMisProductos: {
    fontSize: 12,
    color: '#A9B2D0',
    marginTop: 1,
  },
  botonPublicarNuevo: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#00963F',
    paddingVertical: 13,
    borderRadius: 12,
    marginBottom: 14,
  },
  textoBotonPublicar: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  cajaSinProductos: {
    backgroundColor: '#131938',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 24,
    alignItems: 'center',
  },
  tituloSinProductos: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EEF1FA',
    marginTop: 10,
  },
  subtituloSinProductos: {
    fontSize: 12.5,
    color: '#A9B2D0',
    textAlign: 'center',
    marginTop: 4,
    lineHeight: 18,
  },
  itemProductoVendedor: {
    backgroundColor: '#131938',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 12,
    marginBottom: 12,
  },
  itemProductoAgotado: {
    opacity: 0.72,
  },
  filaSuperiorItem: {
    flexDirection: 'row',
    gap: 11,
  },
  miniaturaItem: {
    width: 72,
    height: 72,
    borderRadius: 10,
    backgroundColor: '#0E1330',
  },
  infoItem: {
    flex: 1,
    minWidth: 0,
  },
  filaCatSwitch: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  badgeCategoriaMini: {
    backgroundColor: 'rgba(160,172,220,0.14)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 5,
  },
  badgeCategoriaMiniTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A9B2D0',
    textTransform: 'uppercase',
  },
  contenedorSwitchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  etiquetaSwitchItem: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  etiquetaDisponible: {
    color: '#2FD27A',
  },
  etiquetaAgotado: {
    color: '#EF9A9A',
  },
  nombreItem: {
    fontSize: 14.5,
    fontWeight: '700',
    color: '#EEF1FA',
    lineHeight: 19,
  },
  precioItem: {
    fontSize: 15,
    fontWeight: '800',
    color: '#2FD27A',
    marginTop: 2,
  },
  ubicacionItem: {
    fontSize: 11.5,
    color: '#A9B2D0',
    marginTop: 2,
  },
  filaAccionesItem: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,172,220,0.12)',
  },
  botonEditarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.22)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textoAccionItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EEF1FA',
  },
  botonEliminarItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(239, 83, 80, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.35)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  textoEliminarItem: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EF9A9A',
  },
  /* --- Estilos Modales --- */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 9, 24, 0.82)',
    justifyContent: 'flex-end',
  },
  modalContenedor: {
    backgroundColor: '#131938',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    borderTopWidth: 1,
    borderColor: 'rgba(160,172,220,0.22)',
    maxHeight: '90%',
  },
  modalCabecera: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160,172,220,0.15)',
  },
  modalTitulo: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  modalScrollContent: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 34,
  },
  contenedorPreviewImagen: {
    width: '100%',
    height: 150,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.2)',
    marginBottom: 10,
  },
  imagenPreview: {
    width: '100%',
    height: '100%',
  },
  placeholderPreview: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  placeholderPreviewTexto: {
    fontSize: 12,
    color: '#A9B2D0',
  },
  filaBotonesFoto: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
  },
  botonFoto: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: 'rgba(0, 150, 63, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.35)',
    paddingVertical: 10,
    borderRadius: 10,
  },
  textoBotonFoto: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#EEF1FA',
  },
});
