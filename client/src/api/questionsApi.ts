import { baseApi } from "./baseApi";
import type { ApiSuccess } from "../types/api";
import type {
  CreateQuestionRequest,
  CreateQuestionResponse,
  GetQuestionAnswerResponse,
  GetQuestionsResponse,
} from "../types/question";

export const questionsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getQuestions: builder.query<GetQuestionsResponse, void>({
      query: () => "getQuestions",
      transformResponse: (response: ApiSuccess<GetQuestionsResponse>) => response.data,
      providesTags: (result) =>
        result
          ? [
              ...result.questions.map(({ id }) => ({ type: "Question" as const, id })),
              { type: "Question" as const, id: "LIST" },
            ]
          : [{ type: "Question" as const, id: "LIST" }],
    }),

    getQuestionAnswer: builder.query<GetQuestionAnswerResponse, string>({
      query: (questionId) => ({
        url: "getQuestionAnswer",
        params: { questionId },
      }),
      transformResponse: (response: ApiSuccess<GetQuestionAnswerResponse>) => response.data,
      providesTags: (_result, _error, questionId) => [{ type: "Question", id: questionId }],
    }),

    createQuestion: builder.mutation<CreateQuestionResponse, CreateQuestionRequest>({
      query: (body) => ({
        url: "createQuestion",
        method: "POST",
        body,
      }),
      transformResponse: (response: ApiSuccess<CreateQuestionResponse>) => response.data,
      // A new question invalidates the cached list so it refetches with the new item included.
      invalidatesTags: [{ type: "Question", id: "LIST" }],
    }),
  }),
});

export const { useGetQuestionsQuery, useGetQuestionAnswerQuery, useCreateQuestionMutation } =
  questionsApi;
