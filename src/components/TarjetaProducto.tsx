import React, { useState } from 'react';
import {
  Alert,
  Image,
  Linking,
  Pressable,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

import { Producto } from '@/types/product';

export interface TarjetaProductoProps {
  producto: Producto;
  onPress?: (producto: Producto) => void;
  onToggleDisponibilidad?: (id: string) => void;
}

export function formatearPrecioCOP(valor: number): string {
  const miles = Math.round(valor)
    .toString()
    .replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `$${miles} COP`;
}

export const TarjetaProducto: React.FC<TarjetaProductoProps> = ({
  producto,
  onPress,
  onToggleDisponibilidad,
}) => {
  const [errorImagen, setErrorImagen] = useState<boolean>(false);

  const abrirWhatsAppDirecto = async (): Promise<void> => {
    const telefonoLimpio = (producto.telefonoVendedor || '3101234567').replace(
      /\D/g,
      ''
    );
    const mensaje = encodeURIComponent(
      `Hola ${producto.vendedor}, vi "${producto.nombre}" (${formatearPrecioCOP(
        producto.precio
      )}) en EcoVendedores UNIPAZ (📍 ${producto.ubicacion}). ¿Sigue disponible?`
    );
    const url = `https://wa.me/57${telefonoLimpio}?text=${mensaje}`;

    try {
      await Linking.openURL(url);
    } catch {
      Alert.alert(
        'Contacto con el vendedor',
        `No se pudo abrir WhatsApp automáticamente. Puedes escribir al +57 ${telefonoLimpio} (${producto.vendedor} en ${producto.ubicacion}).`
      );
    }
  };

  const manejarPressTarjeta = (): void => {
    if (onPress) {
      onPress(producto);
      return;
    }
    void abrirWhatsAppDirecto();
  };

  return (
    <Pressable
      onPress={manejarPressTarjeta}
      style={({ pressed }) => [
        styles.card,
        !producto.disponible && styles.cardAgotada,
        pressed && styles.cardPressed,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`${producto.nombre}, ${formatearPrecioCOP(
        producto.precio
      )}, vendido por ${producto.vendedor}, ${
        producto.disponible ? 'Disponible' : 'Agotado'
      }`}
    >
      <View style={styles.filaSuperior}>
        <View style={styles.miniaturaContainer}>
          {!errorImagen && producto.imagenUrl ? (
            <Image
              source={{ uri: producto.imagenUrl }}
              style={styles.miniatura}
              resizeMode="cover"
              onError={() => setErrorImagen(true)}
            />
          ) : (
            <View style={styles.placeholderMiniatura}>
              <Ionicons name="fast-food-outline" size={26} color="#A9B2D0" />
              <Text style={styles.placeholderTexto}>UNIPAZ</Text>
            </View>
          )}
        </View>

        <View style={styles.contenidoPrincipal}>
          {/* Fila superior de insignias: categoría + disponibilidad para no restar ancho al título */}
          <View style={styles.filaInsignias}>
            <View style={styles.chipCategoria}>
              <Text style={styles.chipCategoriaTexto}>
                {producto.categoria}
              </Text>
            </View>

            <Pressable
              onPress={(e) => {
                e.stopPropagation();
                if (onToggleDisponibilidad) {
                  onToggleDisponibilidad(producto.id);
                }
              }}
              hitSlop={6}
              style={[
                styles.badge,
                producto.disponible
                  ? styles.badgeDisponible
                  : styles.badgeAgotado,
              ]}
            >
              <View
                style={[
                  styles.puntoEstado,
                  producto.disponible
                    ? styles.puntoDisponible
                    : styles.puntoAgotado,
                ]}
              />
              <Text
                style={[
                  styles.badgeTexto,
                  producto.disponible
                    ? styles.badgeTextoDisponible
                    : styles.badgeTextoAgotado,
                ]}
              >
                {producto.disponible ? 'Disponible' : 'Agotado'}
              </Text>
            </Pressable>
          </View>

          {/* Título con ancho completo de la columna */}
          <Text
            style={styles.nombre}
            numberOfLines={2}
            ellipsizeMode="tail"
          >
            {producto.nombre}
          </Text>

          <Text style={styles.vendedorTexto} numberOfLines={1}>
            Por <Text style={styles.vendedorDestacado}>{producto.vendedor}</Text>
          </Text>

          <Text style={styles.ubicacionTexto} numberOfLines={1}>
            📍 {producto.ubicacion}
          </Text>
        </View>
      </View>

      <Text style={styles.descripcion} numberOfLines={2} ellipsizeMode="tail">
        {producto.descripcion}
      </Text>

      <View style={styles.filaInferior}>
        <View style={styles.bloquePrecio}>
          <Text style={styles.precio}>
            {formatearPrecioCOP(producto.precio)}
          </Text>
          <Text style={styles.verDetalleTexto}>Ver detalle ›</Text>
        </View>

        <Pressable
          onPress={(e) => {
            e.stopPropagation();
            void abrirWhatsAppDirecto();
          }}
          style={({ pressed }) => [
            styles.botonWhatsApp,
            !producto.disponible && styles.botonWhatsAppAgotado,
            pressed && styles.botonWhatsAppPressed,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`Contactar por WhatsApp a ${producto.vendedor}`}
        >
          <Ionicons
            name="logo-whatsapp"
            size={15}
            color={producto.disponible ? '#2FD27A' : '#A9B2D0'}
          />
          <Text
            style={[
              styles.textoAccion,
              !producto.disponible && styles.textoAccionAgotado,
            ]}
          >
            {producto.disponible ? 'Pedir por WhatsApp' : 'Consultar stock'}
          </Text>
        </Pressable>
      </View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#131938',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    padding: 12,
    marginBottom: 12,
    width: '100%',
  },
  cardAgotada: {
    opacity: 0.6,
  },
  cardPressed: {
    transform: [{ scale: 0.99 }],
    borderColor: 'rgba(47,210,122,0.45)',
  },
  filaSuperior: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 11,
  },
  miniaturaContainer: {
    width: 78,
    height: 78,
    borderRadius: 10,
    overflow: 'hidden',
    backgroundColor: '#0E1330',
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    flexShrink: 0,
  },
  miniatura: {
    width: '100%',
    height: '100%',
  },
  placeholderMiniatura: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#0E1330',
    padding: 4,
  },
  placeholderTexto: {
    fontSize: 9,
    color: '#A9B2D0',
    marginTop: 2,
    fontWeight: '600',
  },
  contenidoPrincipal: {
    flex: 1,
    flexShrink: 1,
    minWidth: 0,
  },
  filaInsignias: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 5,
  },
  chipCategoria: {
    backgroundColor: 'rgba(160,172,220,0.12)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipCategoriaTexto: {
    fontSize: 10,
    fontWeight: '700',
    color: '#A9B2D0',
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  nombre: {
    width: '100%',
    flexShrink: 1,
    fontSize: 15,
    fontWeight: '700',
    color: '#EEF1FA',
    lineHeight: 20,
    marginBottom: 4,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    flexShrink: 0,
  },
  badgeDisponible: {
    backgroundColor: 'rgba(0, 150, 63, 0.18)',
    borderColor: '#00963F',
  },
  badgeAgotado: {
    backgroundColor: 'rgba(220, 68, 68, 0.16)',
    borderColor: 'rgba(239, 83, 80, 0.5)',
  },
  puntoEstado: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  puntoDisponible: {
    backgroundColor: '#2FD27A',
  },
  puntoAgotado: {
    backgroundColor: '#EF5350',
  },
  badgeTexto: {
    fontSize: 11,
    fontWeight: '700',
  },
  badgeTextoDisponible: {
    color: '#2FD27A',
  },
  badgeTextoAgotado: {
    color: '#EF9A9A',
  },
  vendedorTexto: {
    fontSize: 12,
    color: '#A9B2D0',
    marginBottom: 2,
  },
  vendedorDestacado: {
    color: '#EEF1FA',
    fontWeight: '600',
  },
  ubicacionTexto: {
    fontSize: 12,
    color: '#A9B2D0',
  },
  descripcion: {
    fontSize: 13,
    color: '#A9B2D0',
    lineHeight: 18,
    marginTop: 8,
    marginBottom: 10,
  },
  filaInferior: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: 'rgba(160,172,220,0.15)',
    gap: 8,
  },
  bloquePrecio: {
    flexDirection: 'row',
    alignItems: 'baseline',
    gap: 8,
    flexShrink: 1,
  },
  precio: {
    fontSize: 16,
    fontWeight: '800',
    color: '#2FD27A',
  },
  verDetalleTexto: {
    fontSize: 11,
    fontWeight: '600',
    color: '#A9B2D0',
  },
  botonWhatsApp: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0, 150, 63, 0.14)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.28)',
    flexShrink: 0,
  },
  botonWhatsAppAgotado: {
    backgroundColor: 'rgba(169, 178, 208, 0.08)',
    borderColor: 'rgba(160, 172, 220, 0.2)',
  },
  botonWhatsAppPressed: {
    opacity: 0.8,
  },
  textoAccion: {
    fontSize: 12,
    fontWeight: '600',
    color: '#EEF1FA',
  },
  textoAccionAgotado: {
    color: '#A9B2D0',
  },
});

export default TarjetaProducto;
