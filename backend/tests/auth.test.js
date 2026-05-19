import request from "supertest";
import mongoose from "mongoose";
import { app } from "../src/app.js";

import "./setup.js";

describe("Auth smoke", () => {
  it("register -> returns token + user", async () => {
    const res = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
    expect(res.body).toHaveProperty("user");
    expect(res.body.user).toHaveProperty("email", "test@example.com");
  });

  it("login -> returns token", async () => {
    await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const res = await request(app).post("/api/auth/login").send({
      email: "test@example.com",
      password: "password123",
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("token");
  });

  it("GET /auth/me requires token", async () => {
    const reg = await request(app).post("/api/auth/register").send({
      username: "testuser",
      email: "test@example.com",
      password: "password123",
    });

    const token = reg.body.token;
    expect(token).toBeTruthy();

    const me = await request(app)
      .get("/api/auth/me")
      .set("Authorization", `Bearer ${token}`);

    expect(me.status).toBe(200);
    expect(me.body).toHaveProperty("email", "test@example.com");
  });

  it("db is connected (sanity)", async () => {
    expect(mongoose.connection.readyState).toBe(1);
  });
});

