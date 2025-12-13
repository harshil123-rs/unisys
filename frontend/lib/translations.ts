export type Language = 'en' | 'hi' | 'es' | 'kn' | 'fr' | 'de' | 'zh' | 'ja';

export type TranslationKey = string;

export const translations = {
    en: {
        nav: {
            dashboard: 'Dashboard',
            bookShipment: 'Book Shipment',
            tracking: 'Tracking',
            documents: 'Documents',
            aiAgent: 'AI Agent',
            connect: 'Connect',
            profile: 'Profile',
            settings: 'Settings',
            logout: 'Logout',
            logisticsMap: 'Logistics Map',
            approvals: 'Approvals',
            forecasts: 'Forecasts',
            aiReport: 'AI Report',
            bulkUpload: 'Bulk Upload',
            returnCancel: 'Return/Cancel'
        },
        common: {
            welcome: 'Welcome',
            needHelp: 'Need help?',
            askAI: 'Ask AI Agent',
            signOut: 'Sign Out',
            loggedInAs: 'Logged in as',
            loading: 'Loading...',
            search: 'Search...',
            track: 'Track',
            status: 'Status',
            notifications: 'Notifications',
            saveChanges: 'Save Changes'
        },
        dashboard: {
            title: 'Logistics Performance',
            subtitle: 'Real-time overview of your logistics performance',
            activeOrders: 'Active Orders',
            delayedShipments: 'Delayed Shipments',
            avgDelayRisk: 'Avg Delay Risk',
            shipmentsByCarrier: 'Shipments by Carrier',
            recentAlerts: 'Recent Alerts'
        }
    },
    hi: {
        nav: {
            dashboard: 'डैशबोर्ड',
            bookShipment: 'शिपमेंट बुक करें',
            tracking: 'ट्रैकिंग',
            documents: 'दस्तावेज़',
            aiAgent: 'एआई एजेंट',
            connect: 'संपर्क',
            profile: 'प्रोफ़ाइल',
            settings: 'सेटिंग्स',
            logout: 'लॉग आउट',
            logisticsMap: 'लॉजिस्टिक्स मैप',
            approvals: 'अनुमोदन',
            forecasts: 'पूर्वानुमान',
            aiReport: 'एआई रिपोर्ट',
            bulkUpload: 'बल्क अपलोड',
            returnCancel: 'वापसी/रद्द करें'
        },
        common: {
            welcome: 'स्वागत है',
            needHelp: 'मदद चाहिए?',
            askAI: 'एआई एजेंट से पूछें',
            signOut: 'साइन आउट',
            loggedInAs: 'लॉग इन हैं',
            loading: 'लोड हो रहा है...',
            search: 'खोजें...',
            track: 'ट्रैक',
            status: 'स्थिति',
            notifications: 'सूचनाएं',
            saveChanges: 'परिवर्तन सहेजें'
        },
        dashboard: {
            title: 'लॉजिस्टिक्स प्रदर्शन',
            subtitle: 'आपके लॉजिस्टिक्स प्रदर्शन का रीयल-टाइम अवलोकन',
            activeOrders: 'सक्रिय ऑर्डर',
            delayedShipments: 'विलंबित शिपमेंट',
            avgDelayRisk: 'औसत विलंब जोखिम',
            shipmentsByCarrier: 'कैरियर द्वारा शिपमेंट',
            recentAlerts: 'हालिया अलर्ट'
        }
    },
    es: {
        nav: {
            dashboard: 'Tablero',
            bookShipment: 'Reservar Envío',
            tracking: 'Rastreo',
            documents: 'Documentos',
            aiAgent: 'Agente IA',
            connect: 'Conectar',
            profile: 'Perfil',
            settings: 'Ajustes',
            logout: 'Cerrar Sesión',
            logisticsMap: 'Mapa Logístico',
            approvals: 'Aprobaciones',
            forecasts: 'Pronósticos',
            aiReport: 'Informe IA',
            bulkUpload: 'Carga Masiva',
            returnCancel: 'Devolución/Cancelar'
        },
        common: {
            welcome: 'Bienvenido',
            needHelp: '¿Necesitas ayuda?',
            askAI: 'Preguntar a IA',
            signOut: 'Desconectar',
            loggedInAs: 'Conectado como',
            loading: 'Cargando...',
            search: 'Buscar...',
            track: 'Rastrear',
            status: 'Estado',
            notifications: 'Notificaciones',
            saveChanges: 'Guardar Cambios'
        },
        dashboard: {
            title: 'Rendimiento Logístico',
            subtitle: 'Resumen en tiempo real de su rendimiento logístico',
            activeOrders: 'Pedidos Activos',
            delayedShipments: 'Envíos Retrasados',
            avgDelayRisk: 'Riesgo Promedio',
            shipmentsByCarrier: 'Envíos por Transportista',
            recentAlerts: 'Alertas Recientes'
        }
    },
    kn: {
        nav: {
            dashboard: 'ಡ್ಯಾಶ್‌ಬೋರ್ಡ್',
            bookShipment: 'ಶಿಪ್‌ಮೆಂಟ್ ಬುಕ್ ಮಾಡಿ',
            tracking: 'ಟ್ರ್ಯಾಕಿಂಗ್',
            documents: 'ದಾಖಲೆಗಳು',
            aiAgent: 'AI ಏಜೆಂಟ್',
            connect: 'ಸಂಪರ್ಕಿಸಿ',
            profile: 'ಪ್ರೊಫೈಲ್',
            settings: 'ಸೆಟ್ಟಿಂಗ್‌ಗಳು',
            logout: 'ಲಾಗ್ ಔಟ್',
            logisticsMap: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಮ್ಯಾಪ್',
            approvals: 'ಅನುಮೋದನೆಗಳು',
            forecasts: 'ಮುನ್ಸೂಚನೆಗಳು',
            aiReport: 'AI ವರದಿ',
            bulkUpload: 'ಬಲ್ಕ್ ಅಪ್‌ಲೋಡ್',
            returnCancel: 'ಹಿಂತಿರುಗಿ/ರದ್ದುಮಾಡಿ'
        },
        common: {
            welcome: 'ಸ್ವಾಗತ',
            needHelp: 'ಸಹಾಯ ಬೇಕೇ?',
            askAI: 'AI ಏಜೆಂಟ್ ಕೇಳಿ',
            signOut: 'ಸೈನ್ ಔಟ್',
            loggedInAs: 'ಲಾಗಿನ್ ಆಗಿದ್ದೀರಿ',
            loading: 'ಲೋಡ್ ಆಗುತ್ತಿದೆ...',
            search: 'ಹುಡುಕಿ...',
            track: 'ಟ್ರ್ಯಾಕ್',
            status: 'ಸ್ಥಿತಿ',
            notifications: 'ಸೂಚನೆಗಳು',
            saveChanges: 'ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ'
        },
        dashboard: {
            title: 'ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಕಾರ್ಯಕ್ಷಮತೆ',
            subtitle: 'ನಿಮ್ಮ ಲಾಜಿಸ್ಟಿಕ್ಸ್ ಕಾರ್ಯಕ್ಷಮತೆಯ ನೈಜ-ಸಮಯದ ಅವಲೋಕನ',
            activeOrders: 'ಸಕ್ರಿಯ ಆರ್ಡರ್‌ಗಳು',
            delayedShipments: 'ವಿಳಂಬಿತ ಶಿಪ್‌ಮೆಂಟ್‌ಗಳು',
            avgDelayRisk: 'ಸರಾಸರಿ ವಿಳಂಬ ಅಪಾಯ',
            shipmentsByCarrier: 'ಕ್ಯಾರಿಯರ್ ಮೂಲಕ ಶಿಪ್‌ಮೆಂಟ್‌ಗಳು',
            recentAlerts: 'ಇತ್ತೀಚಿನ ಎಚ್ಚರಿಕೆಗಳು'
        }
    },
    fr: {
        nav: {
            dashboard: 'Tableau de bord',
            bookShipment: 'Réserver un envoi',
            tracking: 'Suivi',
            documents: 'Documents',
            aiAgent: 'Agent IA',
            connect: 'Connecter',
            profile: 'Profil',
            settings: 'Paramètres',
            logout: 'Déconnexion',
            logisticsMap: 'Carte Logistique',
            approvals: 'Approbations',
            forecasts: 'Prévisions',
            aiReport: 'Rapport IA',
            bulkUpload: 'Import en masse',
            returnCancel: 'Retour/Annuler'
        },
        common: {
            welcome: 'Bienvenue',
            needHelp: 'Besoin d\'aide ?',
            askAI: 'Demander à l\'IA',
            signOut: 'Se déconnecter',
            loggedInAs: 'Connecté en tant que',
            loading: 'Chargement...',
            search: 'Rechercher...',
            track: 'Suivre',
            status: 'Statut',
            notifications: 'Notifications',
            saveChanges: 'Enregistrer'
        },
        dashboard: {
            title: 'Performance Logistique',
            subtitle: 'Aperçu en temps réel de votre performance logistique',
            activeOrders: 'Commandes Actives',
            delayedShipments: 'Envois Retardés',
            avgDelayRisk: 'Risque Moyen',
            shipmentsByCarrier: 'Envois par Transporteur',
            recentAlerts: 'Alertes Récentes'
        }
    },
    de: {
        nav: {
            dashboard: 'Dashboard',
            bookShipment: 'Sendung buchen',
            tracking: 'Verfolgung',
            documents: 'Dokumente',
            aiAgent: 'KI-Agent',
            connect: 'Verbinden',
            profile: 'Profil',
            settings: 'Einstellungen',
            logout: 'Abmelden',
            logisticsMap: 'Logistikkarte',
            approvals: 'Genehmigungen',
            forecasts: 'Prognosen',
            aiReport: 'KI-Bericht',
            bulkUpload: 'Massenupload',
            returnCancel: 'Rückgabe/Stornieren'
        },
        common: {
            welcome: 'Willkommen',
            needHelp: 'Hilfe benötigt?',
            askAI: 'KI fragen',
            signOut: 'Abmelden',
            loggedInAs: 'Angemeldet als',
            loading: 'Laden...',
            search: 'Suchen...',
            track: 'Verfolgen',
            status: 'Status',
            notifications: 'Benachrichtigungen',
            saveChanges: 'Änderungen speichern'
        },
        dashboard: {
            title: 'Logistikleistung',
            subtitle: 'Echtzeit-Überblick über Ihre Logistikleistung',
            activeOrders: 'Aktive Aufträge',
            delayedShipments: 'Verspätete Sendungen',
            avgDelayRisk: 'Durchschn. Verzögerungsrisiko',
            shipmentsByCarrier: 'Sendungen nach Spediteur',
            recentAlerts: 'Aktuelle Warnungen'
        }
    },
    zh: {
        nav: {
            dashboard: '仪表板',
            bookShipment: '预订发货',
            tracking: '追踪',
            documents: '文件',
            aiAgent: 'AI 代理',
            connect: '连接',
            profile: '个人资料',
            settings: '设置',
            logout: '登出',
            logisticsMap: '物流地图',
            approvals: '审批',
            forecasts: '预测',
            aiReport: 'AI 报告',
            bulkUpload: '批量上传',
            returnCancel: '退货/取消'
        },
        common: {
            welcome: '欢迎',
            needHelp: '需要帮助吗？',
            askAI: '询问 AI 代理',
            signOut: '登出',
            loggedInAs: '登录身份',
            loading: '加载中...',
            search: '搜索...',
            track: '追踪',
            status: '状态',
            notifications: '通知',
            saveChanges: '保存更改'
        },
        dashboard: {
            title: '物流绩效',
            subtitle: '您的物流绩效实时概览',
            activeOrders: '活跃订单',
            delayedShipments: '延误发货',
            avgDelayRisk: '平均延误风险',
            shipmentsByCarrier: '按承运商发货',
            recentAlerts: '最近警报'
        }
    },
    ja: {
        nav: {
            dashboard: 'ダッシュボード',
            bookShipment: '出荷予約',
            tracking: '追跡',
            documents: 'ドキュメント',
            aiAgent: 'AI エージェント',
            connect: '接続',
            profile: 'プロフィール',
            settings: '設定',
            logout: 'ログアウト',
            logisticsMap: '物流マップ',
            approvals: '承認',
            forecasts: '予測',
            aiReport: 'AI レポート',
            bulkUpload: '一括アップロード',
            returnCancel: '返品/キャンセル'
        },
        common: {
            welcome: 'ようこそ',
            needHelp: 'ヘルプが必要ですか？',
            askAI: 'AI エージェントに尋ねる',
            signOut: 'サインアウト',
            loggedInAs: 'ログイン中',
            loading: '読み込み中...',
            search: '検索...',
            track: '追跡',
            status: 'ステータス',
            notifications: '通知',
            saveChanges: '変更を保存'
        },
        dashboard: {
            title: '物流パフォーマンス',
            subtitle: '物流パフォーマンスのリアルタイム概要',
            activeOrders: 'アクティブな注文',
            delayedShipments: '遅延出荷',
            avgDelayRisk: '平均遅延リスク',
            shipmentsByCarrier: '運送業者別の出荷',
            recentAlerts: '最近のアラート'
        }
    }
};
