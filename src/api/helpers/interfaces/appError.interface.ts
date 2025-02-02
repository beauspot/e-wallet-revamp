interface AppErrorInterface extends Error {
    status?: string;
    isOperational?: boolean;
    statusCode?: number;
};

interface AppErrorConstructor {
    new(messae: string, status?: string, isOperational?: boolean, statusCode?: number):AppErrorInterface
};

declare global {
    var AppError: AppErrorConstructor;
}

export {
    AppErrorInterface
}