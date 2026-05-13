import React, { useState } from "react";
import { View, ScrollView, Linking, TextInput, Pressable, Alert, Image } from "react-native";
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
import { I18nManager } from "react-native";
import { cn } from "@/lib/utils";

// Temporary Card components if not available in project ui
const Card = ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <View className={cn("bg-white rounded-[32px] border border-slate-200/80 shadow-sm", className)}>{children}</View>
);
const CardHeader = ({ children, className }: any) => <View className={cn("p-6 border-b border-slate-100", className)}>{children}</View>;
const CardContent = ({ children, className }: any) => <View className={cn("p-6", className)}>{children}</View>;
const CardTitle = ({ children, className }: any) => <Text className={cn("text-xl font-bold font-tajawal text-slate-800", className)}>{children}</Text>;
const CardDescription = ({ children }: any) => <Text className="text-sm text-slate-500 font-tajawal mt-1">{children}</Text>;

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
    <ScrollView className="flex-1 bg-slate-50" contentContainerStyle={{ paddingBottom: 60 }}>
       <Stack.Screen options={{ title: t('contact.pageTitle') }} />

      {/* Hero Section */}
      <View className="bg-teal-700 py-16 px-4 items-center relative overflow-hidden mb-6">
        <Image 
          source={require("@/assets/images/aka_g.png")} 
          className="w-24 h-24 mb-4" 
          resizeMode="contain" 
        />
        <View className="w-16 h-16 rounded-2xl bg-teal-600/50 items-center justify-center mb-6">
          <Headphones size={32} color="#ccfbf1" />
        </View>
        <Text className="text-2xl font-bold mb-2 text-white text-center font-tajawal">
          {t("contact.pageTitle")}
        </Text>
        <Text className="text-[15px] text-teal-100 text-center font-tajawal">
          {t("contact.pageDescription")}
        </Text>
      </View>

      {/* Quick Contact Options */}
      <View className="py-4 px-4">
        <Text className="text-xl font-bold text-center mb-6 text-slate-800 font-tajawal">
            {t("contact.quickContactTitle")}
        </Text>
        <View className="gap-4">
            {/* Phone */}
            <Pressable 
                onPress={() => Linking.openURL(`tel:${phoneHref}`)}
                className="bg-white p-5 rounded-[32px] border border-slate-200/80 items-center shadow-sm active:bg-slate-50 flex-row"
            >
                <View className={cn("w-12 h-12 rounded-2xl bg-teal-50 items-center justify-center", I18nManager.isRTL ? "ml-4" : "mr-4")}>
                    <Phone size={24} className="text-teal-600" />
                </View>
                <View className="flex-1">
                    <Text className={cn("font-bold text-slate-800 mb-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.phone")}</Text>
                    <Text className={cn("text-sm text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{phoneValue}</Text>
                </View>
            </Pressable>

            {/* WhatsApp */}
            <Pressable 
                onPress={() => Linking.openURL(`https://wa.me/${whatsappNumber}`)}
                className="bg-white p-5 rounded-[32px] border border-slate-200/80 items-center shadow-sm active:bg-slate-50 flex-row"
            >
                <View className={cn("w-12 h-12 rounded-2xl bg-green-50 items-center justify-center", I18nManager.isRTL ? "ml-4" : "mr-4")}>
                    <MessageCircle size={24} color="#16a34a" />
                </View>
                <View className="flex-1">
                    <Text className={cn("font-bold text-slate-800 mb-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.whatsapp")}</Text>
                    <Text className={cn("text-sm text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.whatsappDesc")}</Text>
                </View>
            </Pressable>

            {/* Email */}
            <Pressable 
                onPress={() => Linking.openURL(`mailto:${emailValue}`)}
                className="bg-white p-5 rounded-[32px] border border-slate-200/80 items-center shadow-sm active:bg-slate-50 flex-row"
            >
                 <View className={cn("w-12 h-12 rounded-2xl bg-teal-50 items-center justify-center", I18nManager.isRTL ? "ml-4" : "mr-4")}>
                    <Mail size={24} className="text-teal-600" />
                </View>
                <View className="flex-1">
                    <Text className={cn("font-bold text-slate-800 mb-1 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.email")}</Text>
                    <Text className={cn("text-sm text-slate-500 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{emailValue}</Text>
                </View>
            </Pressable>
        </View>
      </View>

      {/* Helpful Links */}
      <View className="py-6 bg-white px-4 mx-4 rounded-[32px] border border-slate-200/80 shadow-sm mt-4">
         <Text className="text-lg font-bold text-center mb-5 text-slate-800 font-tajawal">
            {t("contact.mayHelpYou")}
         </Text>
         <View className="flex-row flex-wrap justify-center gap-3">
            {helpfulLinks.map((link, index) => {
                 const Icon = link.icon;
                 return (
                    <Link key={index} href={link.href as any} asChild>
                        <Pressable className={cn("flex-row items-center gap-2 px-5 py-3 bg-slate-50 rounded-2xl border border-slate-100", I18nManager.isRTL && "flex-row-reverse")}>
                            <Icon size={16} className="text-slate-600" />
                            <Text className="text-sm font-bold text-slate-700 font-tajawal">{link.label}</Text>
                        </Pressable>
                    </Link>
                 )
            })}
         </View>
      </View>

      {/* Contact Form */}
      <View className="py-6 px-4">
        <Card>
            <CardHeader>
                <CardTitle className={I18nManager.isRTL ? "text-right" : "text-left"}>{t("contact.formTitle")}</CardTitle>
                <CardDescription className={I18nManager.isRTL ? "text-right" : "text-left"}>{t("contact.formDescription")}</CardDescription>
            </CardHeader>
            <CardContent>
                <View className="gap-5">
                    <View className="gap-2">
                        <Text className={cn("text-sm font-bold text-slate-700 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.nameLabel")}</Text>
                        <Controller
                            control={control}
                            name="name"
                            render={({ field: { onChange, value } }) => (
                                <TextInput 
                                    className={cn("border border-slate-200 rounded-2xl p-4 bg-slate-50 font-tajawal text-slate-800", I18nManager.isRTL ? "text-right" : "text-left")}
                                    placeholder={t("contact.namePlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholderTextColor="#94a3b8"
                                />
                            )}
                        />
                         {errors.name && <Text className="text-red-500 text-xs font-tajawal">{errors.name.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className={cn("text-sm font-bold text-slate-700 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.emailLabel")}</Text>
                        <Controller
                            control={control}
                            name="email"
                            render={({ field: { onChange, value } }) => (
                                <TextInput 
                                    className={cn("border border-slate-200 rounded-2xl p-4 bg-slate-50 font-tajawal text-slate-800", I18nManager.isRTL ? "text-right" : "text-left")}
                                    placeholder={t("contact.emailPlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    keyboardType="email-address"
                                    placeholderTextColor="#94a3b8"
                                />
                            )}
                        />
                        {errors.email && <Text className="text-red-500 text-xs font-tajawal">{errors.email.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className={cn("text-sm font-bold text-slate-700 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.subjectLabel")}</Text>
                        <Controller
                            control={control}
                            name="subject"
                            render={({ field: { onChange, value } }) => (
                                <TextInput 
                                    className={cn("border border-slate-200 rounded-2xl p-4 bg-slate-50 font-tajawal text-slate-800", I18nManager.isRTL ? "text-right" : "text-left")}
                                    placeholder={t("contact.subjectPlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    placeholderTextColor="#94a3b8"
                                />
                            )}
                        />
                         {errors.subject && <Text className="text-red-500 text-xs font-tajawal">{errors.subject.message}</Text>}
                    </View>

                    <View className="gap-2">
                        <Text className={cn("text-sm font-bold text-slate-700 font-tajawal", I18nManager.isRTL ? "text-right" : "text-left")}>{t("contact.messageLabel")}</Text>
                        <Controller
                            control={control}
                            name="message"
                            render={({ field: { onChange, value } }) => (
                                <TextInput 
                                    className={cn("min-h-[140px] border border-slate-200 rounded-2xl p-4 bg-slate-50 font-tajawal text-slate-800", I18nManager.isRTL ? "text-right" : "text-left")}
                                    placeholder={t("contact.messagePlaceholder")}
                                    value={value}
                                    onChangeText={onChange}
                                    multiline
                                    textAlignVertical="top"
                                    placeholderTextColor="#94a3b8"
                                />
                            )}
                        />
                         {errors.message && <Text className="text-red-500 text-xs font-tajawal">{errors.message.message}</Text>}
                    </View>

                    <Pressable 
                        onPress={handleSubmit(onSubmit)} 
                        disabled={isSubmitting}
                        className="bg-teal-600 mt-4 py-4 rounded-full flex-row justify-center items-center active:bg-teal-700 active:scale-[0.98] transition-all shadow-sm"
                    >
                        {isSubmitting ? (
                             <Text className="text-white font-bold font-tajawal">{t("contact.sending")}</Text>
                        ) : (
                            <View className={cn("flex-row items-center", I18nManager.isRTL && "flex-row-reverse")}>
                                <Send size={18} color="white" className={I18nManager.isRTL ? "ml-2" : "mr-2"} style={I18nManager.isRTL ? { transform: [{ rotate: '180deg' }] } : {}} />
                                <Text className="text-white font-bold font-tajawal text-[15px]">{t("contact.sendButton")}</Text>
                            </View>
                        )}
                    </Pressable>
                </View>
            </CardContent>
        </Card>
      </View>
    </ScrollView>
  );
}
