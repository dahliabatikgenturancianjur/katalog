import {} from 'hono'

declare module 'hono' {
  interface Env {
    Bindings: {
      DB: D1Database;
      JWT_SECRET: string;
      CLOUDINARY_CLOUD_NAME: string;
      CLOUDINARY_API_KEY: string;
      CLOUDINARY_API_SECRET: string;
    }
  }
}
