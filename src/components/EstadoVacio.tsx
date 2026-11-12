import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface EstadoVacioProps {
  mensaje?: string;
  subtitulo?: string;
  textoBoton?: string;
  onAccion?: () => void;
}

export const EstadoVacio: React.FC<EstadoVacioProps> = ({
  mensaje = 'Aún no hay productos activos hoy',
  subtitulo = 'Los emprendedores del campus de UNIPAZ aún no han publicado su oferta del día o han cerrado su jornada.',
  textoBoton = 'Actualizar catálogo',
  onAccion,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconoCirculo}>
        <Ionicons name="storefront-outline" size={44} color="#2FD27A" />
      </View>

      <Text style={styles.titulo}>{mensaje}</Text>
      <Text style={styles.subtitulo}>{subtitulo}</Text>

      {onAccion ? (
        <Pressable
          onPress={onAccion}
          style={({ pressed }) => [
            styles.boton,
            pressed && styles.botonPresionado,
          ]}
          accessibilityRole="button"
          accessibilityLabel={textoBoton}
        >
          <Ionicons name="refresh-outline" size={18} color="#EEF1FA" />
          <Text style={styles.textoBoton}>{textoBoton}</Text>
        </Pressable>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#131938',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(160,172,220,0.15)',
    paddingHorizontal: 20,
    paddingVertical: 32,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  iconoCirculo: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: 'rgba(0, 150, 63, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(47, 210, 122, 0.35)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  titulo: {
    fontSize: 18,
    fontWeight: '700',
    color: '#EEF1FA',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitulo: {
    fontSize: 14,
    color: '#A9B2D0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  boton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00963F',
    paddingHorizontal: 18,
    paddingVertical: 11,
    borderRadius: 10,
  },
  botonPresionado: {
    opacity: 0.85,
  },
  textoBoton: {
    color: '#EEF1FA',
    fontSize: 14,
    fontWeight: '700',
  },
});

export default EstadoVacio;
