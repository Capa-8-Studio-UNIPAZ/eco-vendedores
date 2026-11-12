import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface EstadoErrorProps {
  mensaje?: string;
  onReintentar: () => void;
}

export const EstadoError: React.FC<EstadoErrorProps> = ({
  mensaje = 'No pudimos conectar con el catálogo de UNIPAZ. Verifica tu señal móvil o conexión Wi-Fi del campus e inténtalo de nuevo.',
  onReintentar,
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.iconoCirculo}>
        <Ionicons name="cloud-offline-outline" size={44} color="#EF5350" />
      </View>

      <Text style={styles.titulo}>Problema de conexión en el campus</Text>
      <Text style={styles.descripcion}>{mensaje}</Text>

      <Pressable
        onPress={onReintentar}
        style={({ pressed }) => [
          styles.botonReintentar,
          pressed && styles.botonPresionado,
        ]}
        accessibilityRole="button"
        accessibilityLabel="Reintentar carga del catálogo"
      >
        <Ionicons name="reload-outline" size={18} color="#EEF1FA" />
        <Text style={styles.textoBoton}>Reintentar</Text>
      </Pressable>
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
    backgroundColor: 'rgba(239, 83, 80, 0.14)',
    borderWidth: 1,
    borderColor: 'rgba(239, 83, 80, 0.4)',
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
  descripcion: {
    fontSize: 14,
    color: '#A9B2D0',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 22,
  },
  botonReintentar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#00963F',
    paddingHorizontal: 20,
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

export default EstadoError;
