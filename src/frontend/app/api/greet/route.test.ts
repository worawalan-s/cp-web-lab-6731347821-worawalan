/**
 * @jest-environment node
 */
import { NextRequest } from "next/server";
import { GET } from "./route";

describe("GET /api/greet", () => {
  beforeEach(() => {
    global.fetch = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("forwards the name query param to the backend and returns its message", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Hello, Ann!" }),
    });

    const request = new NextRequest("http://localhost:3000/api/greet?name=Ann");
    const response = await GET(request);
    const body = await response.json();

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.BACKEND_URL}/greet?name=Ann`,
    );
    expect(body).toEqual({ message: "Hello, Ann!" });
  });

  it("omits the query string when no name is provided", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ message: "Hello, friend!" }),
    });

    const request = new NextRequest("http://localhost:3000/api/greet");
    await GET(request);

    expect(global.fetch).toHaveBeenCalledWith(
      `${process.env.BACKEND_URL}/greet`,
    );
  });

  it("returns an error payload when the backend request fails", async () => {
    (global.fetch as jest.Mock).mockResolvedValueOnce({
      ok: false,
      status: 502,
    });

    const request = new NextRequest("http://localhost:3000/api/greet?name=Ann");
    const response = await GET(request);
    const body = await response.json();

    expect(response.status).toBe(502);
    expect(body).toEqual({ message: "Request failed" });
  });
});