import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Modal,
  Pressable,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { EstadoError } from '@/components/EstadoError';
import { EstadoVacio } from '@/components/EstadoVacio';
import { TarjetaProducto } from '@/components/TarjetaProducto';
import { RepositorioProductos } from '@/services/productRepository';
import {
  CATEGORIAS_OFICIALES,
  CategoriaProducto,
  EscenarioSimulado,
  Producto,
} from '@/types/product';

type FiltroCategoria = 'Todos' | CategoriaProducto;

const CATEGORIAS_FILTRO: FiltroCategoria[] = ['Todos', ...CATEGORIAS_OFICIALES];

const ESCENARIOS_DEBUG: { id: EscenarioSimulado; etiqueta: string; desc: string }[] = [
  {
    id: 'conDatos',
    etiqueta: 'Con datos',
    desc: 'Carga normal desde almacenamiento local AsyncStorage',
  },
  {
    id: 'vacio',
    etiqueta: 'Vacío',
    desc: 'Simula que ningún emprendedor ha publicado hoy',
  },
  {
    id: 'falla',
    etiqueta: 'Falla de red',
    desc: 'Simula caída de conectividad en el campus',
  },
  {
    id: 'cargando',
    etiqueta: 'Cargando infinito',
    desc: 'Mantiene el indicador de carga para pruebas visuales',
  },
];

