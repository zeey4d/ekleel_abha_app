import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';

interface Props {
  currentStep: 1 | 2 | 3;
}

const STEPS = [
  { label: 'الشحن', key: 1 },
  { label: 'الدفع', key: 2 },
  { label: 'المراجعة', key: 3 },
];

const GREEN = '#10b981';
const SLATE = '#94a3b8';
const WHITE = '#ffffff';

export function CheckoutSteps({ currentStep }: Props) {
  return (
    <View style={styles.container}>
      {STEPS.map((step, idx) => {
        const isDone = step.key < currentStep;
        const isActive = step.key === currentStep;

        return (
          <React.Fragment key={step.key}>
            {/* Step circle */}
            <View style={styles.stepWrapper}>
              <View
                style={[
                  styles.circle,
                  isDone && styles.circleDone,
                  isActive && styles.circleActive,
                ]}
              >
                {isDone ? (
                  <Check size={14} color={WHITE} strokeWidth={3} />
                ) : (
                  <Text
                    style={[
                      styles.stepNum,
                      isActive && styles.stepNumActive,
                    ]}
                  >
                    {step.key}
                  </Text>
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isActive && styles.labelActive,
                  isDone && styles.labelDone,
                ]}
                numberOfLines={1}
              >
                {step.label}
              </Text>
            </View>

            {/* Connector line between steps */}
            {idx < STEPS.length - 1 && (
              <View
                style={[
                  styles.connector,
                  isDone && styles.connectorDone,
                ]}
              />
            )}
          </React.Fragment>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  stepWrapper: {
    alignItems: 'center',
    gap: 6,
  },
  circle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#f1f5f9',
    borderWidth: 2,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  circleDone: {
    backgroundColor: GREEN,
    borderColor: GREEN,
  },
  circleActive: {
    backgroundColor: WHITE,
    borderColor: GREEN,
    shadowColor: GREEN,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNum: {
    fontSize: 13,
    fontWeight: '700',
    color: SLATE,
  },
  stepNumActive: {
    color: GREEN,
  },
  label: {
    fontSize: 11,
    fontWeight: '500',
    color: SLATE,
    maxWidth: 60,
    textAlign: 'center',
  },
  labelActive: {
    color: GREEN,
    fontWeight: '700',
  },
  labelDone: {
    color: '#64748b',
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: 18, // lift to align with circle center
    marginHorizontal: 4,
  },
  connectorDone: {
    backgroundColor: GREEN,
  },
});
