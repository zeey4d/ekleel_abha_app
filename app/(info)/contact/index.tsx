import React, { useState } from "react";
import { View, ScrollView, Linking, TextInput, Pressable, Alert } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Text } from "@/components/ui/text";
import { Input } from "@/components/ui/input";
import { 
  Mail, MapPin, Phone, Send, MessageCircle, HelpCircle, 
  Truck, RotateCcw, Clock, Headphones, 
  ChevronLeft
} from "lucide-react-native";
import { useGetSiteSettingsQuery } from "@/store/features/settings/settingsSlice";
import { useTranslation } from "react-i18next";
import { Link, router, Stack } from "expo-router";

// Temporary Card components if not available in project ui
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <View className={`bg-white rounded-xl border border-border ${className}`}>{children}</View>
);
const CardHeader = ({ children, className }: any) => <View className={`p-4 border-b border-border ${className}`}>{children}</View>;
const CardContent = ({ children, className }: any) => <View className={`p-4 ${className}`}>{children}</View>;
const CardTitle = ({ children, className }: any) => <Text className={`text-lg font-bold ${className}`}>{children}</Text>;
const CardDescription = ({ children }: any) => <Text className="text-sm text-muted-foreground">{children}</Text>;

export default function ContactPage() {
  const { t } = useTranslation('info');
  const { data: settings } = useGetSiteSettingsQuery();
  const [submitted, setSubmitted] = useState(false);

  const phoneValue = settings?.contact?.phone || "0575637926";
  const phoneHref = phoneValue.replace(/[^+\d]/g, "");
  const emailValue = settings?.contact?.email || "support@ekleelabha.com";
  const whatsappNumber = "966575637926";

  const contactSchema = z.object({
    name: z.string().min(2, t("contact.validation.nameMin")),
    email: z.string().email(t("contact.validation.emailInvalid")),
    subject: z.string().min(5, t("contact.validation.subjectMin")),
    message: z.string().min(10, t("contact.validation.messageMin")),
  });

  const { control, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<z.infer<typeof contactSchema>>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof contactSchema>) => {
    // console.log(values);
    await new Promise((resolve) => setTimeout(resolve, 1000));
    Alert.alert(t('common.success'), t("contact.successMessage"));
    reset();
    setSubmitted(true);
    setTimeout(() => setSubmitted(false), 6000);
  };

  const helpfulLinks = [
    { href: "/(info)/faq", icon: HelpCircle, label: t("contact.helpLinks.faq") },
    { href: "/(info)/shipping", icon: Truck, label: t("contact.helpLinks.shipping") },
    { href: "/(info)/return-policy", icon: RotateCcw, label: t("contact.helpLinks.returns") },
  ];

  return (
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 40 }}>
       <Stack.Screen options={{ title: t('contact.pageTitle') 
        ,
                    headerLeft: () => (
                                      <Pressable onPress={() => router.back()} >
                                          <ChevronLeft color="#000000ff" size={28} />
                                      </Pressable>
                                  ),
       }} />

      {/* Hero Section */}
      <View className="bg-foreground py-16 px-4 items-center">
        <View className="w-16 h-16 rounded-full bg-yellow-500/20 items-center justify-center mb-6">
          <Headphones size={32} color="#d4af37" />
        </View>
        <Text className="text-3xl font-bold mb-4 text-white text-center">
          {t("contact.pageTitle")}
        </Text>
        <Text className="text-lg text-white/80 text-center">
          {t("contact.pageDescription")}
        </Text>
      </View>

      {/* Quick Contact Options */}
      <View className="py-8 px-4">
        <Text className="text-2xl font-bold text-center mb-8 text-foreground">
            {t("contact.quickContactTitle")}
        </Text>
        <View className="gap-4">
            {/* Phone */}
            <Pressable 
                onPress={() => Linking.openURL(`tel:${phoneHref}`)}
                className="bg-white p-6 rounded-2xl border border-border items-center active:bg-slate-50"
            >
                <View className="w-12 h-12 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                    <Phone size={24} color="#d4af37" />
                </View>
                <Text className="font-semibold text-foreground mb-1">{t("contact.phone")}</Text>
                <Text className="text-sm text-muted-foreground">{phoneValue}</Text>
            </Pressable>

            {/* WhatsApp */}
            <Pressable 
                onPress={() => Linking.openURL(`https://wa.me/${whatsappNumber}`)}
                className="bg-white p-6 rounded-2xl border border-border items-center active:bg-slate-50"
            >
                <View className="w-12 h-12 rounded-full bg-green-500/10 items-center justify-center mb-4">
                    <MessageCircle size={24} color="#22c55e" />
                </View>
                <Text className="font-semibold text-foreground mb-1">{t("contact.whatsapp")}</Text>
                <Text className="text-sm text-muted-foreground">{t("contact.whatsappDesc")}</Text>
            </Pressable>

            {/* Email */}
            <Pressable 
                onPress={() => Linking.openURL(`mailto:${emailValue}`)}
                className="bg-white p-6 rounded-2xl border border-border items-center active:bg-slate-50"
            >
                 <View className="w-12 h-12 rounded-full bg-yellow-500/10 items-center justify-center mb-4">
                    <Mail size={24} color="#d4af37" />
                </View>
                <Text className="font-semibold text-foreground mb-1">{t("contact.email")}</Text>
                <Text className="text-sm text-muted-foreground">{emailValue}</Text>
            </Pressable>
        </View>
      </View>

      {/* Helpful Links */}
      <View className="py-8 bg-white px-4">
         <Text className="text-xl font-bold text-center mb-6 text-foreground">
            {t("contact.mayHelpYou")}
         </Text>
         <View className="flex-row flex-wrap justify-center gap-3">
            {helpfulLinks.map((link, index) => {
                 const Icon = link.icon;
                 return (
                    <Link key={index} href={link.href as any} asChild>
                        <Pressable className="flex-row items-center gap-2 px-5 py-3 bg-slate-50 rounded-full border border-border">
                            <Icon size={16} className="text-foreground" />
                            <Text className="text-sm font-medium">{link.label}</Text>
                        </Pressable>
                    </Link>
                 )
            })}
         </View>
      </View>

      {/* Contact Form */}
      <View className="py-8 px-4">
        <Card>
            <CardHeader>
                <CardTitle>{t("contact.formTitle")}</CardTitle>
                <CardDescription>{t("contact.formDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <View className="gap-4">
                    <View className="gap-2">
                        <Text className="text-sm font-medium">{t("contact.nameLabel")}</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    placeholder={t("contact.namePlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                         {errors.name && <Text className="text-red-500 text-xs">{errors.name.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-medium">{t("contact.emailLabel")}</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    placeholder={t("contact.emailPlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                />
                            )}
                        />
                        {errors.email && <Text className="text-red-500 text-xs">{errors.email.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-medium">{t("contact.subjectLabel")}</Text>
                        <Controller
                            control={control}
                            name="subject"
                            render={({ field: { onChange, value } }) => (
                                <Input 
                                    placeholder={t("contact.subjectPlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                />
                            )}
                        />
                         {errors.subject && <Text className="text-red-500 text-xs">{errors.subject.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className="text-sm font-medium">{t("contact.messageLabel")}</Text>
                        <Controller
                            control={control}
                            name="message"
                            render={({ field: { onChange, value } }) => (
                                <TextInput 
                                    className="min-h-[140px] border border-input rounded-xl p-3 text-start bg-background text-foreground"
                                    placeholder={t("contact.messagePlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#9ca3af"
                                />
                            )}
                        />
                         {errors.message && <Text className="text-red-500 text-xs">{errors.message.message}</Text>}
                    </View>

                    <Button 
                        onPress={handleSubmit(onSubmit)} 
                        disabled={isSubmitting}
                        className="bg-yellow-600 h-12"
                    >
                        {isSubmitting ? (
                             <Text className="text-white">{t("contact.sending")}</Text>
                        ) : (
                            <View className="flex-row items-center gap-2">
                                <Send size={16} color="white" />
                                <Text className="text-white font-bold">{t("contact.sendButton")}</Text>
                            </View>
                        )}
                    </Button>
                </View>
            </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
