import { baseApi } from "./baseApi";
import type { ApiSuccess } from "../types/api";
import type { VoteRequest, VoteResponse } from "../types/answer";

export const votesApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    vote: builder.mutation<VoteResponse, VoteRequest>({
      query: ({ answerId, value }) => ({
        url: "vote",
        method: "POST",
        body: { answerId, value },
      }),
      transformResponse: (response: ApiSuccess<VoteResponse>) => response.data,
      // questionId is not sent to the API — it only targets the active detail query.
      invalidatesTags: (_result, _error, { questionId }) => [{ type: "Question", id: questionId }],
    }),
  }),
});

export const { useVoteMutation } = votesApi;
