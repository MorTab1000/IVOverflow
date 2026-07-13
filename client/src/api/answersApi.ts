import { baseApi } from "./baseApi";
import type { ApiSuccess } from "../types/api";
import type { CreateAnswerRequest, CreateAnswerResponse } from "../types/answer";

export const answersApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createAnswer: builder.mutation<CreateAnswerResponse, CreateAnswerRequest>({
      query: (body) => ({
        url: "answer",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccess<CreateAnswerResponse>) => response.data,
      // Refetch the active getQuestionAnswer query for this question so the
      // detail page list updates without a full page reload.
      invalidatesTags: (_result, _error, { questionId }) => [{ type: "Question", id: questionId }],
    }),
  }),
});

export const { useCreateAnswerMutation } = answersApi;
