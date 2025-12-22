const allowedOrigins = [
    "http://localhost:5173",
];

const corsOptions = {
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("CORS not allowed!"));
        }
    },
    credentials: true,
    optionsSuccessStatus: 200
};

export default corsOptions;
