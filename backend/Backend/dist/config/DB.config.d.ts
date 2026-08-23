declare const _default: (() => {
    type: string;
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    url: string | undefined;
    synchronize: boolean;
    autoLoadEntities: boolean;
}) & import("@nestjs/config").ConfigFactoryKeyHost<{
    type: string;
    host: string | undefined;
    port: number;
    username: string | undefined;
    password: string | undefined;
    database: string | undefined;
    url: string | undefined;
    synchronize: boolean;
    autoLoadEntities: boolean;
}>;
export default _default;
