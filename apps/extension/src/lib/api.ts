import axios from "axios"

import { logger } from "./logger"
import { storage } from "./storage"

export const getApi = async () => {
  const api = axios.create({
    baseURL: `${process.env.PLASMO_PUBLIC_BACKEND_URL}/api/`,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${await storage.get("access_token")}`
    }
  })

  api.interceptors.request.use(async (config) => {
    const token = await storage.get("access_token")
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config
      if (
        error.response &&
        error.response.status === 401 &&
        !originalRequest._retry &&
        originalRequest.url !== "/user/refresh"
      ) {
        logger.info("Initial request failed, refreshing token")
        originalRequest._retry = true
        try {
          const response = await api.post<{
            accessToken: string
            refreshToken: string
          }>("/user/refresh")

          if (!response) {
            throw new Error("Failed to refresh token")
          }

          await storage.set("access_token", response.data.accessToken)
          await storage.set("refresh_token", response.data.refreshToken)

          originalRequest.headers["Authorization"] =
            `Bearer ${response.data.accessToken}`
          logger.info(
            "Token refreshed, retrying request to",
            originalRequest.url
          )
          return api(originalRequest)
        } catch (error) {
          logger.error("Failed to refresh token:", error)
          await storage.remove("access_token")
          await storage.remove("refresh_token")
        }
      }

      return Promise.reject(error)
    }
  )

  return api
}