export default function CatalogoScreen() {
  const [escenario, setEscenario] = useState<EscenarioSimulado>(() =>
    RepositorioProductos.getEscenario()
  );
  const [productos, setProductos] = useState<Producto[]>([]);
  const [cargando, setCargando] = useState<boolean>(true);
  const [refrescando, setRefrescando] = useState<boolean>(false);
  const [mensajeError, setMensajeError] = useState<string | null>(null);
  const [intentoConsulta, setIntentoConsulta] = useState<number>(0);

  // Filtros de comprador (HU-05 y HU-09)
  const [busqueda, setBusqueda] = useState<string>('');
  const [categoriaSeleccionada, setCategoriaSeleccionada] =
    useState<FiltroCategoria>('Todos');
  const [soloDisponibles, setSoloDisponibles] = useState<boolean>(false);

  // Modal oculto de herramientas técnicas / depuración
  const [modalDebugVisible, setModalDebugVisible] = useState<boolean>(false);

  useEffect(() => {
    let cancelado = false;

    if (escenario === 'conDatos') {
      const unsubscribe = RepositorioProductos.suscribirseProductos(
        (resultado) => {
          if (cancelado) {
            return;
          }
          setProductos(resultado);
          setMensajeError(null);
          setCargando(false);
          setRefrescando(false);
        },
        (err) => {
          if (cancelado) {
            return;
          }
          setMensajeError(err.message);
          setCargando(false);
          setRefrescando(false);
        }
      );

      return () => {
        cancelado = true;
        unsubscribe();
      };
    }

    RepositorioProductos.obtenerProductos(escenario)
      .then((resultado) => {
        if (cancelado) {
          return;
        }
        setProductos(resultado);
        setMensajeError(null);
        setCargando(false);
        setRefrescando(false);
      })
      .catch((err: unknown) => {
        if (cancelado) {
          return;
        }
        const textoError =
          err instanceof Error
            ? err.message
            : 'Error de conexión con el catálogo de UNIPAZ';
        setMensajeError(textoError);
        setCargando(false);
        setRefrescando(false);
      });

    return () => {
      cancelado = true;
    };
  }, [escenario, intentoConsulta]);

  useFocusEffect(
    useCallback(() => {
      let activo = true;
      const escenarioActual = RepositorioProductos.getEscenario();

      if (escenarioActual === 'conDatos') {
        RepositorioProductos.obtenerProductos('conDatos')
          .then((lista) => {
            if (activo) {
              setProductos(lista);
            }
          })
          .catch(() => {
            // Mantener estado previo en recarga silenciosa de foco
          });
      }

      return () => {
        activo = false;
      };
    }, [])
  );

  const productosFiltrados = useMemo(() => {
    const termino = busqueda.trim().toLowerCase();

    return productos.filter((item) => {
      if (soloDisponibles && !item.disponible) {
        return false;
      }

      if (
        categoriaSeleccionada !== 'Todos' &&
        item.categoria !== categoriaSeleccionada
      ) {
        return false;
      }

      if (!termino) {
        return true;
      }

      const coincideNombre = item.nombre.toLowerCase().includes(termino);
      const coincideDescripcion = item.descripcion
        .toLowerCase()
        .includes(termino);
      const coincideVendedor = item.vendedor.toLowerCase().includes(termino);
      const coincideUbicacion = item.ubicacion.toLowerCase().includes(termino);

      return (
        coincideNombre ||
        coincideDescripcion ||
        coincideVendedor ||
        coincideUbicacion
      );
    });
  }, [productos, busqueda, categoriaSeleccionada, soloDisponibles]);

  const manejarCambioEscenario = (nuevoEscenario: EscenarioSimulado): void => {
    RepositorioProductos.setEscenario(nuevoEscenario);
    setEscenario(nuevoEscenario);
    setMensajeError(null);
    setRefrescando(false);
    setCargando(true);
    setModalDebugVisible(false);
    setIntentoConsulta((prev) => prev + 1);
  };

  const manejarRestaurarSemilla = async (): Promise<void> => {
    setModalDebugVisible(false);
    setCargando(true);
    setMensajeError(null);
    const restaurados = await RepositorioProductos.restaurarDatosSemilla();
    setEscenario('conDatos');
    setProductos(restaurados);
    setCargando(false);
  };

  const manejarPullToRefresh = (): void => {
    setMensajeError(null);
    setRefrescando(true);
    setIntentoConsulta((prev) => prev + 1);
  };

  const manejarReintentar = (): void => {
    setMensajeError(null);
    setRefrescando(false);
    setCargando(true);
    setIntentoConsulta((prev) => prev + 1);
  };

  const manejarConmutarDisponibilidad = async (id: string): Promise<void> => {
    try {
      const actualizado = await RepositorioProductos.conmutarDisponibilidad(id);
      setProductos((prev) =>
        prev.map((item) => (item.id === id ? actualizado : item))
      );
    } catch {
      // Ignorar si no existe el producto
    }
  };

  const limpiarFiltros = (): void => {
    setBusqueda('');
    setCategoriaSeleccionada('Todos');
    setSoloDisponibles(false);
  };

  const navegarADetalle = (item: Producto): void => {
    router.push(`/producto/${item.id}`);
  };

  const renderizarContenido = (): React.ReactNode => {
    if (cargando) {
      return (
        <View style={styles.estadoCentrado}>
          <ActivityIndicator size="large" color="#2FD27A" />
          <Text style={styles.textoCargando}>
            Cargando catálogo de emprendedores UNIPAZ...
          </Text>
          <Text style={styles.subtextoCargando}>
            Optimizando datos móviles para el campus
          </Text>
        </View>
      );
    }

    if (mensajeError) {
      return (
        <EstadoError
          mensaje={mensajeError}
          onReintentar={manejarReintentar}
        />
      );
    }

    if (productos.length === 0) {
      return (
        <EstadoVacio
          mensaje="Aún no hay productos activos hoy"
          subtitulo="En este momento ningún vendedor independiente reporta stock activo en el campus. Puedes actualizar o publicar tu propio emprendimiento."
          textoBoton="Cargar catálogo disponible"
          onAccion={() => manejarCambioEscenario('conDatos')}
        />
      );
    }

    if (productosFiltrados.length === 0) {
      return (
        <EstadoVacio
          mensaje="Sin resultados para tu filtro"
          subtitulo="No encontramos productos que coincidan con tu búsqueda o categoría seleccionada en este momento."
          textoBoton="Limpiar filtros de búsqueda"
          onAccion={limpiarFiltros}
        />
      );
    }

    return (
      <FlatList
        data={productosFiltrados}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TarjetaProducto
            producto={item}
            onPress={navegarADetalle}
            onToggleDisponibilidad={(id) => {
              void manejarConmutarDisponibilidad(id);
            }}
          />
        )}
        contentContainerStyle={styles.listaContenido}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refrescando}
            onRefresh={manejarPullToRefresh}
            tintColor="#2FD27A"
            colors={['#00963F', '#2FD27A']}
            progressBackgroundColor="#131938"
          />
        }
      />
    );
  };

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      <View style={styles.pantalla}>
        {/* Cabecera Principal con Botón de Engranaje (⚙️) para Modal Oculto */}
        <View style={styles.cabeceraSuperior}>
          <View style={styles.cabeceraTextos}>
            <Text style={styles.tituloApp}>Catálogo UNIPAZ</Text>
            <Text style={styles.subtituloCampus} numberOfLines={1}>
              📍 Ubicación referencial · Campus Santa Lucía
            </Text>
          </View>

          <Pressable
            onPress={() => setModalDebugVisible(true)}
            style={({ pressed }) => [
              styles.botonEngranaje,
              pressed && styles.botonEngranajePressed,
            ]}
            accessibilityRole="button"
            accessibilityLabel="Abrir configuración y simulador de estados"
          >
            <Ionicons name="settings-outline" size={20} color="#A9B2D0" />
          </Pressable>
        </View>

        {/* Barra de Búsqueda en Tiempo Real (HU-09) */}
        <View style={styles.barraBusqueda}>
          <Ionicons name="search-outline" size={18} color="#A9B2D0" />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar empanadas, postres, vendedor o bloque..."
            placeholderTextColor="rgba(169,178,208,0.55)"
            style={styles.inputBusqueda}
            returnKeyType="search"
          />
          {busqueda.length > 0 ? (
            <Pressable
              onPress={() => setBusqueda('')}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel="Limpiar búsqueda"
            >
              <Ionicons name="close-circle" size={19} color="#A9B2D0" />
            </Pressable>
          ) : null}
        </View>

        {/* Filtro Horizontal por Categorías + Chip Solo Disponibles (HU-05) */}
        <View style={styles.contenedorFiltros}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.scrollFiltros}
          >
            <Pressable
              onPress={() => setSoloDisponibles((prev) => !prev)}
              style={[
                styles.chipFiltro,
                soloDisponibles && styles.chipSoloDisponiblesActivo,
              ]}
              accessibilityRole="button"
              accessibilityState={{ selected: soloDisponibles }}
            >
              <View
                style={[
                  styles.puntoDisponibilidad,
                  soloDisponibles
                    ? styles.puntoDisponibilidadActivo
                    : styles.puntoDisponibilidadInactivo,
                ]}
              />
              <Text
                style={[
                  styles.chipFiltroTexto,
                  soloDisponibles && styles.chipFiltroTextoActivo,
                ]}
              >
                Solo disponibles
              </Text>
            </Pressable>

            {CATEGORIAS_FILTRO.map((cat) => {
              const activa = categoriaSeleccionada === cat;
              return (
                <Pressable
                  key={cat}
                  onPress={() => setCategoriaSeleccionada(cat)}
                  style={[styles.chipFiltro, activa && styles.chipFiltroActivo]}
                  accessibilityRole="button"
                  accessibilityState={{ selected: activa }}
                >
                  <Text
                    style={[
                      styles.chipFiltroTexto,
                      activa && styles.chipFiltroTextoActivo,
                    ]}
                  >
                    {cat}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </View>

        {/* Contenedor Principal de Lista / Estados */}
        <View style={styles.contenedorPrincipal}>{renderizarContenido()}</View>

        {/* Modal Oculto de Simulación de Escenarios (accesible desde ⚙️) */}
        <Modal
          visible={modalDebugVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setModalDebugVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalCard}>
              <View style={styles.modalHeader}>
                <View style={styles.modalTituloFila}>
                  <Ionicons name="construct-outline" size={20} color="#2FD27A" />
                  <Text style={styles.modalTitulo}>
                    Simulador de Escenarios
                  </Text>
                </View>
                <Pressable
                  onPress={() => setModalDebugVisible(false)}
                  hitSlop={8}
                  accessibilityRole="button"
                  accessibilityLabel="Cerrar simulador"
                >
                  <Ionicons name="close" size={22} color="#A9B2D0" />
                </Pressable>
              </View>

              <Text style={styles.modalDescripcion}>
                Selecciona un estado de red o datos para verificar el
                comportamiento del catálogo (TEC-LISTA):
              </Text>

              {ESCENARIOS_DEBUG.map((item) => {
                const activo = escenario === item.id;
                return (
                  <Pressable
                    key={item.id}
                    onPress={() => manejarCambioEscenario(item.id)}
                    style={[
                      styles.opcionEscenario,
                      activo && styles.opcionEscenarioActiva,
                    ]}
                  >
                    <View style={styles.opcionTextos}>
                      <Text
                        style={[
                          styles.opcionTitulo,
                          activo && styles.opcionTituloActivo,
                        ]}
                      >
                        {item.etiqueta}
                      </Text>
                      <Text style={styles.opcionSubtitulo}>{item.desc}</Text>
                    </View>
                    <Ionicons
                      name={
                        activo ? 'radio-button-on' : 'radio-button-off'
                      }
                      size={20}
                      color={activo ? '#2FD27A' : '#A9B2D0'}
                    />
                  </Pressable>
                );
              })}

              <Pressable
                onPress={() => {
                  void manejarRestaurarSemilla();
                }}
                style={styles.botonRestaurarSemilla}
              >
                <Ionicons name="refresh-circle-outline" size={19} color="#EEF1FA" />
                <Text style={styles.textoRestaurarSemilla}>
                  Restaurar productos semilla de UNIPAZ
                </Text>
              </Pressable>
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0E1330',
  },
  pantalla: {
    flex: 1,
    backgroundColor: '#0E1330',
    paddingHorizontal: 12,
  },
  cabeceraSuperior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 6,
    paddingBottom: 10,
  },
  cabeceraTextos: {
    flex: 1,
    paddingRight: 8,
  },
  tituloApp: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  subtituloCampus: {
    fontSize: 12,
    color: '#A9B2D0',
    marginTop: 2,
  },
  botonEngranaje: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#131938',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  botonEngranajePressed: {
    opacity: 0.75,
    borderColor: '#2FD27A',
  },
  barraBusqueda: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131938',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    paddingHorizontal: 12,
    height: 44,
    gap: 8,
    marginBottom: 10,
  },
  inputBusqueda: {
    flex: 1,
    fontSize: 13.5,
    color: '#EEF1FA',
    paddingVertical: 0,
  },
  contenedorFiltros: {
    marginBottom: 10,
  },
  scrollFiltros: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    paddingRight: 8,
  },
  chipFiltro: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 999,
    backgroundColor: '#131938',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
  },
  chipFiltroActivo: {
    backgroundColor: '#00963F',
    borderColor: '#2FD27A',
  },
  chipSoloDisponiblesActivo: {
    backgroundColor: 'rgba(0, 150, 63, 0.25)',
    borderColor: '#2FD27A',
  },
  puntoDisponibilidad: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  puntoDisponibilidadActivo: {
    backgroundColor: '#2FD27A',
  },
  puntoDisponibilidadInactivo: {
    backgroundColor: '#A9B2D0',
  },
  chipFiltroTexto: {
    fontSize: 12,
    fontWeight: '600',
    color: '#A9B2D0',
  },
  chipFiltroTextoActivo: {
    color: '#EEF1FA',
    fontWeight: '700',
  },
  contenedorPrincipal: {
    flex: 1,
  },
  estadoCentrado: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  textoCargando: {
    marginTop: 14,
    fontSize: 15,
    fontWeight: '700',
    color: '#EEF1FA',
    textAlign: 'center',
  },
  subtextoCargando: {
    marginTop: 4,
    fontSize: 12,
    color: '#A9B2D0',
    textAlign: 'center',
  },
  listaContenido: {
    paddingBottom: 24,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(6, 9, 24, 0.78)',
    justifyContent: 'center',
    paddingHorizontal: 18,
  },
  modalCard: {
    backgroundColor: '#131938',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.22)',
    padding: 16,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  modalTituloFila: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitulo: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  modalDescripcion: {
    fontSize: 12.5,
    color: '#A9B2D0',
    lineHeight: 18,
    marginBottom: 12,
  },
  opcionEscenario: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#0E1330',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 8,
    gap: 10,
  },
  opcionEscenarioActiva: {
    borderColor: '#2FD27A',
    backgroundColor: 'rgba(0, 150, 63, 0.16)',
  },
  opcionTextos: {
    flex: 1,
  },
  opcionTitulo: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EEF1FA',
  },
  opcionTituloActivo: {
    color: '#2FD27A',
  },
  opcionSubtitulo: {
    fontSize: 11.5,
    color: '#A9B2D0',
    marginTop: 2,
  },
  botonRestaurarSemilla: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginTop: 6,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: 'rgba(160,172,220,0.12)',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.25)',
  },
  textoRestaurarSemilla: {
    fontSize: 13,
    fontWeight: '700',
    color: '#EEF1FA',
  },
});
