import React from 'react';
import { ActivityIndicator, Pressable, StyleProp, StyleSheet, Text, ViewStyle } from 'react-native';
import { useTheme } from './theme/ThemeContext'; // ajusta el import a donde viva tu ThemeContext
import { radius } from './tokens';

type ButtonVariant = 'primary' | 'danger' | 'ghost';

interface Props {
  title: string;
  onPress: () => void;
  disabled?: boolean;
  loading?: boolean;
  /**
   * primary (relleno, color de marca) · danger (relleno, semantic.danger) · ghost (texto, sin relleno)
   * Reemplaza al `color={colors.x}` del Button nativo de RN — ese componente
   * no acepta borderRadius y se ve distinto por plataforma, por eso no se usa.
   */
  variant?: ButtonVariant;
  style?: StyleProp<ViewStyle>;
}

/**
 * Botón estándar — el único que debería usarse en vez del `Button` nativo de
 * react-native. Ver brand-kit/README.md#botones.
 *
 * Radio y curva de esquina tomados de referencia del estilo de controles de
 * Apple: esquina "continua" (superelipse, no arco circular) + radio ligero.
 * Mismo radio en las 6 apps — es lo que las hace sentir de la misma familia
 * aunque cada una tenga su propio `primary`.
 */
export default function Button({ title, onPress, disabled, loading, variant = 'primary', style }: Props) {
  const { colors } = useTheme();

  const background =
    variant === 'primary' ? colors.primary : variant === 'danger' ? colors.danger : 'transparent';
  const textColor = variant === 'ghost' ? colors.textSecondary : '#FFFFFF';
  const isDisabled = disabled || loading;

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      style={({ pressed }) => [
        styles.base,
        { backgroundColor: background },
        isDisabled && styles.disabled,
        pressed && !isDisabled && styles.pressed,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={textColor} />
      ) : (
        <Text style={[styles.text, { color: textColor }]}>{title}</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radius.sm,
    borderCurve: 'continuous', // esquina "continua" tipo iOS (RN 0.71+), no-op en Android
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 16,
    fontWeight: '600',
  },
  pressed: {
    opacity: 0.85,
  },
  disabled: {
    opacity: 0.5,
  },
});
