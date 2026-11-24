import swaggerJsdoc from "swagger-jsdoc";

const PORT = process.env.PORT || 8899;

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "API CRUD Transaksi & Supabase",
      version: "1.0.0",
      description:
        "Dokumentasi interaktif RESTful API untuk CRUD Transaksi, Autentikasi JWT, dan Keep-Alive Supabase PostgreSQL.",
    },
    servers: [
      {
        url: process.env.API_BASE_URL || `http://localhost:${PORT}`,
        description: process.env.API_BASE_URL
          ? "Server Production"
          : "Server Lokal",
      },
    ],
    components: {
      securitySchemes: {
        BearerAuth: {
          type: "http",
          scheme: "bearer",
          bearerFormat: "JWT",
          description:
            "Masukkan access token JWT Anda di sini. Format: Bearer <token>",
        },
      },
      schemas: {
        Transaction: {
          type: "object",
          properties: {
            id: { type: "string", example: "1" },
            user_id: { type: "string", nullable: true, example: "1" },
            title: { type: "string", example: "Beli Bahan Baku" },
            amount: { type: "number", example: 150000.5 },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              example: "EXPENSE",
            },
            category: { type: "string", example: "Operasional" },
            description: {
              type: "string",
              nullable: true,
              example: "Pembelian barang kebutuhan toko",
            },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-11-24T10:00:00.000Z",
            },
            created_at: { type: "string", format: "date-time" },
            updated_at: { type: "string", format: "date-time" },
          },
        },
        CreateTransactionInput: {
          type: "object",
          required: ["title", "amount", "type"],
          properties: {
            title: { type: "string", example: "Gaji Bulanan" },
            amount: { type: "number", minimum: 0.01, example: 5000000 },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              example: "INCOME",
            },
            category: { type: "string", example: "Salary" },
            description: {
              type: "string",
              example: "Pemasukan gaji bulanan kerja",
            },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-11-24T10:00:00.000Z",
            },
          },
        },
        UpdateTransactionInput: {
          type: "object",
          properties: {
            title: { type: "string", example: "Gaji Bulanan (Bonus)" },
            amount: { type: "number", minimum: 0.01, example: 5500000 },
            type: {
              type: "string",
              enum: ["INCOME", "EXPENSE"],
              example: "INCOME",
            },
            category: { type: "string", example: "Salary" },
            description: {
              type: "string",
              example: "Penambahan bonus lembur",
            },
            date: {
              type: "string",
              format: "date-time",
              example: "2026-11-24T10:00:00.000Z",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/**/*.routes.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

export default swaggerSpec;
