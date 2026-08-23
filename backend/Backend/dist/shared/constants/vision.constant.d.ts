export declare const APP_VISION: {
    readonly name: "AutoHub";
    readonly tagline: "Smart Automotive Ecosystem";
    readonly vision: string;
    readonly goals: readonly [{
        readonly key: "SIMPLIFY_OWNERSHIP";
        readonly title: "تسهيل امتلاك السيارة";
        readonly description: "منصة واحدة تغطي كل احتياجات صاحب السيارة من أول يوم لآخر يوم";
    }, {
        readonly key: "CONNECT_PROVIDERS";
        readonly title: "ربط أصحاب السيارات بمقدمي الخدمات";
        readonly description: "ربط الورش والميكانيكيين والمحلات وسائقي النش بالعملاء";
    }, {
        readonly key: "PARTS_MARKETPLACE";
        readonly title: "إنشاء Marketplace لقطع الغيار";
        readonly description: "سوق شفاف لقطع الغيار الأصلية مثل أمازون";
    }, {
        readonly key: "VEHICLE_RECORDS";
        readonly title: "إدارة سجل السيارة بالكامل";
        readonly description: "سجل رقمي كامل لكل سيارة معتمد على رقم الـ VIN";
    }, {
        readonly key: "EMERGENCY_SERVICES";
        readonly title: "توفير خدمات الطوارئ";
        readonly description: "مساعدة فورية على الطريق وخدمات الإنقاذ عند الطلب";
    }, {
        readonly key: "ADMIN_DASHBOARD";
        readonly title: "توفير لوحة تحكم للإدارة";
        readonly description: "لوحة تحكم شاملة لإدارة المستخدمين والمحتوى والتحليلات";
    }, {
        readonly key: "AI_SUPPORT";
        readonly title: "دعم الذكاء الاصطناعي مستقبلًا";
        readonly description: "تشخيص الأعطال، الصيانة التنبؤية، ومساعد ذكي للدردشة";
    }];
};
export type AppGoalKey = (typeof APP_VISION.goals)[number]['key'];
