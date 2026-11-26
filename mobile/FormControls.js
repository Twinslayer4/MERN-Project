import React, { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

export function Button({ styles, title, onPress, secondary, disabled }) {
  return (
    <Pressable accessibilityRole="button" accessibilityState={{ disabled: Boolean(disabled) }}
      disabled={disabled} onPress={onPress}
      style={({ pressed }) => [styles.button, secondary && styles.outline, (pressed || disabled) && styles.busy]}>
      <Text style={[styles.buttonLabel, secondary && styles.outlineLabel]}>{title}</Text>
    </Pressable>
  );
}

export function Field({ colors, styles, label, password, ...props }) {
  const [focused, setFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  return (
    <View>
      <Text style={styles.label}>{label}</Text>
      <View style={password && styles.password}>
        <TextInput {...props} accessibilityLabel={label} placeholderTextColor={colors.muted}
          secureTextEntry={password && !showPassword}
          onFocus={() => setFocused(true)} onBlur={() => setFocused(false)}
          style={[styles.input, focused && styles.focused, password && styles.passwordInput]} />
        {password && (
          <Pressable accessibilityRole="button" accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            onPress={() => setShowPassword(!showPassword)} style={styles.passwordToggle}>
            <Text style={styles.link}>{showPassword ? 'Hide' : 'Show'}</Text>
          </Pressable>
        )}
      </View>
    </View>
  );
}
