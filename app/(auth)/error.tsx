// "use client";

// import { useEffect } from "react";
// import { Link } from "@/i18n/navigation";
// import { AlertCircle, RefreshCw } from "lucide-react";
// import { useTranslations } from "next-intl";

// export default function AuthError({
//     error,
//     reset,
// }: {
//     error: Error & { digest?: string };
//     reset: () => void;
// }) {
//     const t = useTranslations('auth');

//     useEffect(() => {
//         console.error("Auth error:", error);
//     }, [error]);

//     return (
//         <div className="min-h-screen flex items-center justify-center px-4 bg-background relative overflow-hidden">
//             {/* Background Decorative Elements */}
//             <div className="absolute top-0 -left-10 w-72 h-72 bg-brand-green/5 rounded-full blur-3xl" />
//             <div className="absolute bottom-0 -right-10 w-72 h-72 bg-brand-lavender/5 rounded-full blur-3xl" />

//             <div className="w-full max-w-md relative z-10">
//                 <div className="bg-card rounded-2xl shadow-xl p-8 border border-border/50 backdrop-blur-sm text-center">
//                     <div className="inline-flex items-center justify-center w-16 h-16 bg-destructive/10 rounded-full mb-6 text-destructive">
//                         <AlertCircle className="w-8 h-8" />
//                     </div>

//                     <h2 className="text-2xl font-bold mb-4">{t('error.title')}</h2>

//                     <p className="text-muted-foreground mb-6">
//                         {t('error.description')}
//                     </p>

//                     {error.message && (
//                         <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 mb-6">
//                             <p className="text-sm text-destructive font-mono">{error.message}</p>
//                         </div>
//                     )}

//                     <div className="space-y-3">
//                         <button
//                             onClick={reset}
//                             className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 shadow-lg hover:shadow-primary/20"
//                         >
//                             <RefreshCw className="w-5 h-5" />
//                             {t('common.tryAgain')}
//                         </button>

//                         <Link
//                             href="/"
//                             className="block w-full text-center py-3 text-muted-foreground hover:text-foreground font-medium transition-colors"
//                         >
//                             {t('common.goToHome')}
//                         </Link>
//                     </div>
//                 </div>
//             </div>
//         </div>
//     );
// }
