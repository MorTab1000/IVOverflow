import { baseApi } from "./baseApi";
import type { ApiSuccess } from "../types/api";
import type { LoginRequest, LoginResponseData } from "../types/auth";
import type { User } from "../types/user";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<LoginResponseData, LoginRequest>({
      query: (credentials) => ({
        url: "login",
        method: "POST",
        body: credentials,
      }),
      transformResponse: (response: ApiSuccess<LoginResponseData>) => response.data,
    }),

    userInfo: builder.query<User, void>({
      query: () => "userInfo",
      transformResponse: (response: ApiSuccess<User>) => response.data,
    }),
  }),
});

export const { useLoginMutation, useUserInfoQuery, useLazyUserInfoQuery } = authApi;
