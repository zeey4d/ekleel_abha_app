import React from 'react';
import { View, StyleSheet, I18nManager } from 'react-native';
import { Text } from '@/components/ui/text';
import { Check } from 'lucide-react-native';
import { useTranslation } from 'react-i18next';

interface Props {
  currentStep: 1 | 2 | 3;
}

const TEAL = '#0d9488'; // teal-600
const SLATE = '#64748b'; // slate-500
const WHITE = '#ffffff';

export function CheckoutSteps({ currentStep }: Props) {
  const { t, i18n } = useTranslation('checkout');
  const isRtl = i18n.language === 'ar' || I18nManager.isRTL;

  const steps = [
    { label: t('Steps.shipping', 'الشحن'), key: 1 },
    { label: t('Steps.payment', 'الدفع'), key: 2 },
    { label: t('Steps.review', 'المراجعة'), key: 3 },
  ];

  const displaySteps = isRtl ? [...steps].reverse() : steps;

  return (
    <View style={[styles.container, { flexDirection: isRtl ? 'row-reverse' : 'row' }]}>
      {displaySteps.map((step, idx) => {
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
            {idx < displaySteps.length - 1 && (
              <View
                style={[
                  styles.connector,
                  // Logic for connector coloring needs to check the actual step sequence
                  (isRtl ? displaySteps[idx+1].key < currentStep : isDone) && styles.connectorDone,
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
    backgroundColor: TEAL,
    borderColor: TEAL,
  },
  circleActive: {
    backgroundColor: WHITE,
    borderColor: TEAL,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  stepNum: {
    fontSize: 14,
    fontFamily: 'Tajawal_700Bold',
    color: SLATE,
  },
  stepNumActive: {
    color: TEAL,
  },
  label: {
    fontSize: 12,
    fontFamily: 'Tajawal_500Medium',
    color: SLATE,
    maxWidth: 60,
    textAlign: 'center',
  },
  labelActive: {
    color: TEAL,
    fontFamily: 'Tajawal_700Bold',
  },
  labelDone: {
    color: SLATE,
  },
  connector: {
    flex: 1,
    height: 2,
    backgroundColor: '#e2e8f0',
    marginBottom: 18, // lift to align with circle center
    marginHorizontal: 4,
  },
  connectorDone: {
    backgroundColor: TEAL,
  },
});
