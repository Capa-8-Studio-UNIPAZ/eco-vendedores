import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Pressable,
  ScrollView,
  Share,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

import { formatearPrecioCOP } from '@/components/TarjetaProducto';
import {
  AuthService,
  RepositorioProductos,
} from '@/services/productRepository';
import { Producto, VendedorUsuario } from '@/types/product';

export default function DetalleProductoScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();

  const [producto, setProducto] = useState<Producto | null>(null);
  const [infoVendedor, setInfoVendedor] = useState<VendedorUsuario | null>(
    null
  );
  const [cargando, setCargando] = useState<boolean>(true);
  const [errorImagen, setErrorImagen] = useState<boolean>(false);

  useEffect(() => {
    let cancelado = false;

    if (!id) {
      return;
    }

    RepositorioProductos.obtenerProductoPorId(id)
      .then(async (encontrado) => {
        if (cancelado) {
          return;
        }
        setProducto(encontrado);
        if (encontrado) {
          const vendedor = await AuthService.obtenerVendedorPorId(
            encontrado.vendedorId
          );
          if (!cancelado) {
            setInfoVendedor(vendedor);
          }
        }
        setCargando(false);
      })
      .catch(() => {
        if (!cancelado) {
          setCargando(false);
        }
      });

    return () => {
      cancelado = true;
    };
  }, [id]);

  const manejarPedirWhatsApp = async (): Promise<void> => {
    if (!producto || !producto.disponible) {
      return;
    }

    const telefonoLimpio = (producto.telefonoVendedor || '3101234567').replace(
      /\D/g,
      ''
    );
    const mensaje = encodeURIComponent(
      `Hola ${producto.vendedor}, te escribo desde EcoVendedores UNIPAZ. Quiero pedir "${producto.nombre}" por ${formatearPrecioCOP(
        producto.precio
      )} (📍 Punto de entrega: ${producto.ubicacion}). ¿Me confirmas disponibilidad?`
    );
    const url = `https://wa.me/57${telefonoLimpio}?text=${mensaje}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'No se pudo abrir WhatsApp',
        `Puedes comunicarte directamente con ${producto.vendedor} al número +57 ${telefonoLimpio} en ${producto.ubicacion}.`
      );
    }
  };

  const manejarCompartir = async (): Promise<void> => {
    if (!producto) {
      return;
    }

    const textoCompartir =
      `🌿 *EcoVendedores UNIPAZ*\n` +
      `🛍️ *${producto.nombre}* (${producto.categoria})\n` +
      `💰 Precio: ${formatearPrecioCOP(producto.precio)}\n` +
      `📝 ${producto.descripcion}\n` +
      `👤 Vendedor: ${producto.vendedor}\n` +
      `📍 Ubicación en el campus: ${producto.ubicacion}\n` +
      `📲 WhatsApp: https://wa.me/57${producto.telefonoVendedor}`;

    try {
      await Share.share({
        title: `${producto.nombre} - EcoVendedores UNIPAZ`,
        message: textoCompartir,
      });
    } catch {
      Alert.alert(
        'Error al compartir',
        'No fue posible abrir el menú nativo para compartir este producto.'
      );
    }
  };

  if (cargando) {
    return (
      <View style={styles.estadoCentrado}>
        <ActivityIndicator size="large" color="#2FD27A" />
        <Text style={styles.textoEstado}>Cargando detalle del producto...</Text>
      </View>
    );
  }

  if (!producto) {
    return (
      <View style={styles.estadoCentrado}>
        <Ionicons name="alert-circle-outline" size={48} color="#EF5350" />
        <Text style={styles.tituloNoEncontrado}>Producto no encontrado</Text>
        <Text style={styles.subtituloNoEncontrado}>
          Es posible que el vendedor haya retirado este producto del catálogo.
        </Text>
        <Pressable
          onPress={() => router.back()}
          style={styles.botonVolver}
          accessibilityRole="button"
        >
          <Ionicons name="arrow-back" size={18} color="#EEF1FA" />
          <Text style={styles.botonVolverTexto}>Volver al catálogo</Text>
        </Pressable>
      </View>
    );
  }

  return (
    <View style={styles.pantalla}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Imagen Destacada en Alta Resolución */}
        <View style={styles.contenedorImagen}>
          {!errorImagen && producto.imagenUrl ? (
            <Image
              source={{ uri: producto.imagenUrl }}
              style={styles.imagenHero}
              resizeMode="cover"
              onError={() => setErrorImagen(true)}
            />
          ) : (
            <View style={styles.placeholderHero}>
              <Ionicons name="fast-food-outline" size={56} color="#A9B2D0" />
              <Text style={styles.placeholderHeroTexto}>
                EcoVendedores · Campus UNIPAZ
              </Text>
            </View>
          )}
        </View>

        <View style={styles.cuerpo}>
          {/* Fila de Insignias: Categoría y Estado de Disponibilidad */}
          <View style={styles.filaBadges}>
            <View style={styles.badgeCategoria}>
              <Ionicons name="pricetag-outline" size={13} color="#2FD27A" />
              <Text style={styles.badgeCategoriaTexto}>
                {producto.categoria}
              </Text>
            </View>

            <View
              style={[
                styles.badgeEstado,
                producto.disponible
                  ? styles.badgeEstadoDisponible
                  : styles.badgeEstadoAgotado,
              ]}
            >
              <View
                style={[
                  styles.puntoIndicador,
                  producto.disponible
                    ? styles.puntoDisponible
                    : styles.puntoAgotado,
                ]}
              />
              <Text
                style={[
                  styles.badgeEstadoTexto,
                  producto.disponible
                    ? styles.badgeEstadoTextoDisponible
                    : styles.badgeEstadoTextoAgotado,
                ]}
              >
                {producto.disponible
                  ? 'Disponible ahora'
                  : 'Agotado temporalmente'}
              </Text>
            </View>
          </View>

          {/* Nombre Completo y Precio */}
          <Text style={styles.nombreProducto}>{producto.nombre}</Text>
          <Text style={styles.precioProducto}>
            {formatearPrecioCOP(producto.precio)}
          </Text>

          {/* Descripción Completa */}
          <View style={styles.seccionDescripcion}>
            <Text style={styles.etiquetaSeccion}>
              Descripción e ingredientes
            </Text>
            <Text style={styles.descripcionCompleta}>
              {producto.descripcion}
            </Text>
          </View>

          {/* Tarjeta Informativa del Vendedor */}
          <View style={styles.tarjetaVendedor}>
            <View style={styles.encabezadoVendedor}>
              <View style={styles.avatarVendedor}>
                <Ionicons name="storefront" size={22} color="#2FD27A" />
              </View>
              <View style={styles.textosVendedor}>
                <Text style={styles.etiquetaVendedor}>
                  Emprendimiento Universitario
                </Text>
                <Text style={styles.nombreVendedor}>{producto.vendedor}</Text>
              </View>
            </View>

            <View style={styles.separador} />

            <View style={styles.filaDatoVendedor}>
              <Text style={styles.iconoPin}>📍</Text>
              <View style={styles.columnaDato}>
                <Text style={styles.etiquetaDato}>
                  Ubicación referencial en el campus
                </Text>
                <Text style={styles.valorDato}>{producto.ubicacion}</Text>
              </View>
            </View>

            <View style={styles.filaDatoVendedor}>
              <Ionicons
                name="call-outline"
                size={16}
                color="#2FD27A"
                style={styles.iconoContacto}
              />
              <View style={styles.columnaDato}>
                <Text style={styles.etiquetaDato}>Contacto WhatsApp</Text>
                <Text style={styles.valorDato}>
                  +57 {producto.telefonoVendedor}
                </Text>
              </View>
            </View>

            {infoVendedor?.descripcion ? (
              <View style={styles.bloqueHorario}>
                <Text style={styles.etiquetaDato}>
                  Acerca del puesto y horario
                </Text>
                <Text style={styles.textoHorario}>
                  {infoVendedor.descripcion}
                </Text>
              </View>
            ) : null}
          </View>
        </View>
      </ScrollView>

      {/* Barra Inferior Fija con Botones de Acción (HU-06 y HU-10) */}
      <View style={styles.barraAccionesInferior}>
        <Pressable
          onPress={() => {
            void manejarCompartir();
          }}
          style={({ pressed }) => [
            styles.botonCompartir,
            pressed && styles.botonPresionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel="Compartir producto con compañeros"
        >
          <Ionicons name="share-social-outline" size={20} color="#EEF1FA" />
          <Text style={styles.textoCompartir}>Compartir</Text>
        </Pressable>

        <Pressable
          onPress={() => {
            void manejarPedirWhatsApp();
          }}
          disabled={!producto.disponible}
          style={({ pressed }) => [
            styles.botonWhatsAppPrincipal,
            !producto.disponible && styles.botonWhatsAppDeshabilitado,
            pressed && producto.disponible && styles.botonPresionado,
          ]}
          accessibilityRole="button"
          accessibilityState={{ disabled: !producto.disponible }}
          accessibilityLabel={
            producto.disponible
              ? `Pedir ${producto.nombre} por WhatsApp`
              : 'Producto agotado'
          }
        >
          <Ionicons
            name="logo-whatsapp"
            size={20}
            color={producto.disponible ? '#EEF1FA' : '#A9B2D0'}
          />
          <Text
            style={[
              styles.textoWhatsAppPrincipal,
              !producto.disponible && styles.textoWhatsAppDeshabilitado,
            ]}
          >
            {producto.disponible ? 'Pedir por WhatsApp' : 'Producto Agotado'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: '#0E1330',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 28,
  },
  estadoCentrado: {
    flex: 1,
    backgroundColor: '#0E1330',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  textoEstado: {
    marginTop: 12,
    fontSize: 15,
    fontWeight: '600',
    color: '#EEF1FA',
  },
  tituloNoEncontrado: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EEF1FA',
    marginTop: 12,
  },
  subtituloNoEncontrado: {
    fontSize: 13.5,
    color: '#A9B2D0',
    textAlign: 'center',
    marginTop: 6,
    marginBottom: 18,
  },
  botonVolver: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00963F',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  botonVolverTexto: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EEF1FA',
  },
  contenedorImagen: {
    width: '100%',
    height: 230,
    backgroundColor: '#131938',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(160,172,220,0.15)',
  },
  imagenHero: {
    width: '100%',
    height: '100%',
  },
  placeholderHero: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131938',
    gap: 8,
  },
  placeholderHeroTexto: {
    fontSize: 13,
    fontWeight: '600',
    color: '#A9B2D0',
  },
  cuerpo: {
    paddingHorizontal: 14,
    paddingTop: 16,
  },
  filaBadges: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  badgeCategoria: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#131938',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  badgeCategoriaTexto: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EEF1FA',
  },
  badgeEstado: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
    borderWidth: 1,
  },
  badgeEstadoDisponible: {
    backgroundColor: 'rgba(0, 150, 63, 0.2)',
    borderColor: '#00963F',
  },
  badgeEstadoAgotado: {
    backgroundColor: 'rgba(220, 68, 68, 0.16)',
    borderColor: 'rgba(239, 83, 80, 0.5)',
  },
  puntoIndicador: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  puntoDisponible: {
    backgroundColor: '#2FD27A',
  },
  puntoAgotado: {
    backgroundColor: '#EF5350',
  },
  badgeEstadoTexto: {
    fontSize: 12.5,
    fontWeight: '700',
  },
  badgeEstadoTextoDisponible: {
    color: '#2FD27A',
  },
  badgeEstadoTextoAgotado: {
    color: '#EF9A9A',
  },
  nombreProducto: {
    fontSize: 22,
    fontWeight: '800',
    color: '#EEF1FA',
    lineHeight: 28,
    marginBottom: 6,
  },
  precioProducto: {
    fontSize: 24,
    fontWeight: '800',
    color: '#2FD27A',
    marginBottom: 16,
  },
  seccionDescripcion: {
    backgroundColor: '#131938',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 14,
    marginBottom: 16,
  },
  etiquetaSeccion: {
    fontSize: 12,
    fontWeight: '700',
    color: '#A9B2D0',
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    marginBottom: 6,
  },
  descripcionCompleta: {
    fontSize: 14.5,
    color: '#EEF1FA',
    lineHeight: 22,
  },
  tarjetaVendedor: {
    backgroundColor: '#131938',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 14,
  },
  encabezadoVendedor: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarVendedor: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0, 150, 63, 0.16)',
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  textosVendedor: {
    flex: 1,
  },
  etiquetaVendedor: {
    fontSize: 11,
    fontWeight: '700',
    color: '#2FD27A',
    textTransform: 'uppercase',
  },
  nombreVendedor: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EEF1FA',
    marginTop: 2,
  },
  separador: {
    height: 1,
    backgroundColor: 'rgba(160,172,220,0.15)',
    marginVertical: 12,
  },
  filaDatoVendedor: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  iconoPin: {
    fontSize: 15,
    marginTop: 1,
  },
  iconoContacto: {
    marginTop: 2,
  },
  columnaDato: {
    flex: 1,
  },
  etiquetaDato: {
    fontSize: 11.5,
    color: '#A9B2D0',
    fontWeight: '600',
  },
  valorDato: {
    fontSize: 14,
    color: '#EEF1FA',
    fontWeight: '700',
    marginTop: 1,
  },
  bloqueHorario: {
    marginTop: 4,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,172,220,0.12)',
  },
  textoHorario: {
    fontSize: 13,
    color: '#A9B2D0',
    lineHeight: 19,
    marginTop: 3,
  },
  barraAccionesInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 14,
    paddingVertical: 12,
    backgroundColor: '#131938',
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,172,220,0.15)',
  },
  botonCompartir: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.25)',
  },
  textoCompartir: {
    fontSize: 13.5,
    fontWeight: '700',
    color: '#EEF1FA',
  },
  botonWhatsAppPrincipal: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 13,
    borderRadius: 11,
    backgroundColor: '#00963F',
  },
  botonWhatsAppDeshabilitado: {
    backgroundColor: 'rgba(169, 178, 208, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(160, 172, 220, 0.2)',
    opacity: 0.6,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  textoWhatsAppPrincipal: {
    fontSize: 14.5,
    fontWeight: '800',
    color: '#EEF1FA',
  },
  textoWhatsAppDeshabilitado: {
    color: '#A9B2D0',
  },
});
