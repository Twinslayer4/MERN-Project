import React from 'react';
import { Text, View } from 'react-native';

export function WorkspaceHeading({ styles, title, description }) {
  return (
    <View style={styles.pageHeading}>
      <Text accessibilityRole="header" style={styles.pageTitle}>{title}</Text>
      {description && <Text style={styles.bodyText}>{description}</Text>}
    </View>
  );
}
